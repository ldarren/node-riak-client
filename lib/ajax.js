/*
* @author: Darren Liew
* @date: 6/July/2012
*/
var
util =require('util'),
http = require('http');

module.exports = function(option, params, cb){
    switch(option.method.toLowerCase()){
        case 'put':
        case 'post':
            var
            headers = option.headers;
            headers['Content-length'] = params.length;
            headers['Connection'] = 'keep-alive';
            break;
        case 'get':
        case 'delete':
            option.path += '?' + params;
            params = null;
            break;
        default:
            return cb('no method');
    }
    var req = http.request(option);
    if (!req) return cb('create request error');
    req.end(params);
    if (cb){
        req
        .on('response', function(res){
            var headers = res.headers;
            if (0 == headers['content-length']){
                cb(null, headers);
            }else{
                res.on('data', function(body){
                    cb(null, headers, body);
                });
            }
        })
        .on('error',cb);
    }
}
