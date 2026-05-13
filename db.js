const { MongoClient } = require('mongodb');
require('dotenv').config();

// MongoDB Atlas Non-SRV URI
const uri = process.env.MONGO_ATLAS_URI;

const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
});

let AgriDB = null;

async function connectDB() {

    try {

        // Reuse existing DB connection
        if (AgriDB) {
            return AgriDB;
        }

        console.log("Connecting to MongoDB...");

        await client.connect();

        AgriDB = client.db("AgriDB");

        // Test database connection
        await AgriDB.command({ ping: 1 });

        console.log("Connected successfully to MongoDB");

        return AgriDB;

    } catch (error) {

        console.error("Could not connect to MongoDB:", error.message);

        // Do NOT use process.exit() in Jest/Jenkins
        throw error;
    }
}

module.exports = { connectDB, client };