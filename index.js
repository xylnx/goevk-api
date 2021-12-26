const fs = require('fs');
const http = require('http');
// process.env.PORT is used by heroku
const PORT = process.env.PORT || 5000;

const JSON_PATH = `${__dirname}/data/events.json`;

const server = http.createServer((req, res) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
    'Access-Control-Max-Age': 2592000, // 30 days
    /* 'Content-type': 'application/json',*/
    /** add other headers as per requirement */
  };

  const JSON = fs.readFile(JSON_PATH, 'utf-8', (err, data) => {
    if (err)
      return console.log('AN ERROR OCCURRED reading "events.json":', err);

    if (req.method === 'OPTIONS') {
      res.writeHead(204, headers);
      res.end();
      return;
    }

    if (['GET', 'POST'].indexOf(req.method) > -1) {
      res.writeHead(200, headers);
      res.end(data);
      return;
    }
  });
});

// server.listen(8000, '127.0.0.1', () =>
//   console.log('listening for reqs on "http://localhost:8000"')
// );
//
//
server.listen(PORT, () => console.log(`Listening on ${PORT}`));
