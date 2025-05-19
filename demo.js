/* eslint-disable prettier/prettier */
const axios = require('axios');

const url = 'http://localhost:12110/datastores';
const username = 'admin';
const password = 'admin';

// Encode credentials in Base64
const basicAuth = Buffer.from(`${username}:${password}`).toString('base64');

axios
    .get(url, {
        headers: {
            Authorization: `Basic ${basicAuth}`
        }
    })
    .then((response) => {
        console.log('Status:', response.status);
        console.log('Data:\n', response.data);
    })
    .catch((error) => {
        if (error.response) {
            console.error('Error Status:', error.response.status);
            console.error('Error Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    });
