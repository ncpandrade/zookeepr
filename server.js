const express = require('express');

//heroku runs on port 80, therefore set port with
const PORT = process.env.PORT || 3001;

//instantiate the server with express
//assign express to app variable so that we can later chain on methods to the server
const app = express();

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

//add the route
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

//chain on listen() emthod to server
//port 3001 not as restrictive as 80 or 443 but easy to remember and common practice
app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}!`);
});

//creating the route to access data from front end
//requiring the data from front end
const { animals } = require('./data/animals');




