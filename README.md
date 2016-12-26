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

config.loadbalancer.domains = {
  'http://unsecure.example.org/': 'http://192.168.128.64/',
  'https://secure.example.org/': 'https://192.168.128.65/'
};

// set this to 'production' in a full production environment
config.letsencrypt.mode = 'staging';
// config.letsencrypt.domains is auto-generated from loadbalancer.domains
config.letsencrypt.email = 'domains@example.com';
config.letsencrypt.redisOptions = {
  db: 1,
  password: 'REDIS_PASSWORD'
};

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
