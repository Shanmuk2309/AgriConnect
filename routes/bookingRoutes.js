const express = require('express');
const router = express.Router();
const { client } = require('../db');
const { ObjectId } = require('mongodb');

const db = client.db("AgriDB");
const bookingsCollection = db.collection("bookings");

// 1. Create a new storage booking request
router.post('/add', async (req, res) => {
    try {
        const newBooking = req.body;
        newBooking.date = new Date().toISOString().split('T')[0]; // Store today's date
        
        const result = await bookingsCollection.insertOne(newBooking);
        res.status(201).json({ message: "Booking requested successfully", bookingId: result.insertedId });
    } catch (error) {
        console.error("Booking Error:", error);
        res.status(500).json({ error: "Failed to create booking" });
    }
});

// 2. Fetch bookings (Can filter by farmerId or cs_ownerId)
router.get('/', async (req, res) => {
    try {
        const { farmerId, cs_ownerId } = req.query;
        let filter = {};
        
        if (farmerId) filter.farmerId = farmerId;
        if (cs_ownerId) filter.cs_ownerId = cs_ownerId;

        const bookings = await bookingsCollection.find(filter).toArray();
        res.status(200).json(bookings);
    } catch (error) {
        console.error("Fetch Bookings Error:", error);
        res.status(500).json({ error: "Failed to fetch bookings" });
    }
});

// 3. Update a booking's status (Approve/Decline)
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const result = await bookingsCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Booking not found" });
        }
        res.status(200).json({ message: "Booking updated successfully" });
    } catch (error) {
        console.error("Update Booking Error:", error);
        res.status(500).json({ error: "Failed to update booking" });
    }
});

module.exports = router;