/* ========================================================== >> 
 * This module parses events from a website:
 * https://www.unifilm.de/studentenkinos/goettingen
 * Event information is then stored in an object 
 * The module finally returns an array of these objects
  << ========================================================== */

// MODULES
// Node core
const path = require('path');
// Third party
const cheerio = require('cheerio'); // web scraping

// CUSTOM HELPERS
const { signalExecution, signalTestData } = require('./utils/signals');
const { readFile, getHtml } = require('./getHtml');
const { monthsLong } = require('./utils/months');
const { createDate } = require('./utils/createDate');

const Event = require('./Event');
const { eventTypes } = require('../utils/eventTypes');

// VARIABLES
// Debugging
const scriptName = path.basename(__filename);
const debug = process.env.DEBUG === 'true';
const testData = process.env.TEST_DATA === 'true';

// Data sources
const LIVE_DATA = 'https://www.unifilm.de/studentenkinos/goettingen';
const TEST_DATA = `${__dirname}/test_data/uni-kino.html`;

// Meta data for events
const META = {
  place: 'Uni Kino',
  eventType: eventTypes.cinema,
  link: 'https://www.unifilm.de/studentenkinos/goettingen',
};

// FUNCTIONS
async function parseEventData(html) {
  const $ = cheerio.load(html);
  const raw_event_data = $('.semester-film-row')
    .get()
    .map((event) => {
      return {
        date: $(event).find('.film-row-datum').text(),
        time: $(event).find('.film-row-uhrzeit').text(),
        title: $(event).find('.film-row-titel').text(),
      };
    });
  return raw_event_data;
}

async function cleanRawData(data) {
  const cleanData = data.map((event) => {
    return {
      name: event.title,
      date: createDateObj(event.date, event.time),
    };
  });
  return cleanData;
}

function createDateObj(...args) {
  // args = [ 'Mi. 04.05.2022', '20:00 Uhr' ] ...
  try {
    // prettier-ignore
    const time = args[1]
      .toLowerCase()
      .replace('uhr', '')
      .trim()
      .split(':');
    const date = args[0].split('.');

    // createDate(year, month, day, hour, minute);
    const eventDate = createDate(
      date[3], // year
      date[2] - 1, // month
      date[1], // day
      time[0], // hour
      time[1] // minute
    );
    return eventDate;
  } catch (err) {
    console.error(err);
    return new Date(0);
  }
}

async function buildEventObjs(cleanData) {
  return cleanData.map((event) => {
    return new Event(
      META.eventType,
      META.place,
      event.name,
      META.link,
      event.date
    );
  });
}

async function init() {
  let html;

  // prettier-ignore
  testData ?
    (html = await readFile(TEST_DATA)) :
    (html = await getHtml(LIVE_DATA));

  const rawData = await parseEventData(html);
  const cleanData = await cleanRawData(rawData);
  const events = await buildEventObjs(cleanData);
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
