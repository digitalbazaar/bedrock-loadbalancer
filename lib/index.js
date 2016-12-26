/*
 * Bedrock run-time configurable load balancer module configuration
 *
 * Copyright (c) 2016 Digital Bazaar, Inc. All rights reserved.
 */
var async = require('async');
var bedrock = require('bedrock');
var config = bedrock.config;
var crypto = require('crypto');
var https = require('https');
var proxy = require('http-proxy');
var server = require('bedrock-server');

var BedrockError = bedrock.util.BedrockError;
var logger = bedrock.loggers.get('app');

require('./config');

// HTTP and HTTPS proxies
var httpProxy;
var httpsProxy;

// load balancing proxy middleware
var lbProxy = function(req, res, next) {
  var targetHost = config.loadbalancer.httpRoutes[req.headers.host] ||
    config.loadbalancer.httpsRoutes[req.headers.host];
  console.log('PROXY MW:', targetHost);

  if(!targetHost) {
    res.writeHead(404, {'Content-Type': 'text/plain'});
    return res.end('Load balancer cannot find host: '+ req.headers.host);
  }

  // handle HTTPS connections
  if(req.connection.encrypted) {
    // proxy the HTTPS traffic to the appropriate host
    return httpsProxy.web(req, res, {
      target: {
        host: targetHost,
        port: 9000
      }
    }, function(err) {
      logger.error('load balancer failure for', req.headers.host, err);
    });
  }

  // handle HTTP connections
  httpProxy.web(req, res, {
    target: {
      host: targetHost,
      port: 80
    }
  }, function(err) {
    logger.error('load balancer failure for', req.headers.host, err);
  });
};

// setup all HTTP and HTTPS proxies
bedrock.events.on('bedrock.admin.init', setupProxies);

bedrock.events.on('bedrock-express.init', function(app) {
  // FIXME: this isn't showing up as the first item in app._router.stack
  app.use(lbProxy);
});

bedrock.events.on('bedrock-express.ready', function(app) {
  // FIXME: this isn't showing up as the first item in app._router.stack
  console.log('EXPRESS MIDDLEWARE', app._router.stack);
});

function setupProxies() {
  // create the HTTP and HTTPS proxies
  httpProxy = proxy.createServer();
  httpsProxy = proxy.createServer({
    secure: false,
    ssl: {
      SNICallback: config.server.https.options.SNICallback
    }
  });
}
