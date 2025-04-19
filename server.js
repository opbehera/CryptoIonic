const express = require('express');
const path = require('path');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY;
const NEWSAPI_KEY = process.env.NEWSAPI_KEY;

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

        const baseUrl = 'https://api.coingecko.com/api/v3/simple/price';

        const headers = {};

        if (COINGECKO_API_KEY) {
            headers['x-cg-demo-api-key'] = COINGECKO_API_KEY;
        }

        const response = await axios.get(baseUrl, {
            params,
            headers
        });

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

        const baseUrl = `https://api.coingecko.com/api/v3/coins/${coin}/market_chart`;

        const headers = {};

        if (COINGECKO_API_KEY) {
            headers['x-cg-demo-api-key'] = COINGECKO_API_KEY;
        }

        const response = await axios.get(baseUrl, {
            params,
            headers
        });

        res.json(response.data);
    } catch (err) {
        console.error(`Error fetching history for ${req.params.coin}:`, err);
        res.status(500).json({ error: `Failed to fetch history for ${req.params.coin}` });
    }
});

// API: NewsAPI - Bitcoin News
app.get('/api/news', async (req, res) => {
    try {
        if (!NEWSAPI_KEY) return res.status(500).json({ error: 'Missing NewsAPI key' });

        const response = await axios.get('https://newsapi.org/v2/everything', {
            params: {
                q: 'bitcoin',
                language: 'en',
                sortBy: 'publishedAt',
                pageSize: 10
            },
            headers: {
                'Authorization': NEWSAPI_KEY
            }
        });

        const articles = response.data.articles.map(article => ({
            title: article.title,
            source: article.source.name,
            description: article.description,
            url: article.url,
            image: article.urlToImage,
            publishedAt: article.publishedAt
        }));

        res.json(articles);
    } catch (err) {
        console.error('Error fetching NewsAPI articles:', err);
        res.status(500).json({ error: 'Failed to fetch NewsAPI articles' });
    }
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
