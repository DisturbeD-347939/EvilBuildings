//File management
var fs = require('fs')
var request = require('request');

module.exports = 
{
    //Downloading urls from the web
    run: function(url, path, callback)
    {
        request.head(url, function(err, res, body)
        {
            request(url).pipe(fs.createWriteStream(path)).on('close', callback);
        });
    }
}
