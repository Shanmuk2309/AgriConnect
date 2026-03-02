const express = require('express');
const { ObjectId } = require('mongodb');
const { client } = require('../db');

const router = express.Router();

// 1. POST: Create a new crop
router.post('/', async (req, res) => {
    try {
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
    } catch (error) {
        console.error("Failed to list the crop: ", error);
        res.status(500).json({ error: "Failed to list the crop" });
    }
});

// 2. GET: Fetch all crops
router.get('/', async (req, res) => {
    try {
        // .find({}) gets everything, .toArray() converts the cursor to a JSON array
        const crops = await client.db("AgriDB").collection("Crops").find({}).toArray();
        res.status(200).json(crops);
    } catch (error) {
        console.error("Failed to fetch crops: ", error);
        res.status(500).json({ error: "Failed to fetch crops" });
    }
});

// 3. GET: Fetch a single crop by its ID
router.get('/:id', async (req, res) => {
    try {
        const crop = await client.db("AgriDB").collection("Crops").findOne({ _id: new ObjectId(req.params.id) });
        
        if (!crop) {
            return res.status(404).json({ message: 'Crop not found' });
        }
        res.status(200).json(crop);
    } catch (error) {
        console.error("Failed to fetch crop: ", error);
        res.status(500).json({ error: "Invalid ID format or fetch failed" });
    }
});

// 4. PUT: Update a specific crop
router.put('/:id', async (req, res) => {
    try {
        // Prevent accidental overwrite of the _id field
        const { _id, ...updateData } = req.body; 

        const result = await client.db("AgriDB").collection("Crops").findOneAndUpdate(
            { _id: new ObjectId(req.params.id) },
            { $set: updateData },
            { returnDocument: 'after' } // Returns the newly updated document
        );

        if (!result) {
            return res.status(404).json({ message: 'Crop not found' });
        }
        res.status(200).json(result); 
    } catch (error) {
        console.error("Failed to update crop: ", error);
        res.status(500).json({ error: "Failed to update crop" });
    }
});

// 5. DELETE: Remove a crop listing
router.delete('/:id', async (req, res) => {
    try {
        const result = await client.db("AgriDB").collection("Crops").deleteOne({ _id: new ObjectId(req.params.id) });
        
        // deletedCount tells us if a document was actually found and removed
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Crop not found' });
        }
        res.status(200).json({ message: 'Crop deleted successfully' });
    } catch (error) {
        console.error("Failed to delete crop: ", error);
        res.status(500).json({ error: "Failed to delete crop" });
    }
});

module.exports = router;