//File management
var fs = require('fs');
var fsE = require('fs-extra');

//Post photo and title to twitter
function prepare(callback)
{
    //Check path
    var path = __dirname.split("\\");
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
