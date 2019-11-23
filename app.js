//Reddit API
const Snoowrap = require('snoowrap');

//Twitter API
var Twit = require('twit');

//File management
var fs = require('fs'), request = require('request');
var fsE = require('fs-extra');
var rimraf = require('rimraf');

//MODIFY THESE TO YOUR LIKING
var get_posts_every_x_hours = 24;
var posts_per_day = 6;
var keyLocation = 'default';

//Variables
var postNumber = 0;
var timer_posting = (((24 / posts_per_day) * 60) * 60) * 1000;
var timer_get_posts = ((get_posts_every_x_hours * 60) * 60) * 1000;
posts_per_day += 2; //Ignore first post and add an extra one just in case
var reddit, twitter;
var countries = [];

//Timeouts
setImmediate(setup);
setImmediate(checkPath);
//setTimeout(authenticateAPIs, 1000);
//setTimeout(collectRedditPosts, 5000);
//setTimeout(prepareTweet, 8000);

//Gets the path to the keys file
function checkPath()
{
    if(keyLocation == 'default')
    {
        setTimeout(checkPath,100);
    }
    else
    {
        result = authenticateAPIs();
        reddit = result[0];
        twitter = result[1];
    }
}

//Intervals
setInterval(prepareTweet, timer_posting);
setInterval(collectRedditPosts, timer_get_posts);


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
    if(!fs.existsSync('./Used'))
    {
        fs.mkdirSync('./Used');
        console.log("Created used folder!");
    }
    else 
    {
        console.log("Used folder checked...");
    }
    if(!fs.existsSync('./Posts/Counter.txt'))
    {
        fs.writeFileSync('./Posts/Counter.txt', 1);
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
    fs.readFile('path.txt', 'utf8', function(err, data) 
    {
        if (err) throw err;
        keyLocation = data;
        console.log(keyLocation);
    });

    });
}

function authenticateAPIs()
{
    //Keys for authentication
    var Credentials = fs.readFileSync(keyLocation, 'utf-8');
    var ParsedCredentials = JSON.parse(Credentials);
    console.log(ParsedCredentials.twitter[3].name + " being used to post!");

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
    return [r, t];
}

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
    console.log(reddit);
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
            if(fileFormat[0] != "c" && fileFormat[1] != "o" && fileFormat[2] != "m")
            {
                download(posts[i].url, './Posts/' + postNumber + '/image.' + fileFormat, function(){});

                console.log("Post " + i + " created!");
            }
            else
            {
                console.log("Wrong format on " + i);
                rimraf('./Posts/' + i, function () { console.log('Directory ' + i + " deleted!"); });
            }

            //Increment the post number
            postNumber++;
        }  
    })
    fs.writeFileSync('./Posts/Counter.txt', postNumber);
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
    fs.readFile('./Posts/' + posts[0] + '/' + post[1], 'utf8', function(err, data) 
    {
        title = data;
    });
    setTimeout(() => postTweet(image, title, posts[0]), 2000);
}

function postTweet(image, title, post)
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
                    setTimeout(() => moveUsedPost(post), 100);
                }
            });

      }
      else
      {
          console.log(error);
      }
    });
}

function moveUsedPost(post)
{
    fsE.move('./Posts/' + post + '/', './Used/' + post + '/', err =>
    {
        if(err)
        {
            console.log(err);
        }
        else
        {
            console.log("Moved to used tweets folder");
        }
    })
}