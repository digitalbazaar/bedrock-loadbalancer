/*
 * Bedrock run-time configurable load balancer module configuration
 *
 * Copyright (c) 2016 Digital Bazaar, Inc. All rights reserved.
 */
var async = require('async');
var bedrock = require('bedrock');

var BedrockError = bedrock.util.BedrockError;
var logger = bedrock.loggers.get('app');

require('./config');

// setup all HTTP and HTTPS proxies
bedrock.events.on('bedrock-express.configure.router', setupProxies);

function setupProxies(app) {

}
