const dotenv = require('dotenv')
const express = require('express');
const db = require('./dbConnection');

dotenv.config({path: './config.env'})
//dotenv.config({ path: `${__dirname}/config.env` });

const port = process.env.PORT;
const app = express();


// Middleware to connect to the database before handling requests
app.use(async (req, res, next) => {
  try {
    // If the connection doesn't exist, create it
    if (!db.getDb()) {
      await db.connectToServer();
    }
    next();
  } catch (err) {
    console.error("Går ej att koppla till MongoDB", err);
    res.status(500).send("Går ej att koppla till MongoDB");
  }
});

// Example GET route using the database connection
app.get('/', async (req, res) => {
  try {
    const database = db.getDb("gymnasiuem");
    const collection = database.collection('computers');
    
    // Example: Fetch all documents from the collection
    const result = await collection.find({}).toArray();
    
    res.json(result);
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).send("Error fetching data from the database");
  }
})
//Student-tabell söka på klass
app.get('/:klass', async (req, res) => {
  try {
    let klass = req.params['klass']
    console.log(klass)

    const database = db.getDb("gymnasiuem");
    const collection = database.collection('computers');
    const result = await collection.find({placement: klass
    }).toArray();
    res.json(result)
  } catch (err){
    console.error("Error fetching data:", err);
    res.status(500).send("Error fetching data from the database");
  }
})

//app.get('/')

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await db.closeConnection();
  process.exit();
});
