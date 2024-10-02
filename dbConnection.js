const { MongoClient } = require('mongodb')
const dotenv = require('dotenv')
dotenv.config({ path: `${__dirname}/config.env` });


// Replace this with your actual connection string
const uri = process.env.URI; // || ""

console.log(uri)
const client = new MongoClient(uri);

let dbConnection;

module.exports = {
  connectToServer: async function() {
    try {
      await client.connect();
      dbConnection = client.db("gymnasium"); // If you want to specify a database, use client.db("your-db-name")
      console.log("Successfully connected to MongoDB.");
    } catch (err) {
      console.error("Error connecting to MongoDB:", err);
      throw err;
    }
  },

  getDb: function() {
    return dbConnection;
  },

  closeConnection: async function() {
    if (client.isConnected()) {
      await client.close();
      console.log("MongoDB connection closed.");
    }
  }
};
