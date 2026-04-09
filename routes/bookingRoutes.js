const express = require('express');
const router = express.Router();
const { client } = require('../db');
const { ObjectId } = require('mongodb');
const authMiddleware = require('../middleware/authMiddleware');

const db = client.db("AgriDB");
const bookingsCollection = db.collection("bookings");
const storagesCollection = db.collection("cold storages");

// 1. Create a new storage booking request
router.post('/add', authMiddleware, async (req, res) => {
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
router.get('/', authMiddleware, async (req, res) => {
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
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body || {};

        const existingBooking = await bookingsCollection.findOne({ _id: new ObjectId(id) });

        if (!existingBooking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        const isFarmer = String(existingBooking.farmerId) === String(req.user.id);
        const isOwner = String(existingBooking.cs_ownerId) === String(req.user.id);

        if (!isFarmer && !isOwner) {
            return res.status(403).json({ message: "You are not allowed to update this booking" });
        }

        if (isOwner) {
            const allowedOwnerStatuses = ['Approved', 'Declined', 'Pending'];
            if (!('status' in updateData) || Object.keys(updateData).length !== 1 || !allowedOwnerStatuses.includes(updateData.status)) {
                return res.status(400).json({ message: "Owners can only change booking status" });
            }
        }

        if (isFarmer) {
            if (existingBooking.status !== 'Pending') {
                return res.status(400).json({ message: "Only pending bookings can be modified by farmers" });
            }

            const allowedFarmerFields = ['crop', 'weight', 'from_date', 'status'];
            const hasInvalidField = Object.keys(updateData).some((key) => !allowedFarmerFields.includes(key));
            if (hasInvalidField) {
                return res.status(400).json({ message: "Invalid fields in booking update" });
            }

            if ('status' in updateData && updateData.status !== 'Cancelled') {
                return res.status(400).json({ message: "Farmers can only set status to Cancelled" });
            }
        }

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

// 4. Delete booking by role and status
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const existingBooking = await bookingsCollection.findOne({ _id: new ObjectId(id) });

        if (!existingBooking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        const isFarmer = String(existingBooking.farmerId) === String(req.user.id);
        const isOwner = String(existingBooking.cs_ownerId) === String(req.user.id);

        if (!isFarmer && !isOwner) {
            return res.status(403).json({ message: "You are not allowed to delete this booking" });
        }

        // Cold storage owner can clean up only declined requests.
        if (isOwner && existingBooking.status !== 'Declined') {
            return res.status(400).json({ message: "Owners can only delete declined bookings" });
        }

        // Farmer can remove pending/declined requests and completed storage allocations.
        if (isFarmer && !['Pending', 'Declined', 'Approved'].includes(existingBooking.status)) {
            return res.status(400).json({ message: "This booking status cannot be deleted by farmer" });
        }

        if (isFarmer && existingBooking.status === 'Approved') {
            const facility = await storagesCollection.findOne({ _id: new ObjectId(existingBooking.facility_id) });

            if (facility) {
                const restoredCapacity = Math.min(
                    Number(facility.total_capacity || 0),
                    Number(facility.available_capacity || 0) + Number(existingBooking.weight || 0)
                );

                await storagesCollection.updateOne(
                    { _id: facility._id },
                    { $set: { available_capacity: restoredCapacity } }
                );
            }
        }

        const result = await bookingsCollection.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Booking not found" });
        }

        res.status(200).json({ message: "Booking deleted successfully" });
    } catch (error) {
        console.error("Delete Booking Error:", error);
        res.status(500).json({ error: "Failed to delete booking" });
    }
});

module.exports = router;