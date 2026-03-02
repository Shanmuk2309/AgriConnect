const express = require('express');
const { ObjectId } = require('mongodb');
const { client } = require('../db');

const router = express.Router();

// 1. POST: Register a new cold storage owner
router.post('/', async (req, res) => {
    try {
        const results = await client.db("AgriDB").collection("cs_owners").insertOne(req.body);
        res.status(201).json({
            message: "Registration Successful",
            cs_ownerId: results.insertedId
        });
    } catch (error) {
        res.status(500).json({ error: "Registration failed" });
    }
});

// 2. GET: Fetch all cold storage owners
router.get('/', async (req, res) => {
    try {
        const owners = await client.db("AgriDB").collection("cs_owners").find({}).toArray();
        res.status(200).json(owners);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch CS owners" });
    }
});

// 3. GET: Fetch a single CS owner by ID
router.get('/:id', async (req, res) => {
    try {
        const owner = await client.db("AgriDB").collection("cs_owners").findOne({ _id: new ObjectId(req.params.id) });
        if (!owner) return res.status(404).json({ message: 'CS Owner not found' });
        res.status(200).json(owner);
    } catch (error) {
        res.status(500).json({ error: "Invalid ID format or fetch failed" });
    }
});

// 4. PUT: Update a CS owner's profile
router.put('/:id', async (req, res) => {
    try {
        const { _id, ...updateData } = req.body; 
        const result = await client.db("AgriDB").collection("cs_owners").findOneAndUpdate(
            { _id: new ObjectId(req.params.id) },
            { $set: updateData },
            { returnDocument: 'after' } 
        );
        if (!result) return res.status(404).json({ message: 'CS Owner not found' });
        res.status(200).json(result); 
    } catch (error) {
        res.status(500).json({ error: "Failed to update CS owner profile" });
    }
});

// 5. DELETE: Delete a CS owner's account
router.delete('/:id', async (req, res) => {
    try {
        const result = await client.db("AgriDB").collection("cs_owners").deleteOne({ _id: new ObjectId(req.params.id) });
        if (result.deletedCount === 0) return res.status(404).json({ message: 'CS Owner not found' });
        res.status(200).json({ message: 'CS Owner account deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete CS owner account" });
    }
});

module.exports = router;