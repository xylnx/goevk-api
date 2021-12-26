const fs = require('fs');
const express = require('express');
const cors = require('cors');

const server = express();
// process.env.PORT is used by heroku
const PORT = process.env.PORT || 5000;
const JSON_PATH = `${__dirname}/data/events.json`;

// CORS middleware
// server.use(
//   cors({
//     origin: '*',
//     methods: 'GET'
//   }
// ));

server.use(cors());

server.listen(PORT, () => {
  console.log('Server listening on %PORT%'.replace('%PORT%', PORT));
});

// ENDPOINTS
server.get('/', (req, res) => {
  fs.readFile(JSON_PATH, 'utf-8', (err, data) => {
    console.log(data);
    res.json(data);
  });
});

// Default response for any other request
server.use(function (req, res) {
  res.status(404);
});
