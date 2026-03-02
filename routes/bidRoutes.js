const express = require('express');
const { ObjectId } = require('mongodb');
const { client } = require('../db');

const router = express.Router();

// 1. POST: Create a new bid
router.post('/', async (req, res) => {
    try {
        const bidData = {
            ...req.body,
            status: "Pending",
            createdAt: new Date()
        }
        const results = await client.db('AgriDB').collection('bids').insertOne(bidData);
        res.status(201).json({
            message: "Bid placed successfully",
            bidId: results.insertedId
        });
    } catch (error) {
        console.error("Failed to place bid: ", error);
        res.status(500).json({ error: "Failed to place the bid" });
    }
});

// 2. GET: Fetch all bids
router.get('/', async (req, res) => {
    try {
        const bids = await client.db("AgriDB").collection("bids").find({}).toArray();
        res.status(200).json(bids);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch bids" });
    }
});

// 3. GET: Fetch a single bid by its ID
router.get('/:id', async (req, res) => {
    try {
        const bid = await client.db("AgriDB").collection("bids").findOne({ _id: new ObjectId(req.params.id) });
        if (!bid) {
            return res.status(404).json({ message: 'Bid not found' });
        }
        res.status(200).json(bid);
    } catch (error) {
        res.status(500).json({ error: "Invalid ID format or fetch failed" });
    }
});

// 4. GET: Fetch all bids for a specific crop
router.get('/crop/:cropId', async (req, res) => {
    try {
        const bids = await client.db("AgriDB").collection("bids").find({ cropId: req.params.cropId }).toArray();
        res.status(200).json(bids);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch bids for this crop" });
    }
});

// 5. PUT: Update a specific bid
router.put('/:id', async (req, res) => {
    try {
        const { _id, ...updateData } = req.body; 
        const result = await client.db("AgriDB").collection("bids").findOneAndUpdate(
            { _id: new ObjectId(req.params.id) },
            { $set: updateData },
            { returnDocument: 'after' } 
        );
        if (!result) {
            return res.status(404).json({ message: 'Bid not found' });
        }
        res.status(200).json(result); 
    } catch (error) {
        res.status(500).json({ error: "Failed to update bid" });
    }
});

// 6. DELETE: Withdraw/Remove a bid
router.delete('/:id', async (req, res) => {
    try {
        const result = await client.db("AgriDB").collection("bids").deleteOne({ _id: new ObjectId(req.params.id) });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Bid not found' });
        }
        res.status(200).json({ message: 'Bid deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete bid" });
    }
});

module.exports = router;