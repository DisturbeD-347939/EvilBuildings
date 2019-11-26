module.exports =
{
    classify: function(path, callback)
    {
        auth(function(visualRecognition)
        {
            var params = 
            {
                image_file: fs.createReadStream(path)
            }
    
            visualRecognition.classify(params, function(err, res)
            {
                if(err)
                {
                    console.log(err);
                    callback("err");
                }
                else 
                {
                    var data = JSON.stringify(res, null, 2);
                    data = JSON.parse(data);
                    callback(data)
                }
            });
        });
    },
    getTags: function(data, callback)
    {
        var tags = [];
        var finalTags = [];
        for(var i = 0; i < 3; i++)
        {
            tags.push("#" + data.images[0].classifiers[0].classes[i].class);
        }
        for(var i = 0; i < tags.length; i++)
        {
            tags[i] = tags[i].split(/(?:,| )+/); 
            for(var j = 0; j < tags[i].length; j++)
            {
                if(tags[i][j].charAt(0) == "#")
                {
                    finalTags.push(tags[i][j]);
                }
            }
            
        }
        console.log(finalTags);
        callback(finalTags);
    }
}