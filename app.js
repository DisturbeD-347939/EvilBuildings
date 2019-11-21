const Snoowrap = require('snoowrap');
const Snoostorm = require('snoostorm');
var fs = require('fs'), request = require('request');
var rimraf = require("rimraf");

//Keys for authentication
var Credentials = fs.readFileSync('C:\\Users\\Ricar\\Desktop\\Etc\\Keys.json', 'utf-8');
var ParsedCredentials = JSON.parse(Credentials);
var postNumber = 0;

var posts_per_day = 6;

setTimeout(setup, 0);
setTimeout(collectRedditPosts, 1000);

function setup()
{
    //Check for the existence of the Posts folder
    console.log("Checking files...");
    if(!fs.existsSync('./Posts'))
    {
        fs.mkdirSync('./Posts');
        console.log("Created posts folder!");
    }
    else 
    {
        console.log("Posts folder checked...");
    }
    if(!fs.existsSync('./Posts/Counter.txt'))
    {
        fs.writeFileSync('./Posts/Counter.txt', 0);
        console.log("Created counter file!");
    }
    else
    {
        console.log("Counter file checked...");
    }

    //Read files
    fs.readFile('./Posts/Counter.txt', 'utf8', function(err, data) 
    {
        if (err) throw err;
        postNumber = data;
    });
    console.log(postNumber);
}

const reddit = new Snoowrap({
    userAgent: 'EvilBuildings',
    clientId: ParsedCredentials.reddit[0].client_id,
    clientSecret: ParsedCredentials.reddit[0].client_secret,
    username: ParsedCredentials.reddit[0].username,
    password: ParsedCredentials.reddit[0].password
});

var download = function(uri, filename, callback){
    request.head(uri, function(err, res, body){
      console.log('content-type:', res.headers['content-type']);
      console.log('content-length:', res.headers['content-length']);
  
      request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
  };

function collectRedditPosts()
{
    reddit.getSubreddit('evilbuildings', posts_per_day).getHot().then(posts => 
    {
        for(var i = 1; i < posts_per_day; i++)
        {
            fs.mkdirSync('./Posts/' + postNumber);
            if(fs.existsSync('./Posts/' + postNumber))
            {
                fs.writeFileSync('./Posts/' + postNumber + '/title.txt', posts[i].title);
            }
            var fileFormat = "";
            for(var j = posts[i].url.length - 1; j > 0; j--)
            {
                if(posts[i].url[j] != ".")
                {
                    fileFormat += posts[i].url[j];
                }
                else 
                {
                    break;
                }
            }
            fileFormat = fileFormat.split("");
            fileFormat = fileFormat.reverse();
            fileFormat = fileFormat.join("");
            console.log(fileFormat);

            download(posts[i].url, './Posts/' + postNumber + '/image.' + fileFormat);

            console.log(posts[i].url);
            postNumber++;
        }  
    })
}


/*download('https://www.google.com/images/srpr/logo3w.png', 'google.png', function(){
  console.log('done');
});*/

//setTimeout(collectRedditPosts, 2000);
//setInterval(collectRedditPosts, 86400);

