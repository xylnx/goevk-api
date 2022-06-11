/* ************************************************************
 * This module requests a json file from a cinemaxx API
 * The file contains data on current film screenings
 * The module parses information such as event titles + dates
 * It instantiates a custom object for each event
 * And ultimately returns an array containing these objects
 * ********************************************************* */

/* ************************************************************
 * MODULES
 * ********************************************************* */

// Node core modules
const path = require('path');

// Helpers
const { readFile, getJSON } = require('./getHtml');
const Event = require('./Event');

/* ************************************************************
 * VARIABLES
 * ********************************************************* */

// Constants are used to enrich event data
const CONSTANTS = {
  place: 'Cinemaxx',
  eventType: 'Kino',
  linkRoot: 'https://www.cinemaxx.de',
};

// Testing and debuging
const debugVars = {
  testData: process.env.TEST_DATA === 'true',
  debug: process.env.DEBUG === 'true',
  scriptName: path.basename(__filename),
  TEST_DATA: `${__dirname}/test_data/cinemaxx.json`,
};

/* LIVE DATA => this script queries an api
 * The endpoint requires a date parameter containing a starting and an end date:
 * => e.g. ?Datum=30-03-2022,06-04-2022
 * The dates are dynamically added for each request, like so:
 * buildDateString => return dates in the right format, eg. 06-04-2022
 * addParams => instantiate start + end date, insert them into the url
 */
const LIVE_DATA = addParams();

function buildDateString(day) {
  const date = day.getDate().toString().padStart(2, '0');
  const month = (day.getMonth() + 1).toString().padStart(2, '0');
  const year = day.getFullYear();
  return `${date}-${month}-${year}`;
}

function addParams() {
  let dayStart = new Date();
  let dayEnd = new Date();
  dayEnd.setDate(dayStart.getDate() + 7);
  dayStart = buildDateString(dayStart);
  dayEnd = buildDateString(dayEnd);
  const params = `${dayStart},${dayEnd}`;
  const URL = `https://www.cinemaxx.de/api/sitecore/WhatsOn/WhatsOnV2Alphabetic?cinemaId=8&Datum=${params}&type=jetzt-im-kino`;
  return URL;
}

/* ************************************************************
 * FUNCTIONS
 * ********************************************************* */

// Find data and instantiate a date obj
// The obj represents the starting date + time of the event
function buildDate(event) {
  const year = event.year;
  const month = event.month - 1;
  const day = event.day;
  const hour = event.start.hour;
  const minute = event.start.minutes;

  return new Date(year, month, day, hour, minute);
}

async function getData() {
  let json;
  let data;

  if (!debugVars.testData) {
    json = await getJSON(LIVE_DATA);
  } else {
    json = await readFile(debugVars.TEST_DATA);
  }

  data = JSON.parse(json);
  return data;
}

const parseEvents = async () => {
  const data = await getData(debugVars, LIVE_DATA);
  // Isolate relevant data
  const data_events = data.WhatsOnAlphabeticFilms;

  // Parse data, create objs containg this data + push them into an array
  const events = [];
  for (let entry of data_events) {
    // Parse a single event's data
    const name = entry.Title;
    const link = CONSTANTS.linkRoot + entry.FilmUrl;

    entry.WhatsOnAlphabeticCinemas.forEach((show) => {
      let date =
        show?.WhatsOnAlphabeticCinemas[0]?.WhatsOnAlphabeticShedules[0].Time;

      if (date) date = new Date(date);
      // Enrich the data + store it in an object
      const event = new Event(
        CONSTANTS.eventType,
        CONSTANTS.place,
        name,
        link,
        date
      );
      // Store event objects in an array
      events.push(event);
    });
  }

  console.log(events);

  return events;
};

// DEBUGGING: Run module without calling parseEvents() from another module
if (debugVars.debug) parseEvents();

module.exports = {
  parseEvents,
};

/* EXAMPLE URL
https://www.cinemaxx.de/api/sitecore/WhatsOn/WhatsOnV2Alphabetic?cinemaId=8&Datum=30-03-2022,05-04-2022&type=jetzt-im-kino
*/
