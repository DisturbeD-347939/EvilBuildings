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
        reddit.getSubreddit('evilbuildings', posts_per_day).getHot().then(posts => 
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

                //Download photo
                if(fileFormat.length == 3)
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