//Reddit API
const Snoowrap = require('snoowrap');

//Twitter API
var Twit = require('twit');

//File management
var fs = require('fs'), request = require('request');

//Keys for authentication
var Credentials = fs.readFileSync('C:\\Users\\Ricar\\Desktop\\Etc\\Keys.json', 'utf-8');
var ParsedCredentials = JSON.parse(Credentials);

//Variables
var posts_per_day = 6;
var postNumber = 0;

//Timeouts & Intervals
setTimeout(setup, 0);
setTimeout(prepareTweet, 1000);
//setTimeout(collectRedditPosts, 1000);
//setInterval(collectRedditPosts, 86400000);

//Setting up the program to run
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

//Authenticate Reddit API
const reddit = new Snoowrap
({
    userAgent: 'EvilBuildings',
    clientId: ParsedCredentials.reddit[0].client_id,
    clientSecret: ParsedCredentials.reddit[0].client_secret,
    username: ParsedCredentials.reddit[0].username,
    password: ParsedCredentials.reddit[0].password
});

//Authentication into Twitter
var twitter = new Twit
({
    consumer_key: ParsedCredentials.twitter[0].consumer_key,
    consumer_secret: ParsedCredentials.twitter[0].consumer_secret,
    access_token: ParsedCredentials.twitter[0].access_token_key,
    access_token_secret: ParsedCredentials.twitter[0].access_token_secret
});

//Downloading urls from the web
var download = function(uri, filename, callback)
{
    request.head(uri, function(err, res, body)
    {
        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};

//Download and organize reddit posts from r/evilbuildings
function collectRedditPosts()
{
    reddit.getSubreddit('evilbuildings', posts_per_day).getHot().then(posts => 
    {
        for(var i = 1; i < posts_per_day; i++)
        {
            console.log("Creating post " + i);

            //Create post folder
            fs.mkdirSync('./Posts/' + postNumber);
            if(fs.existsSync('./Posts/' + postNumber))
            {
                //Add the title to a txt file
                fs.writeFileSync('./Posts/' + postNumber + '/title.txt', posts[i].title);
            }

            //Check file format
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

            //Reverse string
            fileFormat = fileFormat.split("");
            fileFormat = fileFormat.reverse();
            fileFormat = fileFormat.join("");

            //Download the photo
            download(posts[i].url, './Posts/' + postNumber + '/image.' + fileFormat, function(){});

            console.log("Post " + i + " created!");

            //Increment the post number
            postNumber++;
        }  
    })
}

//Post photo and title to twitter
function prepareTweet()
{
    //Check which one is the oldest post and collect it's image and title
    var posts = fs.readdirSync('./Posts');
    var post = fs.readdirSync('./Posts/' + posts[0]);
    var image = fs.readFileSync("./Posts/" + posts[0] + "/" + post[0], { encoding: 'base64' });
    var title = "Daily Post"

    //Read title
    console.log('./Posts/' + posts[0] + '/' + post[1]);
    fs.readFile('./Posts/' + posts[0] + '/' + post[1], 'utf8', function(err, data) 
    {
        title = data;
    });
    setTimeout(() => postTweet(image, title), 2000);
}

function postTweet(image, title)
{
    // Make post request to Twitter
    twitter.post('media/upload', {media: image}, function(error, media, response) 
    {

        if (!error) 
        {
            //Prepare the tweet
            var status = 
            {
                status: title,
                media_ids: media.media_id_string
            }

            //Post the tweet
            twitter.post('statuses/update', status, function(error, tweet, response) 
            {
                if (error) 
                {
                    console.log(error);
                }
                else
                {
                    console.log("Tweet posted!");
                }
            });

      }
      else
      {
          console.log(error);
      }
    });
    return;
}

}