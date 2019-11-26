 //Dowload module
var download = require('./downloadURL.js');

//File management
var fs = require('fs');
var rimraf = require('rimraf');

//Check format
function checkFormat(posts, i, postNumber, callback)
{
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

    //Check file extension
    if(fileFormat.length == 3)
    {
        callback([1, fileFormat]);
    }
    else 
    {
        rimraf('./Posts/' + postNumber, function () 
        {
            console.log('Directory ' + postNumber + " deleted!"); 
            callback([0, ""]);
        });
    }
}

//Create directory
function createDir(path, callback)
{
    console.log(path);
    if(!fs.existsSync(path))
    {
        fs.mkdirSync(path, function(){callback();});
        callback();
    }
    else {callback();}
}

//Create file
function createFile(path, data, callback)
{
    if(!fs.existsSync(path))
    {
        fs.writeFileSync(path, data, function(){callback();});
        callback();
    }
    else {callback();}
}

//Create post
function createPost(posts, postNumber, i, callback)
{
    function getPath(callback)
    {
        var path = __dirname.split("/");
        path.splice(-1, path.length-1);
        path = path.join("/");
        callback(path);
    }

    getPath(function(data)
    {
        console.log("createDir");
        createDir(data + '/Posts/' + postNumber, function()
        {
            console.log("SUCCESS");
            console.log("createFile");
            createFile('./Posts/' + postNumber + '/title.txt', posts[i].title, function()
            {
                console.log("SUCCESS");
                console.log("checkFormat");
                checkFormat(posts, i, function(data)
                {
                    if(data[0] && data[1] != "")
                    {
                        download.get(posts[i].url, './Posts/' + postNumber + '/image.' + data[1], function()
                        {
                            callback(postNumber); 
                        });
                    }
                    else 
                    {
                        callback((postNumber + " FAILED "));
                    }
                });
            });
        });
    })
}

//Get posts
function getPosts(reddit, subreddit, posts_per_day, postNumber, callback)
{
    reddit.getSubreddit(subreddit, posts_per_day).getHot().then(posts => 
    {
        console.log(posts_per_day);
        for(var i = 1; i < posts_per_day; i++)
        {
            createPost(posts, postNumber, i, function(data)
            {
                console.log("Post " + data + " DOWNLOADED");
            });
            postNumber++;
        }
        callback();
        fs.writeFileSync('./Posts/Counter.txt', postNumber);
    });
}

module.exports =
{
    //Download and organize reddit posts from r/evilbuildings
    collect: function(reddit, subreddit, posts_per_day, postNumber, callback)
    {
        getPosts(reddit, subreddit, posts_per_day, postNumber, function()
        {
            console.log("Collect SUCCESSFUL");
            callback();
        });
    }
}