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

                {
                    download.get(posts[i].url, './Posts/' + postNumber + '/image.' + fileFormat, function()
                    {
                        console.log('Post ' + postNumber + " created!"); 
                    });
                    fs.writeFileSync('./Posts/Counter.txt', postNumber);
                    postNumber++;
                }
                else 
                {
                    console.log("Wrong format on " + postNumber);
                    rimraf('./Posts/' + postNumber, function () 
                    {
                        console.log('Directory ' + postNumber + " deleted!"); 
                    });
                    fs.writeFileSync('./Posts/Counter.txt', postNumber);
                    postNumber++;
                }
    
                //Increment the post number
                
            }  
        });
        console.log("COLLECT SUCCESSFUL");
    }
}