var request = require("request");
var Client = function(options)
{
    var _location = "http://xisbn.worldcat.org/webservices/xid/isbn";
    var _affiliate_id;
    var _access_token;
    var _secret;
    var _request_ip;

    if(typeof options === 'object')
    {
        for(o in options)
        {
            switch(o)
            {
                case 'location':
                    _location = options[o];
                    break;
                case 'affiliate_id':
                    _affiliate_id = options[o];
                    break;
                case 'token':
                    _access_token = options[o];
                    if(!(options.secret && options.request_ip))
                    {
                        throw new Error("token option must also include secret option and request_ip option");
                    }
                    break;
                case 'secret':
                    _secret = options[o];
                    break;
                case 'request_ip':
                    _request_ip = options[o];
                    break;
            }
        }
    }

    var getEditions = function(isbn, callback) {
        buildURL(isbn, 'getEditions', function(url) {
            getListRequest(url, callback);
        });
    }

    var buildURL = function(isbn, method, callback)
    {
        var base = _location + "/" + isbn;
        var url = base + "?method=" + method + "&fl=*&format=json";
        if(_affiliate_id)
        {
            url = url + "&ai=" + encodeURIComponent(_affiliate_id);
        }
        if(_access_token)
        {
            var crypto = require('crypto');
            var md5 = crypto.createHash('md5');
            // requestURL+"|"+requestIPaddress+"|"+secret
            md5.update(base + "|" + _request_ip + "|" + _secret);
            url = url + "&token=" + encodeURIComponent(_access_token) + "&hash=" + encodeURIComponent(md5.digest('hex'));
        }
        callback(url);
    }

    var getListRequest = function(url, callback)
    {
        request.get({url: url, json: true}, function (error, response, editions) {

            var records = [];
            for (i in editions.list) {

                records.push(editions.list[i]);

            }

            callback(records);

        });
    }

    this.getEditions = function(isbn, callback) { getEditions(isbn, callback); }

    var getMetadata = function(isbn, callback) {
        buildURL(isbn, 'getMetadata', function(url) {
            getListRequest(url, function(records) {
                callback(records[0]);
            });
        });
    }

    this.getMetadata = function(isbn, callback) { getMetadata(isbn, callback); }

    var to13 = function(isbn, callback) {}

    var to10 = function(isbn, callback) {}
}

module.exports = function(options) {
    return new Client(options);
};