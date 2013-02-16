var xisbn = require('../index');
var nock = require('nock');
var fs = require('fs');
exports['testConstructorArgumentDependencies'] = function(test)
{
    var options = {token:'fooBar'};

    test.throws(function(){ new xisbn.Client(options)}, Error, "token option must also include secret option and request_ip option");

    options.secret = 'foobaz';

    test.throws(function(){ new xisbn.Client(options)}, Error, "token option must also include secret option and request_ip option");

    options.request_ip = '127.0.0.1';

    test.doesNotThrow(function(){ new xisbn.Client(options)});
    test.done();
};

exports['testTokenAccess'] = function(test)
{

    // hash should be e0842a16071b04e7cfb2152643085d53
    var scope = nock('http://xisbn.worldcat.org')
                    .get('/webservices/xid/isbn/9789004215153?method=getEditions&fl=*&format=json&token=fooBar&hash=e0842a16071b04e7cfb2152643085d53').reply('200', {});

    var client = new xisbn.Client({token:'fooBar',secret:'foobaz',request_ip:'127.0.0.1'});

    test.doesNotThrow(function() {client.getEditions('9789004215153', function(err, eds){}); });

    // hash should be e23de8a7a16d279b90a207cb122e4eaf
    var scope = nock('http://xisbn.worldcat.org')
                    .get('/webservices/xid/isbn/9789004215153?method=getEditions&fl=*&format=json&token=fooBar&hash=e23de8a7a16d279b90a207cb122e4eaf').reply('200', {});

    var client = new xisbn.Client({token:'fooBar',secret:'bazbar',request_ip:'999.999.9.99'});

    test.doesNotThrow(function() {client.getEditions('9789004215153', function(err, eds){}); });
    test.done();
}

exports['testGetEditions'] = function(test)
{
    var json;
    fs.readFile('./fixtures/getEditions-9789004215153.json', 'utf-8', function(err, data) {
        var scope = nock('http://xisbn.worldcat.org')
                        .get('/webservices/xid/isbn/9789004215153?method=getEditions&fl=*&format=json').reply('200', data);

        var client = new xisbn.Client();

        client.getEditions('9789004215153', function(err, eds)
        {
            test.equal(2, eds.length);
            test.equal("http://www.worldcat.org/oclc/748576725?referer=xid", eds[0].url[0]);
            test.equal("http://www.worldcat.org/oclc/769190415?referer=xid", eds[1].url[0]);
            test.done();
        });
    });
}

exports['testUnknownId'] = function(test)
{
    var json;
    fs.readFile('./fixtures/getEditions-9781283919470.json', 'utf-8', function(err, data) {
        var scope = nock('http://xisbn.worldcat.org')
                        .get('/webservices/xid/isbn/9781283919470?method=getEditions&fl=*&format=json').reply('200', data);

        var client = new xisbn.Client();

        client.getEditions('9781283919470', function(err, eds)
        {
            test.ok(err instanceof Error);
            test.equal("unknownId", err.message);
            test.ok(typeof eds === 'undefined');
            test.done();
        });
    });
}

exports['testGetMetadata'] = function(test)
{
    var json;
    fs.readFile('./fixtures/getMetadata-0393927393.json', 'utf-8', function(err, data) {
        var scope = nock('http://xisbn.worldcat.org')
                        .get('/webservices/xid/isbn/0393927393?method=getMetadata&fl=*&format=json').reply('200', data);

        var client = new xisbn.Client();

        client.getMetadata('0393927393', function(err, ed)
        {
            test.ok(err === null);
            test.ok(ed instanceof Object);
            test.equal("The Norton anthology of American literature", ed.title);
            test.equal("7th ed.", ed.ed);
            test.done();
        });
    });
}