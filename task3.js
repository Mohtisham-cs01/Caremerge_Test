const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();

app.get('/I/want/title/', async (req, res) => {
    let addresses = req.query.address;

    if (!addresses || addresses.length === 0 ) {
        return res.status(400).send('Bad Request: At least one address is required');
    }

    if (!Array.isArray(addresses)) {
        addresses = [addresses];
    }

    try {
        let titles = [];
        for (let i=0;i<addresses.length;i++) {
            titles[i] = await fetchTitle(addresses[i]);
        }

        // const titles = await Promise.all(addresses.map(fetchTitle));

        sendResponse(res, titles);
    } catch (error) {
        console.error('Error fetching titles:', error);
        res.status(500).send('Internal Server Error');
    }
});

function fetchTitle(address) {
    if (!address.startsWith('http://') && !address.startsWith('https://')) {
        address = 'https://' + address;
    }

    return axios.get(address)
        .then(response => {
            const $ = cheerio.load(response.data);
            const title = $('title').text();
            return { address, title: title || 'NO RESPONSE' };
        })
        .catch(error => {
            console.error('Error fetching title:', error.message);
            return { address, title: 'NO RESPONSE' };
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
