function createDir(path)
{
    if(!fs.existsSync(path))
    {
        fs.mkdirSync(path, function()
        {
            console.log(path + " created...");
        });
    }
    else 
    {
        console.log(path + " is checked!");
    }
}

function createFile(path, data)
{
    if(!fs.existsSync(path))
    {
        fs.writeFileSync(path, data, function()
        {
            console.log(path + " created...");
        });
    }
    else 
    {
        console.log(path + " is checked!");
    }
}

function readFile(path, callback)
{
    if(fs.existsSync(path))
    {
        fs.readFile(path, 'utf8', function(err, data)
        {
            if(err) throw err;
            else callback(data);
        });
    }
}
