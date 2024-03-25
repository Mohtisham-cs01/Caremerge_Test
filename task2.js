const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const async = require('async');

const app = express();

app.get('/I/want/title/', (req, res) => {
    // const addresses = req.query.address;
    const addresses = Array.isArray(req.query.address) ? req.query.address : [req.query.address];

    if (!addresses || addresses.length === 0 || !addresses[0] ) {
        return res.status(400).send('Bad Request: At least one address is required');
    }

    async.map(addresses, fetchTitle, (err, titles) => {
        if (err) {
            console.error('Error fetching titles:', err);
            return res.status(500).send('Internal Server Error');
        }

        sendResponse(res, titles);
    });
});

function fetchTitle(address, callback) {
    if (!address.startsWith('http://') && !address.startsWith('https://')) {
        address = 'https://' + address;
    }

    axios.get(address)
        .then(response => {
            const $ = cheerio.load(response.data);
            const title = $('title').text();
            callback(null, { address, title: title || 'NO RESPONSE' });
        })
        .catch(error => {
            console.error('Error fetching title:', error.message);
            callback(null, { address, title: 'NO RESPONSE' });
        });
}

function sendResponse(res, titles) {
    const html = `<html><head></head><body><h1>Following are the titles of given websites:</h1><ul>${titles.map(title => `<li>${title.address} - "${title.title}"</li>`).join('')}</ul></body></html>`;
    res.send(html);
}

app.all('*', (req, res) => {
    res.status(404).send('404 Not Found');
});


app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
