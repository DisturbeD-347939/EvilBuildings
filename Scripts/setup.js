//File management
var fs = require('fs');
const csv = require('csv-parser');

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

        //Read txt files
        readFile('./Posts/Counter.txt', function(data)
        {
            postNumber = data;
            check[0] = 1;
            console.log("Counter replied with " + postNumber);
        });
        readFile('path.txt', function(data)
        {
            keyLocation = data;
            check[1] = 1;
            console.log("Key replied with " + keyLocation);
        });

        //Read csv files
        fs.createReadStream('countries_data.csv').pipe(csv()).on('data', (row) => 
        {
            countries.push([row.Country, row.Name]);
        }).on('end', () => 
        {
            console.log("Countries retrieved!");
            check[2] = 1;
        });

        if(check == [1,1,1])
        {
            callback(postNumber, keyLocation, countries);
        }        
    }
}

