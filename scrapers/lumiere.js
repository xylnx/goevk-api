const path = require('path');
const fetch = require('node-fetch');

const { signalExecution, signalTestData } = require('./utils/signals');
const { readFile, getHtml } = require('./getHtml');
const Event = require('./Event');
const { eventTypes: eT } = require('../utils/eventTypes');

const scriptName = path.basename(__filename);
const debug = process.env.DEBUG === 'true';
const testData = process.env.TEST_DATA === 'true';

// Get json data from here
const url =
  'https://www.kinoheld.de/ajax/getShowsForCinemas?cinemaIds[]=728&lang=en';

// TESTDATA
const test_data = `${__dirname}/test_data/testData-melies.json`;

// Metadata to enrich the event objects
const CONSTANTS = {
  place: 'Lumière',
  eventType: `${eT.cinema}`,
  linkRoot:
    'https://www.kinoheld.de/cinema-goettingen/kino-lumiere-goettingen/show/',
  link: 'https://lumiere-melies.de/lumiere-programm/',
};

// Get JSON data
async function getData(url) {
  const events = [];
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

// Put together an array with event objects
// containing all relevant event info
function parseEvents(data) {
  let events = [];

  // Loop over json data
  // extract information you want
  // create a date object
  // put everything into an event object
  // add in the venue name
  // build the link to the event
  data.shows.forEach((show) => {
    // const event = {};
    const date = show.date;
    const time = show.time;
    const dateObj = createDateObj(date, time);

    const event = new Event(
      CONSTANTS.eventType,
      CONSTANTS.place,
      show.name,
      CONSTANTS.linkRoot + show.id,
      // CONSTANTS.link,
      dateObj,
    );

    events.push(event);

    // Log new event
    if (testData) signalTestData();
    console.log(event);
  });
  return events;
}

function createDateObj(date, time) {
  const dateStr = `${date}T${time}`;
  const dateObj = new Date(dateStr);
  return dateObj;
}

async function init() {
  signalExecution(scriptName);
  let data;

  // prettier-ignore
  testData ?
    data = await readFile(test_data) :
    data = await getData(url);

  // parse test data into an object, if using test data
  if (testData) data = JSON.parse(data);

  const events = await parseEvents(data);
  return events;
}

if (debug) init();
module.exports.parseEvents = init;
