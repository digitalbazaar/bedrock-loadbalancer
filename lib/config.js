/*
 * Bedrock run-time configurable load balancer module configuration
 *
 * Copyright (c) 2016 Digital Bazaar, Inc. All rights reserved.
 */
var config = require('bedrock').config;

config['loadbalancer'] = {
  // the HTTP-only routes to proxy
  httpRoutes: {},
  // the HTTPS routes to proxy
  httpsRoutes: {}
};
