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

Put
===
```javascript
riak.put(CLIENT_ID, BUCKET, KEY, OPTION, function(err, xhr){
});

```

Delete
======
```javascript
riak.put(CLIENT_ID, BUCKET, KEY, OPTION, function(err, xhr){
});

```

Map Reduce
==========
```javascript
riak.query(CLIENT_ID).add(PHASE, TASK).add(PHASE, TASK).exec(function(err, xhr){
});
```
