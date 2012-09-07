var
ajax = require('./ajax'),
pool = [{host:'127.0.0.1',port:8091}],
poolIndex = 0;

const
BUCKET = 'BUCKET',
KEY = 'KEY',
RIAK = 'riak?buckets=true',
RIAK_BUCKET = '/riak/BUCKET?keys=true&props=false',
RIAK_BUCKET_KEY = '/riak/BUCKET/KEY';

function getOption(clientId, method, path, headers){
    poolIndex = (poolIndex + 1) % pool.length;
    var
    domain = pool[poolIndex],
    headers = headers || {};
    
    headers['content-type'] = 'application/json';
    headers['X-Riak-ClientId'] = clientId;
    return {host:domain.host, port:domain.port, path:path, method:method, headers:headers};
}

exports.configure = function(urls){
    pool = urls;
    poolIndex = 0;
};

exports.get = function(clientId, bucket, key, cb){
    var path;
    switch(arguments.length){
        case 2:
            cb = bucket;
            path = RIAK;
            break;
        case 3:
            cb = key;
            path = RIAK_BUCKET.replace(BUCKET, bucket);
            break;
        default:
            path = RIAK_BUCKET_KEY.replace(BUCKET, bucket).replace(KEY, key);
            break;
    }
    ajax(getOption(clientId, 'get', path), '', cb);
};

exports.post = function(clientId, bucket, value, options, cb){
    var
    path = RIAK_BUCKET.replace(BUCKET, bucket),
    params = JSON.stringify(value);

    ajax(getOption(clientId, 'post', path, options), params, cb);
};

exports.put = function(clientId, bucket, key, value, options, cb){
    var
    path = RIAK_BUCKET_KEY.replace(BUCKET, bucket).replace(KEY, key),
    params = JSON.stringify(value);
    ajax(getOption(clientId, 'put', path, options), params, cb);
};

exports.del = function(clientId, bucket, key, cb){
    var
    path = RIAK_BUCKET_KEY.replace(BUCKET, bucket).replace(KEY, key);
    ajax(getOption(clientId, 'delete', path), '', cb);
};

/*
 * @targets: 'bucket' or [[bucket, key],[bucket, key]] or [[bucket, key, keyData],[bucket, key, keyData]]
 * @keyFilters: [["tokenize", "-", 1],["matches", "solutions"]]
 * @link: {bucket:bucket, tag:tag, keep:true}
 * @map: {src: funcStr, keep:true}
 * @reduce: {src: funcStr, keep:true}
 */
exports.mapred = function(clientId, targets, keyFilters, link, map, reduce, cb){
    if (!link && !map && !reduce) return cb();
    var
    body = { inputs: targets },
    query = [];
    if (keyFilters) body['key_filters'] = keyFilters;
    if (link) query.push({link:link});
    if (map) query.push({map:{language:"javascript", source: map.src, keep: map.keep}});
    if (reduce) query.push({reduce:{language:"javascript", source: reduce.src, keep: reduce.keep}});
    body['query'] = query;
console.log(body);
    ajax(getOption(clientId, 'post', '/mapred'), JSON.stringify(body), cb);
};

function Job(clientId){
    this.clientId = clientId;
}

Job.prototype.add = function(phase, task){
    var
    key,
    arr;
    switch(phase){
        case 'inputs':
            key = phase;
            arr = this[key] || [];
            arr.push(task);
            break;
        case 'key_filters':
            key = phase;
            arr = this[key] || [];
            arr.push(task);
            break;
        case 'link':
            key = 'query';
            arr = this[key] || [];
            arr.push({link:task});
            break;
        case 'map':
        case 'reduce':
            key = 'query';
            arr = this[key] || [];
            task.language = 'javascript';
            var obj = {};
            obj[phase] = task;
            arr.push(obj);
            break;
    }
    if (arr && arr.length) this[key] = arr;
console.log(phase, key, this);
    return this;
};

Job.prototype.exec = function(cb){
    var body = { inputs: 1 === this.inputs.length ? this.inputs[0] : this.inputs };

    if (this.key_filters && this.key_filters.length) body['key_filters'] = this.key_filters;
    if (this.link && this.link.length) body['link'] = this.link;
    if (this.query && this.query.length) body['query'] = this.query;
    ajax(getOption(this.clientId, 'post', '/mapred'), JSON.stringify(body), cb);
};

exports.query = function(clientId){
    var job = new Job(clientId);
    return job;
};
