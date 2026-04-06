const express = require('express');
const cors = require('cors'); // Added CORS
const { connectDB, client } = require('./db');

// Import all routers
const cropRoutes = require('./routes/cropRoutes'); 
const bidRoutes = require('./routes/bidRoutes');
const storageRoutes = require('./routes/storageRoutes');
const farmerRoutes = require('./routes/farmerRoutes');
const buyerRoutes = require('./routes/buyerRoutes');
const csOwnerRoutes = require('./routes/csOwnerRoutes');
const authRoutes = require('./routes/authRoutes');
const marketRoutes = require('./routes/marketRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

const port = 5500;

const app = express();
app.use(express.json());
app.use(cors()); // Enabled CORS

const db = client.db("AgriDB");

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Server is healthy' });
});

// Mount all routers
app.use('/api/crops', cropRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/cold-storages', storageRoutes);
app.use('/api/farmers', farmerRoutes);
app.use('/api/buyers', buyerRoutes);
app.use('/api/cs_owners', csOwnerRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/bookings', bookingRoutes);

if (require.main === module) {
    connectDB().then(() => {
        app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
        });
    });
}

module.exports = app;