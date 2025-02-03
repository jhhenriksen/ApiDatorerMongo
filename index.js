const dotenv = require('dotenv')
const express = require('express');
const db = require('./dbConnection');
const { Timestamp, ObjectId } = require('bson');
express.urlencoded({extended:true}) //Läsa data från formulär, "content type": application/x-www-form-urlencoded

dotenv.config({path: './config.env'})
//dotenv.config({ path: `${__dirname}/config.env` });

const port = process.env.PORT;
const app = express();
app.use(express.json())


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

//* * * * * * * * * * * * * * * * * * * * /
// TEST
//* * * * * * * * * * * * * * * * * * * * /

app.get('/test',  (req, res) => {
  res.json({resultat: "Servern fungerar!"})
})


//* * * * * * * * * * * * * * * * * * * * /
// GET all users
//* * * * * * * * * * * * * * * * * * * * /

app.get('/user', async (req, res) => {
  try {
    const database = db.getDb("gymnasiuem");
    const collection = database.collection('users');
    
    // Example: Fetch all documents from the collection
    const result = await collection.find({}).toArray();
    
    res.json(result);
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).send("Error fetching data from the database");
  }
})

//* * * * * * * * * * * * * * * * * * * * /
// GET ONE user
//* * * * * * * * * * * * * * * * * * * * /
app.get('/user/:objectId', async (req, res) => {
  try {
    let objectId = req.params['objectId']
    const database = db.getDb("gymnasium")
    const collection = database.collection('users')
    const query = {_id: new ObjectId(objectId)}
  
    //findOne({}, null, { sort: { timestamp: -1} })

    const result = await collection.findOne(query,null, { sort: { timestamp: -1} })
    console.log(result)
    res.json(result)

  } catch (err){
    console.error("Error fetching data:", err);
    res.status(500).send("Error fetching data from the database");
  }
}) 

//ToDo - lägg till Klass
//Student-tabell söka på klass
app.get('/user/:klass', async (req, res) => {
  try {
    let klass = req.params['klass']
    console.log(klass)

    const database = db.getDb("gymnasium");
    const collection = database.collection('computers');
    const result = await collection.find({placement: klass}).toArray();
    res.json(result)
  } catch (err){
    console.error("Error fetching data:", err);
    res.status(500).send("Error fetching data from the database");
  }
})







// söka på serialNumber
app.get('/computers/:serial', async (req, res) => {
  try {
    let serial = req.params['serial']
    const database = db.getDb("gymnasium")
    const collection = database.collection('computers')
    const result = await collection.findOne({
      serialNumber: serial
    })
    //console.log(result)
    res.json(result)

  } catch (err){
    console.error("Error fetching data:", err);
    res.status(500).send("Error fetching data from the database");
  }
})


/*
// Uppdatera på serialNumber
app.PATCH('/computers/:serial', async (req, res) => { //endast nya fält
  try {
    let serial = req.params['serial']
    const database = db.getDb("gymnasium")
    const collection = database.collection('computers')
    const result = await collection.findOne({
      serialNumber: serial
    })
    console.log(result)
    res.json(result)

  } catch (err){
    console.error("Error fetching data:", err);
    res.status(500).send("Error fetching data from the database");
  }
})
*/
app.post('/serial/', async (req, res) => {
  let data = req
})

//Post inkl 
// klass
// kommentar om dators skick
//+  array för nuvarande användare [status: normal, verkstad, oanvändbar (kommentar)]



//**************************** */
//*   Create User
//**************************** */

app.post('/user', async (req, res) => {
  
  //Datum
   myDate = new Date();
   var myDateString = myDate.toISOString();

   //hämta data i req.body
   const isActive         = req.body.isActive
   const firstName        = req.body.firstName;
   const lastName         = req.body.lastName;
   const role             = req.body.role;
   const group            = req.body.group;
   const action           = req.body.action;
   const comment          = req.body.comment;
   const currentComputer  = req.body.currentComputer;
 
   try {
     const database       = db.getDb("gymnasium");
     const collection     = database.collection('users');
     const result = await collection.insertOne({
       isActive:  isActive,
       firstName: firstName,
       lastName:  lastName,
       role:      role,
       group:     group,   
       history: [{
         action:          action,
         comment:         comment,
         currentComputer: currentComputer,
         createdAt:       myDateString
       }]
         
       
     });
 
     res.json(result);
   } catch (err) {
     console.error("Error inserting data:", err);
     res.status(500).send("Error inserting data to the database");
   }
   
 })

// UPPDATERA HISTORIK
app.patch('/user/:userId', async (req, res) => {

  //Datum
  myDate = new Date();
  var myDateString = myDate.toISOString();

  const userId              = req.params.userId
  console.log(userId)
  
  const currentComputer     = req.body.currentComputer
  const action              = req.body.action
  const comment             = req.body.comment
  
  const query = {_id: new ObjectId(userId)}
  
  const update = {
    $push: {
      history: {
          action:          action,
          comment:         comment,
          currentComputer: currentComputer,
          createdAt:       myDateString
      }
    }
  }
  const options = {upsert: true}


  try {
    const database = db.getDb("gymnasium")
    const collection = database.collection('users')
    console.log(query)
    console.log(update)
    console.log(options)
    
    const result = await collection.updateOne(query,update, options)
    console.log(result)
    
    res.json(result)
    
  }
  catch (err){
    console.error("Error fetching data:", err);
    res.status(500).send("Error fetching data from the database");
  }
  
})


//Hello





// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await db.closeConnection();
  process.exit();
});
