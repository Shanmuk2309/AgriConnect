const express = require('express');
const { ObjectId } = require('mongodb');
const { client } = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// 1. POST: Create a new bid
router.post('/add', authMiddleware, async (req, res) => {
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
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { _id, ...updateData } = req.body; 
        const bidsCollection = client.db("AgriDB").collection("bids");
        const cropsCollection = client.db("AgriDB").collection("Crops");

        const existingBid = await bidsCollection.findOne({ _id: new ObjectId(req.params.id) });

        if (!existingBid) {
            return res.status(404).json({ message: 'Bid not found' });
        }

        const isBidOwner = String(existingBid.buyerId) === String(req.user.id);
        const isStatusOnlyUpdate = Object.keys(updateData).length > 0 && Object.keys(updateData).every((key) => key === 'status');

        let isCropOwner = false;
        if (isStatusOnlyUpdate && ['Accepted', 'Rejected'].includes(updateData.status)) {
            const linkedCrop = await cropsCollection.findOne({ _id: new ObjectId(existingBid.cropId) });
            isCropOwner = linkedCrop && String(linkedCrop.farmerId) === String(req.user.id);
        }

        if (!isBidOwner && !isCropOwner) {
            return res.status(403).json({ message: 'You are not allowed to update this bid' });
        }

        await bidsCollection.findOneAndUpdate(
            { _id: new ObjectId(req.params.id) },
            { $set: updateData },
            { returnDocument: 'after' } 
        );

        const updatedBid = await bidsCollection.findOne({ _id: new ObjectId(req.params.id) });
        res.status(200).json(updatedBid); 
    } catch (error) {
        res.status(500).json({ error: "Failed to update bid" });
    }
});

// 6. DELETE: Withdraw/Remove a bid
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const bidsCollection = client.db("AgriDB").collection("bids");
        const cropsCollection = client.db("AgriDB").collection("Crops");
        const existingBid = await bidsCollection.findOne({ _id: new ObjectId(req.params.id) });

        if (!existingBid) {
            return res.status(404).json({ message: 'Bid not found' });
        }

        const isBidOwner = String(existingBid.buyerId) === String(req.user.id);

        let isCropOwnerForRejectedBid = false;
        if (existingBid.status === 'Rejected') {
            const linkedCrop = await cropsCollection.findOne({ _id: new ObjectId(existingBid.cropId) });
            isCropOwnerForRejectedBid = linkedCrop && String(linkedCrop.farmerId) === String(req.user.id);
        }

        if (!isBidOwner && !isCropOwnerForRejectedBid) {
            return res.status(403).json({ message: 'You are not allowed to delete this bid' });
        }

        const result = await bidsCollection.deleteOne({ _id: new ObjectId(req.params.id) });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Bid not found' });
        }
        res.status(200).json({ message: 'Bid deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete bid" });
    }
});

module.exports = router;