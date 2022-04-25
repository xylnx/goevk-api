/* ========================================================== >> 
 * This module parses events from a website:
 * https://www.apex-goe.de/programm/index.html
 * Event information is then stored in an object 
 * The module finally returns an array of these objects
  << ========================================================== */

// MODULES

// Node core modules
const path = require('path');

// Third party modules
const cheerio = require('cheerio'); // used to parse HTML

// Helpers
const { signalExecution, signalTestData } = require('./utils/signals');
const { readFile, getHtml } = require('./getHtml');
const { monthsLong } = require('./utils/months');
const { createDate } = require('./utils/createDate');
const Event = require('./Event');

// VARS

// Debugging
const scriptName = path.basename(__filename);
const debug = process.env.DEBUG === 'true';
const testData = process.env.TEST_DATA === 'true';

// Source data from here
const LIVE_DATA = 'https://www.apex-goe.de/programm/index.html';
const TEST_DATA = `${__dirname}/test_data/apex.html`;

// Meta data to enrich event objects
const CONSTANTS = {
  place: 'Apex',
  eventType: 'Konzert, Veranstaltungen',
};

// FUNCTIONS

// Take the website's html
// Extract relevant data
// Return an object containing this raw data
async function parseEventsData(html) {
  const $ = cheerio.load(html);
  const raw_events_data = $('.veranstaltung')
    .get()
    .map((event) => {
      return {
        kuenstler: $(event).find('.kuenstler').text(),
        title: $(event).find('a').text(),
        time: $(event).find('.datum').text(),
        link: $(event).find('a').attr('href'),
      };
    });

  return raw_events_data;
}

// Take extracted raw data objects
// Apply functions to clean it up, add a date object etc.
// Return an array with cleaned up data
async function cleanData(rawEventData) {
  const cleanData = rawEventData.map((event) => {
    return {
      name:
        event.kuenstler.trim() +
        ': ' +
        event.title.replace('»mehr...', '').trim(),
      date: createDateObj(event.time),
      link: event.link,
    };
  });
  return cleanData;
}

// Helper to clean data:
// Take a piece of raw data extracted from the website
// Return a date object
function createDateObj(rawDateInfo) {
  // example rawDateInfo:
  // `Donnerstag, 19. Mai 2022, 20.15 Uhr`
  const dateArr = rawDateInfo.split(' ');

  // example dateArr:
  // [ 'Donnerstag,', '19.', 'Mai', '2022,', '20.15', 'Uhr' ]
  const day = parseInt(dateArr[1].replace('.', ''));
  const month = parseInt(monthsLong.indexOf(dateArr[2].toLowerCase()));
  const year = parseInt(dateArr[3]);

  const timeArr = dateArr[4].split('.');
  const hour = parseInt(timeArr[0]);
  const minute = parseInt(timeArr[1]);

  const eventDate = createDate(year, month, day, hour, minute);

  // console.log({ year }, { month }, { day }, { hour }, { minute });

  return eventDate;
}

// Take an in array of objects with cleaned data on events
// Instantiate a new object using this data + additional meta data
// Return an array containing these new objects
async function createEventObjs(cleanEventData) {
  const eventObjs = [];

  cleanEventData.forEach((event) => {
    eventObjs.push(
      new Event(
        CONSTANTS.eventType,
        CONSTANTS.place,
        event.name,
        event.link,
        event.date
      )
    );
  });

  return eventObjs;
}

async function init() {
  let html;
  // Get html
  // prettier-ignore
  testData ? 
    (html = await readFile(TEST_DATA)) : 
    (html = await getHtml(LIVE_DATA));

  // Parse relevant data
  const raw_event_data = await parseEventsData(html);
  // Clean data
  const clean_event_data = await cleanData(raw_event_data);
  // Enrich data and put it into objects
  const events = await createEventObjs(clean_event_data);
  // Return an array of event objects
  return events;
}

// DEBUGGING
if (debug) {
  init().then((events) => {
    signalExecution(scriptName);
    if (testData) signalTestData();
    console.log({ events });
    if (testData) signalTestData();
  });
}

module.exports.parseEvents = init;
