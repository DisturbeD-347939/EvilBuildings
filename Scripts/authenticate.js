//File management
var fs = require('fs');

//APIs
const Snoowrap = require('snoowrap'); //Reddit
var Twit = require('twit'); //Twitter

module.exports =
{
    run: function(keyPath, callback)
    {
        //Keys for authentication
        var Credentials = fs.readFileSync(keyPath, 'utf-8');
        var ParsedCredentials = JSON.parse(Credentials);
        console.log(ParsedCredentials.twitter[3].name + " SUCCESS");

        //Authenticate Reddit API
        var r = new Snoowrap
        ({
            userAgent: 'EvilBuildings',
            clientId: ParsedCredentials.reddit[0].client_id,
            clientSecret: ParsedCredentials.reddit[0].client_secret,
            username: ParsedCredentials.reddit[0].username,
            password: ParsedCredentials.reddit[0].password
        });

        //Authentication into Twitter
        var t = new Twit
        ({
            consumer_key: ParsedCredentials.twitter[3].consumer_key,
            consumer_secret: ParsedCredentials.twitter[3].consumer_secret,
            access_token: ParsedCredentials.twitter[3].access_token_key,
            access_token_secret: ParsedCredentials.twitter[3].access_token_secret
        });

        callback(r, t);
    }
}