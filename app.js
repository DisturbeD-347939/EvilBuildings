//Require scripts
var setup = require('./Scripts/setup.js');
var auth = require('./Scripts/authenticate.js');
var r = require('./Scripts/reddit.js');
var t = require('./Scripts/twitter.js');

//File management
var fs = require('fs')

//Get config file variables
var keyPath = 'keys.json';
var get_posts, posts_per_day;
var configFile;
var configData;

setImmediate(function()
{
    configFile = fs.readFileSync('./config.json');
    configData = JSON.parse(configFile);
})

setTimeout(function()
{
    console.log(configData);
    keyPath = configData.config[0].keys_path;
    get_posts = configData.reddit[0].retrieve_posts_every_x_hours;
    posts_per_day = configData.twitter[0].tweets_per_day;
},1000);


//Variables
var timer_posting = (((24 / posts_per_day) * 60) * 60) * 1000; //calculate posting time in milliseconds
var timer_get_posts = ((get_posts * 60) * 60) * 1000; //calculate retrieving posts time in milliseconds
posts_per_day += 4; //Ignore first post (rules and text) and add an extra one just in case

setTimeout(run, 2000);

function run()
{
    setup.run(function(data)
    {
        function setVariables(callback)
        {
            console.log("Setting variables");
            postNumber = data[0];
            countries = data[1];
            callback();
        }
        //Set variables then run config then run auth
        setVariables(function()
        {
            console.log("Variables SUCCESS");
            //Authenticate keys
            auth.run(keyPath, function(data)
            {
                console.log("AUTH SUCCESS");
                r.collect(data[0], configData.reddit[0].subreddit, posts_per_day, postNumber, function()
                {
                    setTimeout(prepareTweet, 5000);

                    function prepareTweet()
                    {
                        t.post(data[1], function()
                        {
                            console.log("Posted SUCCESS");
                            console.log("Starting intervals");
                            setInterval(() => r.collect(data[0], configData.reddit[0].subreddit, posts_per_day, postNumber, function(){}), timer_get_posts);
                            setInterval(() => t.post(data[1], function(){}), timer_posting);
                        })
                    }
                })
            });
        });
    });
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