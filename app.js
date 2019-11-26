//Require scripts
var setup = require('./Scripts/setup.js');
var auth = require('./Scripts/authenticate.js');
var r = require('./Scripts/reddit.js');
var t = require('./Scripts/twitter.js');

//File management
var fs = require('fs')

//Get config file variables
var keyPath = 'keys.json';
var get_posts, posts_per_day = 0, timer_posting, timer_get_posts;
var configFile;
var configData;

setImmediate(function()
{
    configFile = fs.readFileSync('./config.json');
    configData = JSON.parse(configFile);
})

setTimeout(function()
{
    function read(callback)
    {
        keyPath = configData.config[0].keys_path;
        get_posts = configData.reddit[0].retrieve_posts_every_x_hours;
        posts_per_day += configData.twitter[0].tweets_per_day;
        console.log(posts_per_day);
        callback();
    }

    read(function()
    {
        timer_posting = Math.trunc((((24 / posts_per_day) * 60) * 60) * 1000); //calculate posting time in milliseconds
        timer_get_posts = ((get_posts * 60) * 60) * 1000; //calculate retrieving posts time in milliseconds
        console.log("Timers = " + timer_posting + " | " + timer_get_posts);
        posts_per_day += 4; //Ignore first post (rules and text) and add an extra one just in case
    })
    
},500);

setTimeout(run, 2000);

function run()
{
    setup.run(function(data)
    {
        function setVariables(callback)
        {
            console.log("Setting variables");
            postNumber = data[0];
            countriesList = data[1];
            citiesList = data[2];
            callback();
        }
        //Set variables then run config then run auth
        setVariables(function()
        {
            console.log("Variables SUCCESS");
            //Authenticate keys
            console.log("Path = " + keyPath);
            auth.run(keyPath, function(data)
            {
                console.log("AUTH SUCCESS");
                r.collect(data[0], configData.reddit[0].subreddit, posts_per_day, postNumber, countriesList, citiesList, function()
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