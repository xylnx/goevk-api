const { COLOR } = require('./utils/COLORS');
const fs = require('fs');
const axios = require('axios');
const fetch = require('node-fetch');

// Read test data from a local file
function readFile(file, { json = false } = {}) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      }
      if (json) {
        resolve(JSON.parse(data));
      }
      resolve(data);
    });
  });
}

// get live html from sites
function getHtml(url) {
  const request = axios.get(url);
  const data = request
    .then((response) => response.data)
    .catch((error) => console.log(error));
  return data;
}

// Get live JSON data
async function getJSON(url) {
  const events = [];
  const response = await fetch(url);
  const data = await response.text();
  return data;
}

module.exports = {
  readFile,
  getHtml,
  getJSON,
};
