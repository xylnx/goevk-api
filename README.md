# GOEVK API

## What

Goevk api combines a minimalist API and a growing number of web scrapers. The API delivers data on events taking place in the city of Goettingen, Germany: Date, links etc.

## Why

Create a source to easily and quickly get an overview on what is going on in your favorite town.

## How

The api is built around node.js and express. The scrapers use node.js and cheerio.

The Scrapers extract information on events from local websites. Everything is stored as JSON in a local file and/or a redis instance. The data can then be fetched using the two routes `events.json` (local file) and `/bvents.json` (redis). There is a frontend built to display this data in a more human readable form: [](https://xylnx.github.io/goevk/). Enjoy!

## Usage

### Development

#### Start

Run `npm start` or `node index.js`.

#### Use Redis

If you want to use the `/bvents.json` route, you will have to set up redis in advance.

#### Scrape data and store it in a local file

### Deployment

## Licence
