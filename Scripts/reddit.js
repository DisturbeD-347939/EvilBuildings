//Dowload module
var download = require('C:\\Users\\Ricar\\Documents\\GitHub\\NodeJS\\EvilBuildings\\Scripts\\downloadURL.js');

//File management
var fs = require('fs');
var rimraf = require('rimraf');

module.exports =
{
    //Download and organize reddit posts from r/evilbuildings
    collect: function(reddit, posts_per_day, postNumber)
    {
        reddit.getSubreddit('evilbuildings', posts_per_day).getHot().then(posts => 
        {
            for(var i = 1; i < posts_per_day; i++)
            {
                console.log("Creating post " + postNumber);
    
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
                console.log(fileFormat);

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