# GOEVK API

## What it is

`Goevk api` combines a minimalist API and a growing number of web scrapers. The API delivers data on events taking place in the city of Goettingen, Germany.

## Why it exists

Create a source to easily and quickly get an overview on what is going on in your favorite town.

## How it works

The API is built around node.js and express. The scrapers use node.js and cheerio.

The Scrapers extract information on events from local websites. Everything is stored as JSON in a local file and/or a redis instance. The data can then be fetched using the two routes `events.json` (local file) and `/bvents.json` (redis).

## Productive application

The app currently runs in a heroku dyno. The API serves data, which is scraped once a day at 5:00am.
There is a [frontend built to display this data in a more human readable form](https://xylnx.github.io/goevk). Enjoy!

## Usage

### Scripts

#### `npm run parseEnv` (helper)

Parse environmental variables. They can be defined in a `.env` file. The file has to be put in the project's root directory.

#### `npm run start`

Run `parseEnv` and start the API. This will make the two endpoints `/events.json` `/bvents.json` available. This task is also run by heroku in the production environment (cp. `Procfile`).

#### `npm run scrape`

Run the scrapers and save data in a redis data store. This task is used in the heroku instance to update event data.

#### `npm run scrapeTD`

Run the scrapers using test data. Typically used in development to prevent excessive requests.

#### `npm run updateLocalEventData`

Update a local version of a JSON file containing scraped data. The file is mainly used for local development of the API as well as the corresponding frontend application: It makes local requests possible without having a redis instance installed.

#### `npm debug <scraperName>`

Run individual scraper, scrape websites and display data in the console. `debug` is used for developing and debugging scrapers.

#### `debugTD <scraperName>`

Same as `debug`, only using test data instead of real world data. The script is especially helpfull when building new scrapers and debugging.

#### `npm run deploy`

Deploy the app to heroku.
