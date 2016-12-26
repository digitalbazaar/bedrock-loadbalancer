/*
 * Bedrock run-time configurable load balancer module configuration
 *
 * Copyright (c) 2016 Digital Bazaar, Inc. All rights reserved.
 */
var async = require('async');
var bedrock = require('bedrock');
var config = bedrock.config;
var proxy = require('http-proxy');
var server = require('bedrock-server');
var url = require('url');

var logger = bedrock.loggers.get('app');

require('./config');

// HTTP and HTTPS proxies
var httpProxy;
var httpsProxy;

// setup all Let's Encrypt domains
bedrock.events.on('bedrock-cli.ready', function() {
  var domains = Object.keys(config.loadbalancer.domains);
  var secureDomains = [];
  async.each(domains, function(domain, callback) {
    var target = url.parse(domain);
    if(target.protocol === 'https:') {
      secureDomains.push(target.hostname);
    }
    callback();
  }, function() {
    config.letsencrypt.domains = secureDomains;
  });
});

// setup HTTP and HTTPS proxies
bedrock.events.on('bedrock.init', function() {
  // create the HTTP and HTTPS proxies
  httpProxy = proxy.createServer();
  httpsProxy = proxy.createServer({
    secure: false,
    ssl: {
      SNICallback: config.server.https.options.SNICallback
    }
  });
});

// turn off default redirection to HTTPS
bedrock.events.on('bedrock.ready', function() {
  server.servers.http.on('request', lbProxy);
});

// ensure load balancer is setup early in the middleware stack
bedrock.events.on('bedrock-express.init', function(app) {
  app.use(lbProxy);
});

// load balancing proxy middleware
var lbProxy = function(req, res, next) {
  var requestUrl = ((req.connection.encrypted) ? 'https://' : 'http://') +
   req.headers.host + '/';
  var targetHost = config.loadbalancer.domains[requestUrl];
  var protocolProxy = httpProxy;

  // ensure there is a target host to proxy to
  if(!targetHost) {
    res.writeHead(404, {'Content-Type': 'text/plain'});
    return res.end('Load balancer cannot find host: '+ requestUrl);
  }

  // use the HTTPS proxy if the connection is encrypted
  if(req.connection.encrypted) {
    protocolProxy = httpsProxy;
  }

  // proxy the connection
  protocolProxy.web(req, res, {target: targetHost}, function(err) {
    if(err) {
      logger.error(
        'load balancer failure for', requestUrl, '=>', targetHost, err);
      res.writeHead(404, {'Content-Type': 'text/plain'});
      res.end('Load balancer failure for: '+ requestUrl);
    }
  });
};
