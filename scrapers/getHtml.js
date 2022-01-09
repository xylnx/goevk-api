const { COLOR } = require('./utils/COLORS');
const fs = require('fs');
const axios = require('axios');

// Read test data from a local file
function readFile(file) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, 'utf8', (err, data) => {
      if (err) {
        reject(err);
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

module.exports = {
  readFile,
  getHtml,
};
