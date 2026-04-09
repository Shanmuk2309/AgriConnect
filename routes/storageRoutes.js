const express = require('express');
const { ObjectId } = require('mongodb');
const { client } = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// 1. POST: Add a new cold storage facility
router.post('/add', authMiddleware, async (req, res) => {
    try {
        const results = await client.db("AgriDB").collection("cold storages").insertOne(req.body); 
        res.status(201).json({
            message: "Cold storage added successfully",
            storageId: results.insertedId
        });
    } catch (error) {
        console.error("Failed to add cold storage: ", error);
        res.status(500).json({ error: "Failed to add cold storage" });
    }
});

// 2. GET: Fetch all cold storage facilities
router.get('/', async (req, res) => {
    try {
        const storages = await client.db("AgriDB").collection("cold storages").find({}).toArray();
        res.status(200).json(storages);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch cold storages" });
    }
});

// 3. GET: Fetch a single cold storage by ID
router.get('/:id', async (req, res) => {
    try {
        const storage = await client.db("AgriDB").collection("cold storages").findOne({ _id: new ObjectId(req.params.id) });
        if (!storage) {
            return res.status(404).json({ message: 'Cold storage not found' });
        }
        res.status(200).json(storage);
    } catch (error) {
        res.status(500).json({ error: "Invalid ID format or fetch failed" });
    }
});

// 4. PUT: Update cold storage details (like available capacity)
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const existingStorage = await client.db("AgriDB").collection("cold storages").findOne({ _id: new ObjectId(req.params.id) });

        if (!existingStorage) {
            return res.status(404).json({ message: 'Cold storage not found' });
        }

        if (String(existingStorage.cs_ownerId) !== String(req.user.id)) {
            return res.status(403).json({ message: 'You are not allowed to update this facility' });
        }

        const { _id, ...updateData } = req.body; 
        await client.db("AgriDB").collection("cold storages").findOneAndUpdate(
            { _id: new ObjectId(req.params.id) },
            { $set: updateData },
            { returnDocument: 'after' } 
        );
        const updatedStorage = await client.db("AgriDB").collection("cold storages").findOne({ _id: new ObjectId(req.params.id) });
        res.status(200).json(updatedStorage); 
    } catch (error) {
        res.status(500).json({ error: "Failed to update cold storage" });
    }
});

// 5. DELETE: Remove a cold storage facility
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const existingStorage = await client.db("AgriDB").collection("cold storages").findOne({ _id: new ObjectId(req.params.id) });

        if (!existingStorage) {
            return res.status(404).json({ message: 'Cold storage not found' });
        }

        if (String(existingStorage.cs_ownerId) !== String(req.user.id)) {
            return res.status(403).json({ message: 'You are not allowed to delete this facility' });
        }

        const result = await client.db("AgriDB").collection("cold storages").deleteOne({ _id: new ObjectId(req.params.id) });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Cold storage not found' });
        }
        res.status(200).json({ message: 'Cold storage deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete cold storage" });
    }
});

module.exports = router;