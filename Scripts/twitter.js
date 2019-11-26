//File management
var fs = require('fs');
var fsE = require('fs-extra');
var iR = require('./imageRecognition.js');

//Post photo and title to twitter
function prepare(callback)
{
    //Check path
    var path = __dirname.split("/");
    path.splice(-1, path.length-1);
    path = path.join("/");

    //Check which one is the oldest post and collect its image and title
    var posts = fs.readdirSync(path + '/Posts');
    var post = fs.readdirSync(path + '/Posts/' + posts[0]);
    var image = fs.readFileSync(path + "/Posts/" + posts[0] + "/" + post[0], { encoding: 'base64' });

    //Read title
    fs.readFile(path + '/Posts/' + posts[0] + '/' + post[1], 'utf8', function(err, data) 
    {
        callback([data, image, posts[0]]);
    });
}

function moveDir(oldPath, newPath)
{
    fsE.move(oldPath, newPath, err =>
    {
        if(err)
        {
            //console.log(err);
        }
        else
        {
            console.log("Moved to used tweets folder");
        }
    })
}

function post(twitter, data, callback)
{
    // Make post request to Twitter
    twitter.post('media/upload', {media: data[1]}, function(error, media, response) 
    {

        if (!error) 
        {
            //Prepare the tweet
            var text = "";
            
            if(data[0] != "")
            {
                text += data[0] + " | ";
            }
            var separatedTags = tags.join(" ");
            text += separatedTags;

            var status = 
            {
                status: text,
                media_ids: media.media_id_string,
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

                    var currentPath = __dirname.split("/");
                    currentPath.splice(-1, currentPath.length-1);
                    currentPath = currentPath.join("/");
                    currentPath = currentPath + '/Posts/' + data[2] + '/';

                    var newPath = __dirname.split("/");
                    newPath.splice(-1, newPath.length-1);
                    newPath = newPath.join("/");
                    newPath = newPath + '/Used/' + data[2] + '/';

                    console.log("Moving dir");
                    moveDir(currentPath, newPath, function()
                    {
                        callback();
                    });  
                }
            });
        }
        else
        {
            console.log(error);
        }
    });
}

module.exports =
{
    //Post tweets
    post: function(twitter, callback)
    {
        console.log("Posting tweet....");
        prepare(function(data)
        {
            if(data[0] != 1)
            {
                getTags(data, twitter, function(tags, twitter, data)
                {
                    console.log("Tweet prepared");
                    post(twitter, data, tags, function()
                    {
                        callback();
                        var today = new Date();
                        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
                        console.log("Tweet posted | " + time);
                    })
                })
            }
            else
            {
                callback();
            }    
        })
    }
}