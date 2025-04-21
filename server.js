const express = require('express');
const path = require('path');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const NEWS_API_KEY = process.env.NEWS_API_KEY || 'YOUR_NEWS_API_KEY'; // Store this in .env file

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API: Get current prices (only 3 coins)
app.get('/api/prices', async (req, res) => {
    try {
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
            params: {
                ids: 'bitcoin,ethereum,dogecoin',
                vs_currencies: 'inr', // Changed to INR for Indian Rupees
                include_24hr_change: 'true'
            }
        });
        res.json(response.data);
    } catch (err) {
        console.error('Error fetching prices:', err);
        res.status(500).json({ error: 'Failed to fetch prices' });
    }
});

// API: Historical chart data for 3 coins
app.get('/api/history/:coin', async (req, res) => {
    try {
        const { coin } = req.params;
        const { days = '7' } = req.query;

        const allowedCoins = ['bitcoin', 'ethereum', 'dogecoin'];
        if (!allowedCoins.includes(coin)) {
            return res.status(400).json({ error: 'Invalid coin' });
        }

        const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${coin}/market_chart`, {
            params: {
                vs_currency: 'inr', // Changed to INR for Indian Rupees
                days,
                interval: 'daily'
            }
        });

        const chartData = {
            labels: response.data.prices.map(price => {
                const date = new Date(price[0]);
                return `${date.getMonth() + 1}/${date.getDate()}`;
            }),
            prices: response.data.prices.map(price => price[1])
        };

        res.json(chartData);
    } catch (err) {
        console.error(`Error fetching history for ${req.params.coin}:`, err);
        res.status(500).json({ error: 'Failed to fetch history data' });
    }
});

// NEW API: Get latest news for each cryptocurrency from India
app.get('/api/news', async (req, res) => {
    try {
        // Create requests for news about each coin
        const bitcoinNews = axios.get('https://newsapi.org/v2/top-headlines', {
            params: {
                country: 'in', // India
                q: 'bitcoin',
                apiKey: NEWS_API_KEY
            }
        });
        
        const ethereumNews = axios.get('https://newsapi.org/v2/top-headlines', {
            params: {
                country: 'in', // India
                q: 'ethereum',
                apiKey: NEWS_API_KEY
            }
        });
        
        const dogecoinNews = axios.get('https://newsapi.org/v2/top-headlines', {
            params: {
                country: 'in', // India
                q: 'dogecoin',
                apiKey: NEWS_API_KEY
            }
        });

        // Get all responses in parallel
        const [bitcoinResponse, ethereumResponse, dogecoinResponse] = await Promise.all([
            bitcoinNews,
            ethereumNews,
            dogecoinNews
        ]);

        // If not enough results from top headlines, use everything endpoint as fallback
        const getBackupNews = async (keyword) => {
            const response = await axios.get('https://newsapi.org/v2/everything', {
                params: {
                    q: `${keyword} AND (india OR indian OR "in")`,
                    language: 'en',
                    sortBy: 'publishedAt',
                    pageSize: 5,
                    apiKey: NEWS_API_KEY
                }
            });
            return response.data.articles;
        };

        // Process news data and add fallback if needed
        let bitcoin = bitcoinResponse.data.articles;
        let ethereum = ethereumResponse.data.articles;
        let dogecoin = dogecoinResponse.data.articles;

        // If we don't have enough results, use the fallback
        if (bitcoin.length < 3) {
            bitcoin = await getBackupNews('bitcoin');
        }
        if (ethereum.length < 3) {
            ethereum = await getBackupNews('ethereum');
        }
        if (dogecoin.length < 3) {
            dogecoin = await getBackupNews('dogecoin');
        }

        // Format and slice the news to 5 articles max per coin
        const formatNews = (articles, coinType) => {
            return articles.slice(0, 5).map(article => ({
                coinType,
                source: article.source.name,
                title: article.title,
                description: article.description,
                url: article.url,
                publishedAt: article.publishedAt,
                urlToImage: article.urlToImage
            }));
        };

        // Combine all news
        const combinedNews = {
            bitcoin: formatNews(bitcoin, 'bitcoin'),
            ethereum: formatNews(ethereum, 'ethereum'),
            dogecoin: formatNews(dogecoin, 'dogecoin')
        };

        res.json(combinedNews);
    } catch (err) {
        console.error('Error fetching news:', err);
        res.status(500).json({ error: 'Failed to fetch news', details: err.message });
    }
});

// Serve frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server is running at http://localhost:${PORT}`);
});