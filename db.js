const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
let AgriDB;

async function connectDB() {
    
    try {
        await client.connect();
        AgriDB = client.db("AgriDB");
        await AgriDB.command({ping: 1}); 
        console.log("Connected successfully to MongoDB");
        return AgriDB;
    } catch (error) {                                                 
        console.error("Could not connect to MongoDB", error);
        process.exit(1); 
    }
}

module.exports = { connectDB, client };