const express = require('express');
const { ObjectId } = require('mongodb');
const { client } = require('../db');

const router = express.Router();

// 1. POST: Register a new buyer
router.post('/', async (req, res) => {
    try {
        const results = await client.db("AgriDB").collection("buyers").insertOne(req.body);
        res.status(201).json({
            message: "Registration Successful",
            buyerId: results.insertedId
        });
    } catch (error) {
        res.status(500).json({ error: "Registration failed" });
    }
});

// 2. GET: Fetch all buyers
router.get('/', async (req, res) => {
    try {
        const buyers = await client.db("AgriDB").collection("buyers").find({}).toArray();
        res.status(200).json(buyers);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch buyers" });
    }
});

// 3. GET: Fetch a single buyer by ID
router.get('/:id', async (req, res) => {
    try {
        const buyer = await client.db("AgriDB").collection("buyers").findOne({ _id: new ObjectId(req.params.id) });
        if (!buyer) return res.status(404).json({ message: 'Buyer not found' });
        res.status(200).json(buyer);
    } catch (error) {
        res.status(500).json({ error: "Invalid ID format or fetch failed" });
    }
});

// 4. PUT: Update a buyer's profile
router.put('/:id', async (req, res) => {
    try {
        const { _id, ...updateData } = req.body; 
        const result = await client.db("AgriDB").collection("buyers").findOneAndUpdate(
            { _id: new ObjectId(req.params.id) },
            { $set: updateData },
            { returnDocument: 'after' } 
        );
        if (!result) return res.status(404).json({ message: 'Buyer not found' });
        res.status(200).json(result); 
    } catch (error) {
        res.status(500).json({ error: "Failed to update buyer profile" });
    }
});

// 5. DELETE: Delete a buyer's account
router.delete('/:id', async (req, res) => {
    try {
        const result = await client.db("AgriDB").collection("buyers").deleteOne({ _id: new ObjectId(req.params.id) });
        if (result.deletedCount === 0) return res.status(404).json({ message: 'Buyer not found' });
        res.status(200).json({ message: 'Buyer account deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete buyer account" });
    }
});

module.exports = router;