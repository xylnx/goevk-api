/* ************************************************************
 * This module requests a json file from the DT website
 * The file contains data on current events taking place in the DT
 * The module then parses information such as event titles + dates
 * It instantiates a custom object for each event
 * And ultimately returns an array containing these objects
 * ********************************************************* */

/* ************************************************************
 * MODULES
 * ********************************************************* */

// Node core modules
const path = require('path');

const cheerio = require('cheerio');

// Helpers
const { readFile, getJSON, getHtml } = require('./getHtml');
const { signalExecution, signalTestData } = require('./utils/signals');
const Event = require('./Event');
const { getInnerHTML } = require('domutils');

/* ************************************************************
 * VARIABLES
 * ********************************************************* */

// Constants are used to enrich event data
const CONSTANTS = {
  place: 'Deutsches Theater',
  eventType: 'Theater, Kultur, Veranstaltungen',
  linkRoot: 'https://www.dt-goettingen.de/stueck/',
};

// Testing and debuging
const scriptName = path.basename(__filename);
const TEST_DATA = `${__dirname}/test_data/dt.html`;
const testData = process.env.TEST_DATA === 'true';
const debug = process.env.DEBUG === 'true';

// Live data
const LIVE_DATA = 'https://www.dt-goettingen.de/spielplan';

/* ************************************************************
 * DEFINE WHICH DATA TO USE WHEN
 * Read from a file => debugging/testing
 * Read from the website => prduction
 * ********************************************************* */

// In parseEvents() we call `getData(source)`
let source; // a file path or url
let getData; // a function => readFile or getJSON

// Determine which fn and which source to use
/*
if (testData) {
  signalTestData();
  source = TEST_DATA;
  getData = readFile;
}
if (!testData) {
  source = LIVE_DATA;
  getData = getJSON;
}
*/

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

const parseEvents = async () => {
  // const json = await getData(source);
  // const data = JSON.parse(json);
  // const html = await readFile(TEST_DATA);
  const html = await getHtml(LIVE_DATA);

  const $ = cheerio.load(html);

  const json = $('#__NEXT_DATA__').html();
  const data = JSON.parse(json);
  // console.log(events.props.pageProps.initialData.pageData.schedule);

  // Isolate relevant data
  const data_events = data.props.pageProps.initialData.pageData.schedule;

  // Parse data, create objs containg this data + push them into an array
  const events = [];
  for (let entry of data_events) {
    // Parse a single event's data
    const name = entry.performance.title;
    const link = CONSTANTS.linkRoot + entry.performance.slug;
    const date = buildDate(entry);

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
  }
  // For convenience:
  // Print this module's name
  signalExecution(scriptName);
  // DEBUGGING: Print events array
  if (debug) console.log(events);

  return events;
};

// DEBUGGING: Run module without calling parseEvents() from another module
if (debug) parseEvents();

module.exports = {
  parseEvents,
};
