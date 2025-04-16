const express = require('express');
const path = require('path');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API: Get latest prices
app.get('/api/prices', async (req, res) => {
    try {
        const params = {
            ids: 'bitcoin,ethereum,dogecoin',
            vs_currencies: 'usd',
            include_24hr_change: 'true'
        };

        // Add API key if available
        if (COINGECKO_API_KEY) {
            params.x_cg_pro_api_key = COINGECKO_API_KEY;
        }

        const baseUrl = COINGECKO_API_KEY
 'https://api.coingecko.com/api/v3/simple/price';

        const response = await axios.get(baseUrl, { params });

        res.json(response.data);
    } catch (err) {
        console.error('Error fetching prices:', err);
        res.status(500).json({ error: 'Failed to fetch prices' });
    }
});

// API: Historical chart data
app.get('/api/history/:coin', async (req, res) => {
    try {
        const { coin } = req.params;
        const { days } = req.query;

        const params = {
            vs_currency: 'usd',
            days: days || '7',
            interval: 'daily'
        };

        // Add API key if available
        if (COINGECKO_API_KEY) {
            params.x_cg_pro_api_key = COINGECKO_API_KEY;
        }

        const baseUrl = COINGECKO_API_KEY
             `https://api.coingecko.com/api/v3/coins/${coin}/market_chart`;

        const response = await axios.get(baseUrl, { params });

        res.json(response.data);
    } catch (err) {
        console.error(`Error fetching history for ${req.params.coin}:`, err);
        res.status(500).json({ error: `Failed to fetch history for ${req.params.coin}` });
    }
});

// API: News (Mock)
app.get('/api/news', (req, res) => {
    const mockNews = [
        {
            id: 1,
            title: "Regulatory Developments Shaping the Future of Crypto",
            summary: "Learn how new regulations are affecting cryptocurrency markets worldwide.",
            category: "NEWS",
            color: "blue",
            publishedAt: new Date().toISOString()
        },
        {
            id: 2,
            title: "How to Read Full Chart Patterns for Better Trading",
            summary: "Master technical analysis with our comprehensive guide to chart patterns.",
            category: "GUIDE",
            color: "purple",
            publishedAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
            id: 3,
            title: "DeFi's Latest Yields Are Attracting New Investors",
            summary: "Discover how decentralized finance is changing the landscape of investing.",
            category: "DEFI",
            color: "orange",
            publishedAt: new Date(Date.now() - 172800000).toISOString()
        }
    ];
    res.json(mockNews);
});

// API: Newsletter subscribe
app.post('/api/subscribe', (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    // Mock saving to DB
    res.json({ success: true, message: 'Successfully subscribed to newsletter' });
});

// Catch-all route to serve frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
