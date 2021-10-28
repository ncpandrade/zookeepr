const express = require('express');
const fs = require('fs');
//for working with file and directory paths
const path = require('path');

//creating the route to access data from front end
//requiring the data from front end
const { animals } = require('./data/animals');

//heroku runs on port 80, therefore set port with
const PORT = process.env.PORT || 3001;

//instantiate the server with express
//assign express to app variable so that we can later chain on methods to the server
const app = express();


//MIDDLEWARE functions
// parse incoming string or array data
//.use() mounts a function to the server that our requests will pass through before getting to the endpoint
//express.urlencoded() converts key/value pairings that can be accessed in the req.body
app.use(express.urlencoded({ extended: true }));
// parse incoming JSON data into the req.body
app.use(express.json());
//express.static()
//we provide file path to 'public' and instuct server to make these files static resources; they can be accessed without having a specific server endpoint created for it
app.use(express.static('public'));


//filter by query
function filterByQuery(query, animalsArray) {
    let personalityTraitsArray = [];
    // Note that we save the animalsArray as filteredResults here:
    let filteredResults = animalsArray;
    if (query.personalityTraits) {
      // Save personalityTraits as a dedicated array.
      // If personalityTraits is a string, place it into a new array and save.
      if (typeof query.personalityTraits === 'string') {
        personalityTraitsArray = [query.personalityTraits];
      } else {
        personalityTraitsArray = query.personalityTraits;
      }
      // Loop through each trait in the personalityTraits array:
      personalityTraitsArray.forEach(trait => {
        // Check the trait against each animal in the filteredResults array.
        // Remember, it is initially a copy of the animalsArray,
        // but here we're updating it for each trait in the .forEach() loop.
        // For each trait being targeted by the filter, the filteredResults
        // array will then contain only the entries that contain the trait,
        // so at the end we'll have an array of animals that have every one 
        // of the traits when the .forEach() loop is finished.
        filteredResults = filteredResults.filter(
          animal => animal.personalityTraits.indexOf(trait) !== -1
        );
      });
    }
    if (query.diet) {
      filteredResults = filteredResults.filter(animal => animal.diet === query.diet);
    }
    if (query.species) {
      filteredResults = filteredResults.filter(animal => animal.species === query.species);
    }
    if (query.name) {
      filteredResults = filteredResults.filter(animal => animal.name === query.name);
    }
    // return the filtered results:
    return filteredResults;
  }

  //FUNCTION that takes the id and array of animals and return a single animal object
  function findById(id, animalsArray) {
    const result = animalsArray.filter(animal => animal.id === id)[0];
    return result;
  }

//Function to create new animals
function createNewAnimal(body, animalsArray) {
  const animal = body;
  //add newly created animal to animalsArray
  //NOTE this only saves in server, not in the file
  animalsArray.push(animal);
  //this will add to the file
  //small file, thus use fs.writeFileSync is synchronous and does not need callback
  fs.writeFileSync(
    path.join(__dirname, './data/animals.json'),
    //save javaScript array as JSON
    //null means we don't want to edit
    //2 indicates we want to create white space between our values
    JSON.stringify({ animals: animalsArray }, null, 2)
  );
  // return finished code to post route for response
  return animal;
}
 
//validate data for new animal
function validateAnimal(animal) {
  if (!animal.name || typeof animal.name !== 'string') {
    return false;
  }
  if (!animal.species || typeof animal.species !== 'string') {
    return false;
  }
  if (!animal.diet || typeof animal.diet !== 'string') {
    return false;
  }
  if (!animal.personalityTraits || !Array.isArray(animal.personalityTraits)) {
    return false;
  }
  return true;
}

//QUERY route is multifaceted and combining multiple parameters
//get() requires 2 args: 1-string describing the route 2-callback function
//using send() method from res parameter to send string Hello! to our client
app.get('/api/animals', (req, res) => {
    let results = animals;
    //access query property on the req object
    if (req.query) {
        results = filterByQuery(req.query, results);
      }
    console.log(req.query)
    res.json(results);
});

//PARAM route for specific to a single property often used to retrieve a single record
//add :id for /:<parameterName> in route path
//this param route has to come AFTER the other GET route
app.get('/api/animals/:id', (req, res) => {
  const result = findById(req.params.id, animals);
  if (result) {
    res.json(result);
    //if no result for animal then send 404 error
  } else {
    res.send(404);
  }
});

//create new API endpoint to store data in the server file
app.post('/api/animals', (req, res) => {

    // set id based on what the next index of the array will be
    //req.body to access and use trhe data sent from a client to a server  
    req.body.id = animals.length.toString();

    // if any data in req.body is incorrect, send 400 error back
    if (!validateAnimal(req.body)) {
      //response method to relay message to the client making the request
      res.status(400).send('The animal is not properly formatted.');
    } else {
      // add animal to json file and animals array in this function
      //send updated req.body data to createNewAnimal()
      const animal = createNewAnimal(req.body, animals);

      // req.body is object where our incoming content will be
      console.log(req.body);
      res.json(animal);
    }
});

//SERVE PAGES through server.js
//GET route for index.html file
// '/' brings us to the root route of the server - used to create a homepage for a server
//unlike most GET and POST routes, this route responds with html page to display in the browser
app.get('/', (req, res) => {
  //sendFile tell them wheere to find the file we want the server to read and send back to the client
  res.sendFile(path.join(__dirname, './public/index.html'));
});
//GET route for animals.html file
//no "api" in route name b/c this serves an html page
app.get('/animals', (req, res) => {
  res.sendFile(path.join(__dirname, './public/animals.html'));
});
//GET route for zookeepers.html file
app.get('/zookeepers', (req, res) => {
  res.sendFile(path.join(__dirname, './public/zookeepers.html'));
});
//add WILDCARD route for error requests from client
//any route that wasn't previsouly defined '*' will receive the homepage
//order matters; wildcard should always come last
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './public/index.html'));
});

//chain on listen() emthod to server
//port 3001 not as restrictive as 80 or 443 but easy to remember and common practice
app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}!`);
});






