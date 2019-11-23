//File management
var fs = require('fs');
const csv = require('csv-parser');

function createDir(path)
{
    if(!fs.existsSync(path))
    {
        fs.mkdirSync(path, function()
        {
            console.log(path + " CREATED");
        });
    }
    else 
    {
        console.log(path + " SUCCESS");
    }
}

function createFile(path, data)
{
    if(!fs.existsSync(path))
    {
        fs.writeFileSync(path, data, function()
        {
            console.log(path + " CREATED");
        });
    }
    else 
    {
        console.log(path + " SUCCESS");
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

module.exports = 
{
    //Setting up the program to run
    run: function(callback)
    {
        //Variables
        var postNumber, keyLocation, countries = [];
        check = [0,0,0];

        //Check for the existence of the necessary folders
        createDir('./Posts');
        createDir('./Used');

        //Check for the existence of the necessary files
        createFile('./Posts/Counter.txt', 0);

        function checkCallbacks(callback)
        {
            readFile('./Posts/Counter.txt', function(data)
            {
                postNumber = data;
                console.log("Counter replied with SUCCESS");

                //Next callback
                readFile('path.txt', function(data)
                {
                    keyLocation = data;
                    console.log("Key replied with SUCCESS"); 

                    //Next callback
                    fs.createReadStream('countries_data.csv').pipe(csv()).on('data', (row) => 
                    {
                        countries.push([row.Country, row.Name]);
                    }).on('end', () => 
                    {
                        console.log("Countries replied with SUCCESS");
                        callback(postNumber, keyLocation, countries);
                        return;
                    });
                });
            });
        }

        checkCallbacks(function(postNumber, keyLocation, countries)
        {
            callback([postNumber, keyLocation, countries]);
        })
    }
}

