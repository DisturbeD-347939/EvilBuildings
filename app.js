const { CommentStream } = require("snoostorm");
require('dotenv').config();

const Snoowrap = require('snoowrap');
const Snoostorm = require('snoostorm');
var fs = require('fs');

//Keys for authentication
var Credentials = fs.readFileSync('C:\\Users\\Ricar\\Desktop\\Etc\\Keys.json', 'utf-8');
var ParsedCredentials = JSON.parse(Credentials);

var posts_per_day = 6;

const reddit = new Snoowrap({
    userAgent: 'EvilBuildings',
    clientId: ParsedCredentials.reddit[0].client_id,
    clientSecret: ParsedCredentials.reddit[0].client_secret,
    username: ParsedCredentials.reddit[0].username,
    password: ParsedCredentials.reddit[0].password
});

reddit.getSubreddit('evilbuildings', posts_per_day).getHot().then(posts => {
    for(var i = 1; i < posts_per_day; i++)
    {
        console.log(posts[i].title);
        console.log(posts[i].url);
    }  
})