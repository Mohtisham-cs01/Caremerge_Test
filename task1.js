const express = require('express');
const cheerio = require('cheerio');
const axios = require('axios');

const app = express();
const port = 3000;

app.get('/I/want/title/', (req, res) => {
    let addresses = req.query.address;

    if (!addresses || (Array.isArray(addresses) && addresses.length === 0)) {
        return res.status(400).send('Bad Request: At least one address is required');
    }

    const titles = [];
    let completedRequests = 0;

    if (!Array.isArray(addresses)) {
        addresses = [addresses];
    }

    addresses.forEach((address, index) => {
        fetchTitle(address, (error, title) => {
            titles[index] = title;
            completedRequests++;
            if (completedRequests === addresses.length) {
                sendResponse(res, titles);
            }
        });
    });
});

function fetchTitle(address, callback) {
    if (!address.startsWith('http://') && !address.startsWith('https://')) {
        address = 'https://' + address;
    }

    axios.get(address)
        .then(response => {
            const $ = cheerio.load(response.data);
            const title = $('title').text() || 'NO RESPONSE';
            callback(null, `${address} - "${title}"`);
        })
        .catch(error => {
            console.error(error);
            callback(null, `${address} - NO RESPONSE`);
        });
}

function sendResponse(res, titles) {
    const listItems = titles.map(title => `<li>${title}</li>`).join('');
    const html = `<html><head></head><body><h1>Following are the titles of given websites:</h1><ul>${listItems}</ul></body></html>`;
    res.send(html);
}

// Catch-all route for 404 Not Found
app.all('*', (req, res) => {
    res.status(404).send('404 Not Found');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
