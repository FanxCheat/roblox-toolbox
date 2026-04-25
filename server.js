const express = require('express');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

/* ================================
   ФУНКЦИЯ ПОЛУЧЕНИЯ THUMBNAILS
================================ */
async function getThumbnails(assetIds) {
    if (!assetIds.length) return [];

    const url = `https://thumbnails.roblox.com/v1/assets?assetIds=${assetIds.join(",")}&size=150x150&format=Png`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.data || [];
    } catch (err) {
        console.log("Thumbnail error:", err);
        return [];
    }
}

/* ================================
   ПОИСК
================================ */
app.get('/search', async (req, res) => {
    const query = req.query.q || '';
    const page = parseInt(req.query.page) || 1;
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

        const items = data.data || [];
        const ids = items.map(item => item.id);

        const thumbnails = await getThumbnails(ids);

        const results = items.map((item, index) => ({
            id: item.id,
            name: item.name,
            thumbnail: thumbnails[index]?.imageUrl || ""
        }));

        res.json({
            results,
            totalPages: data.totalPages || 1
        });

    } catch (error) {
        console.log("Search error:", error);
        res.json({ results: [], totalPages: 1 });
    }
});

/* ================================
   ПОПУЛЯРНЫЕ
================================ */
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

        const items = data.data || [];
        const ids = items.map(item => item.id);

        const thumbnails = await getThumbnails(ids);

        const results = items.map((item, index) => ({
            id: item.id,
            name: item.name,
            thumbnail: thumbnails[index]?.imageUrl || ""
        }));

        res.json(results);

    } catch (error) {
        console.log("Popular error:", error);
        res.json([]);
    }
});

/* ================================
   ГЛАВНАЯ
================================ */
app.get('/', (req, res) => {
    res.send('Roblox Toolbox Proxy Server is running!');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
