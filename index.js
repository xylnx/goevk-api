const fs = require('fs');
const http = require('http');

const JSON_PATH = `${__dirname}/data/events.json`;

const server = http.createServer((req, res) => {
  const JSON = fs.readFile(JSON_PATH, 'utf-8', (err, data) => {
    if (err)
      return console.log('AN ERROR OCCURRED reading "events.json":', err);

    res.writeHead(200, { 'Content-type': 'application/json' });
    res.end(data);
  });
});

server.listen(8000, '127.0.0.1', () =>
  console.log('listening for reqs on "http://localhost:8000"')
);
