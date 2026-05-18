const express = require('express');
const axios = require('axios');
require('dotenv').config();
const router = express.Router();

// Helper to format string to Title Case (e.g., "tomato" -> "Tomato", "andhra pradesh" -> "Andhra Pradesh")
const formatAgmarknetString = (str) => {
    if (!str) return '';
    return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const fetchMarketPrices = async (req, res) => {
    try {
        // Support both GET (query params) and POST (JSON body) clients.
        const input = req.method === 'POST' ? req.body : req.query;
        const { commodity, state, district } = input;
        const apiUrl = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070'; 
        
        // Generate Today's Date
        const today = new Date();
        const currentDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

        // Base parameters
        const baseParams = {
            'api-key': process.env.AGMARKET_API_KEY,
            format: 'json',
            limit: 50, // Fetch up to 50 records at a time
        };

        // Apply formatting so any user input works flawlessly
        if (commodity) baseParams['filters[commodity]'] = formatAgmarknetString(commodity);
        if (state) baseParams['filters[state.keyword]'] = formatAgmarknetString(state);      
        if (district) baseParams['filters[district]'] = formatAgmarknetString(district);

        // Fetch the latest available records without date filter
        const response = await axios.get(apiUrl, { params: baseParams });
        
        let validRecords = [];
        let actualDateFetched = currentDate;

        if (response.data.records && response.data.records.length > 0) {
            // Get the date of the most recent record
            actualDateFetched = response.data.records[0].arrival_date || currentDate;
            
            // Filter to ensure no mixed dates are returned
            validRecords = response.data.records.filter(r => r.arrival_date === actualDateFetched);
        }

        // Send data to frontend
        res.status(200).json({
            success: true,
            date_fetched: actualDateFetched,
            records: validRecords
        });

    } catch (error) {
        const apiError = error.response ? error.response.data : error.message;
        console.error("AGMARKNET REJECTION DETAILS:", apiError);

        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch market prices from Agmarknet." 
        });
    }
};

router.get('/prices', fetchMarketPrices);
router.post('/prices', fetchMarketPrices);

module.exports = router;