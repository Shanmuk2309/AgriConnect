const express = require('express');
const { ObjectId } = require('mongodb');
const { client } = require('../db');

const router = express.Router();

// 1. POST: Register a new farmer
router.post('/', async (req, res) => {
    try {
        const results = await client.db("AgriDB").collection("farmers").insertOne(req.body);
        res.status(201).json({
            message: "Registration Successful",
            farmerId: results.insertedId
        });
    } catch (error) {
        res.status(500).json({ error: "Registration failed" });
    }
});

// 2. GET: Fetch all farmers
router.get('/', async (req, res) => {
    try {
        const farmers = await client.db("AgriDB").collection("farmers").find({}).toArray();
        res.status(200).json(farmers);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch farmers" });
    }
});

// 3. GET: Fetch a single farmer by ID
router.get('/:id', async (req, res) => {
    try {
        const farmer = await client.db("AgriDB").collection("farmers").findOne({ _id: new ObjectId(req.params.id) });
        if (!farmer) return res.status(404).json({ message: 'Farmer not found' });
        res.status(200).json(farmer);
    } catch (error) {
        res.status(500).json({ error: "Invalid ID format or fetch failed" });
    }
});

// 4. PUT: Update a farmer's profile
router.put('/:id', async (req, res) => {
    try {
        const { _id, ...updateData } = req.body; 
        const result = await client.db("AgriDB").collection("farmers").findOneAndUpdate(
            { _id: new ObjectId(req.params.id) },
            { $set: updateData },
            { returnDocument: 'after' } 
        );
        if (!result) return res.status(404).json({ message: 'Farmer not found' });
        res.status(200).json(result); 
    } catch (error) {
        res.status(500).json({ error: "Failed to update farmer profile" });
    }
});

// 5. DELETE: Delete a farmer's account
router.delete('/:id', async (req, res) => {
    try {
        const result = await client.db("AgriDB").collection("farmers").deleteOne({ _id: new ObjectId(req.params.id) });
        if (result.deletedCount === 0) return res.status(404).json({ message: 'Farmer not found' });
        res.status(200).json({ message: 'Farmer account deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete farmer account" });
    }
});

module.exports = router;