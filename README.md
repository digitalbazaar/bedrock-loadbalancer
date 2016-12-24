# bedrock-loadbalancer

A Bedrock module that provides automatic HTTPS-enabled loadbalancing services.

## Quick Examples

```
npm install bedrock-loadbalancer bedrock-letsencrypt bedrock bedrock-server bedrock-express
```

Create a basic Bedrock application server:

```js
var bedrock = require('bedrock');
var config = require('bedrock').config;

// modules
require('bedrock-server');
require('bedrock-express');
require('bedrock-letsencrypt');
require('bedrock-loadbalancer');

// config
config.server.port = 443;
config.server.httpPort = 80;
config.server.bindAddr = ['lb-1.example.com'];
config.server.domain = 'lb-1.example.com';
config.server.host = 'lb-1.example.com';
config.server.baseUri = 'https://' + config.server.host;

config.loadbalancer.httpRoutes = {
  'unsecured.example.com': '192.168.0.50'
}

config.loadbalancer.httpsRoutes = {
  'secured.example.com': '192.168.0.51'
}

config.letsencrypt.domains = ['secured.example.com'];
config.letsencrypt.email = 'admin@example.com';
config.letsencrypt.redisOptions = {
  db: 1,
  password: 'REDIS_PASSWORD'
};

// setup landing page
bedrock.events.on('bedrock-express.configure.routes', function(app) {
  app.get('/', function(req, res) {
    res.send('Hello Bedrock Loadbalancer!');
  });
});

bedrock.start();
```

Run the application above on any host with public access to the Web.
You need to ensure that at least ports 80 and 443 are available on
the public Internet because the Let's Encrypt servers will attempt
to contact your host during the certificate issuance process.

## Configuration

For documentation on this module's configuration, see
[config.js](./lib/config.js).

You will need to setup a Redis server to store the accounts, keypairs, and
certificates for all domains behind the load balancer. More on Redis
configuration options can be found in the
[Redis configuration options](http://redis.js.org/#api-rediscreateclient).

## Requirements

- node v4.4+
- npm 3+
