const express = require('express');
const { connectDB, client } = require('./db');
const port = 5500;

const app = express();
app.use(express.json());

const db = client.db("AgriDB");

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Server is healthy' });
});

app.post('/api/farmers', async(req,res) => {
    try{
        const results = await db.collection("farmers").insertOne(req.body);
        res.status(201).json({
            message: "Registration Successful",
            farmerId: results.insertedId
        })
    }catch(error){
        console.error("Registration failed:", error);
        res.status(500).json({error: "Registration failed"});
    }
});

app.post('/api/buyers', async(req,res) => {
    try{
        const results = await db.collection("buyers").insertOne(req.body);
        res.status(201).json({
            message: "Registration Successful",
            buyerId: results.insertedId
        })
    }catch(error){
        console.error("Registration failed: ", error);
        res.status(500).json({error: "Registration failed"});
    }
});

app.post('/api/cs_owners', async(req,res) => {
    try{
        const results = await db.collection("cs_owners").insertOne(req.body);
        res.status(201).json({
            message: "Registration Successful",
            cs_ownerId: results.insertedId
        })
    }catch(error){
        console.error("Registration failed: ", error);
        res.status(500).json({error: "Registration failed"});
    }
});

app.post('/api/crops', async(req,res) => {
    try{
        const cropData = {
            ...req.body,
            status: "Available",
            createdAt: new Date()
        }
        const results = await client.db("AgriDB").collection("Crops").insertOne(cropData);
        res.status(201).json({
            message: "Crop listed successfully",
            cropId: results.insertedId
        })
    }catch{
        console.error("Failed to list the crop: ", error);
        res.status(500).json({error: "Failed to list the crop"});
    }
})

app.post('/api/cold-storages', async(req,res) => {
    try{
        const results = await client.db("AgriDB").collection("cold storages").insertOne(req.body); 
        res.status(201).json({
            message: "Cold storage added successfully",
            storageId: results.insertedId
        })
    }catch(error){
        console.error("Failed to add cold storage: ", error);
        res.status(500).json({error: "Failed to add cold storage"});
    }
})

app.post('/api/bids', async(req,res) => {
    try{
        const bidData = {
            ...req.body,
            status: "Pending",
            createdAt: new Date()
        }
        const results = await client.db('AgriDB').collection('bids').insertOne(bidData);
        res.status(201).json({
            message: "Bid placed successfully",
            bidId: results.insertedId
        })
    }catch(error){
        console.error("Failed to place bid: ",error);
        res.status(500).json({error: "Failed to place the bid"});
    }
})

if (require.main === module) {
    connectDB().then(() => {
        app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
        });
    });
}

module.exports = app;