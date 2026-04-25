const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Поиск ассетов
app.get('/search', async (req, res) => {
    const query = req.query.q || '';
    const page = req.query.page || 1;
    const limit = 50;
    const offset = (page - 1) * limit;
    
    const url = `https://catalog.roblox.com/v1/search/items?category=Models&limit=${limit}&offset=${offset}&keyword=${encodeURIComponent(query)}`;
    
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json'
            }
        });
        const data = await response.json();
        
        const results = (data.data || []).map(item => ({
            id: item.id,
            name: item.name,
            thumbnail: `https://tr.rbxcdn.com/${item.id}/150/150/Image/Png`
        }));
        
        res.json({ results, totalPages: data.totalPages || 1 });
    } catch (error) {
        res.json({ results: [], totalPages: 1 });
    }
});

// Популярные ассеты
app.get('/popular', async (req, res) => {
    const url = `https://catalog.roblox.com/v1/search/items?category=Models&sortType=3&limit=50`;
    
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json'
            }
        });
        const data = await response.json();
        
        const results = (data.data || []).map(item => ({
            id: item.id,
            name: item.name,
            thumbnail: `https://tr.rbxcdn.com/${item.id}/150/150/Image/Png`
        }));
        
        res.json(results);
    } catch (error) {
        res.json([]);
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});