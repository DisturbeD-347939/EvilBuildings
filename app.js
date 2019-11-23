//Require scripts
var setup = require('./Scripts/setup.js');
var auth = require('./Scripts/authenticate.js');

//File management
var fs = require('fs')
var request = require('request');
var fsE = require('fs-extra');
var rimraf = require('rimraf');

//MODIFY THESE TO YOUR LIKING
var get_posts_every_x_hours = 24;
var posts_per_day = 6;

//Variables
var timer_posting = (((24 / posts_per_day) * 60) * 60) * 1000;
var timer_get_posts = ((get_posts_every_x_hours * 60) * 60) * 1000;
posts_per_day += 2; //Ignore first post and add an extra one just in case

var reddit, twitter;
var postNumber, keyLocation, countries;

//Retrieving functions data
setup.run(function(data)
{
    console.log(data);
    postNumber = data[0];
    keyLocation = data[1];
    countries = data[2];
});

//Timeouts
setImmediate(checkPath);
setTimeout(authenticateAPIs, 3000);
//setTimeout(collectRedditPosts, 5000);
//setTimeout(prepareTweet, 8000);

//Gets the path to the keys file
function checkPath()
{
    if(keyLocation == null)
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