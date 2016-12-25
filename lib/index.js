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

// setup all HTTP and HTTPS proxies
bedrock.events.on('bedrock.admin.init', setupProxies);

function setupProxies() {
  // create the HTTP and HTTPS proxies
  var httpProxy = proxy.createServer();
  var httpsProxy = proxy.createServer({
    secure: false,
    ssl: {
      SNICallback: config.server.https.options.SNICallback
    }
  });

  // proxy all HTTP requests
  server.servers.http.on('request', function(req, res) {
    var targetHost = config.loadbalancer.httpRoutes[req.headers.host];

    if(!targetHost) {
      res.writeHead(404, {'Content-Type': 'text/plain'});
      return res.end('Load balancer cannot find host: '+ req.headers.host);
    }

    // proxy the HTTP traffic to the appropriate host
    httpProxy.web(req, res, {
      target: {
        host: targetHost,
        port: 80
      }
    }, function(err) {
      logger.error('load balancer failure for', req.headers.host, err);
    });
  });

  // proxy all HTTPS requests
  server.servers.https.on('request', function(req, res) {
    var targetHost = config.loadbalancer.httpsRoutes[req.headers.host];

    if(!targetHost) {
      res.writeHead(404, {'Content-Type': 'text/plain'});
      return res.end('Load balancer cannot find host: '+ req.headers.host);
    }

    // proxy the HTTPS traffic to the appropriate host
    httpsProxy.web(req, res, {
      target: {
        host: targetHost,
        port: 443
      }
    }, function(err) {
      logger.error('load balancer failure for', req.headers.host, err);
    });
  });
}
