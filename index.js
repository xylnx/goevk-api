const fs = require('fs');
const express = require('express');
const cors = require('cors');

const server = express();

// process.env.PORT: heroku sets a corresponding environment var
// locally PORT 5000 is used
const PORT = process.env.PORT || 5000;
const JSON_PATH = `${__dirname}/data/events.json`;

// CORS middleware
server.use(
  cors({
    origin: '*',
    methods: 'GET',
  })
);

// server.use(cors());

server.listen(PORT, () => {
  console.log('Server listening on %PORT%'.replace('%PORT%', PORT));
});

// ENDPOINTS
server.get('/events.json', (req, res) => {
  fs.readFile(JSON_PATH, 'utf-8', (err, data) => {
    console.log(data);
    res.writeHeader(200, { 'Content-Type': 'application/json' });
    res.end(data);
    // res.end(JSON.stringify({ a: 1 }));
  });
});

server.get('/bvents.json', (req, res) => {
  fs.readFile(`${__dirname}/data/bvents.json`, 'utf-8', (err, data) => {
    console.log(data);
    res.writeHeader(200, { 'Content-Type': 'application/json' });
    res.end(data);
    // res.end(JSON.stringify({ a: 1 }));
  });
});

// Default response for any other request
server.use(function (req, res) {
  res.status(404);
});
