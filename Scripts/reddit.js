 //Dowload module
var download = require('./downloadURL.js');

//File management
var fs = require('fs');
var rimraf = require('rimraf');

//Check format
function checkFormat(posts, i, callback)
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
    var path = __dirname.split("\\");
    path.splice(-1, path.length-1);
    path = path.join("/");

    createDir(path + '/Posts/' + postNumber + "/", function()
    {
        createFile('./Posts/' + postNumber + '/title.txt', posts[i].title, function()
        {
            checkFormat(posts, i, function(data)
            {
                if(data[0])
                {
                    download.get(posts[i].url, './Posts/' + postNumber + '/image.' + data[1], function()
                    {
                        callback(postNumber); 
                    });
                }
                else 
                {
                    callback();
                }
            });
        });
    });
}
        });
        console.log("COLLECT SUCCESSFUL");
    }
}