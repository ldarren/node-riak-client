node-riak-client
================

A lightweight riak client for node.js

installation
============
npm install node-riak-client

configuration
=============
```javascript
var riak = require('node-riak-client');
riak.configure(<RIAK_SERVER_URLS>);
```

Get
===
```javascript
riak.get(CLIENT_ID, BUCKET, KEY, function(err, xhr){
});

```
