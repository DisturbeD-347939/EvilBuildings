const Snoowrap = require('snoowrap');
const Snoostorm = require('snoostorm');
var fs = require('fs');

//Keys for authentication
var Credentials = fs.readFileSync('C:\\Users\\Ricar\\Desktop\\Etc\\Keys.json', 'utf-8');
var ParsedCredentials = JSON.parse(Credentials);

const r = new Snoowrap({
    userAgent: 'reddit-bot-example-node',
    clientId: ParsedCredentials.reddit[0].client_id,
    clientSecret: ParsedCredentials.reddit[0].client_secret,
    username: ParsedCredentials.reddit[0].username,
    password: ParsedCredentials.reddit[0].password
});

setTimeout(test, 0);

function test()
{
    console.log(r.clientId);
}