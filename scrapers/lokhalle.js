const path = require('path');
const cheerio = require('cheerio');

const { signalExecution, signalTestData } = require('./utils/signals');
const { readFile, getHtml } = require('./getHtml');
const Event = require('./Event');

const scriptName = path.basename(__filename);
const debug = process.env.DEBUG === 'true';
const testData = process.env.TEST_DATA === 'true';

// get HTML from here
const url = 'https://www.lokhalle.de/programm';
// test data
const file = `${__dirname}/test_data/lokhalle.html`;

// Meta data to enrich the event object
const CONSTANTS = {
  place: 'Lokhalle',
  eventType: 'Konzert, Messe, Veranstaltung',
};

function getEvents(html) {
  return new Promise((resolve, reject) => {
    const $ = cheerio.load(html);

    const events = [];
    const eventNodes = $('.jet-listing-grid__item');
    eventNodes.each((index, el) => {
      // Get all nodes containing event data
      const eventHtml = cheerio.load($.html(el));
      const eventTest = eventNodes.html();

      // Parse info from eventHtml
      const name = eventHtml('h2.elementor-heading-title').text();
      let dateInfo = eventHtml('.jet-listing-dynamic-field__content').text();

      // dateInfo: [ 'Sa.,', '26.03.2022', '19:45', 'UhrHalle', '3' ]
      dateInfo = dateInfo.split(' ');
      const date = dateInfo[1];
      const time = dateInfo[2];

      // put together a date obj
      const dateObj = createDateObj(date, time);

      // Get link to the event
      const link = eventHtml('.jet-button__instance').attr('href');

      const event = new Event(
        CONSTANTS.eventType,
        CONSTANTS.place,
        name,
        link,
        dateObj
      );

      // DEBUGGING
      if (debug) {
        if (testData) signalTestData();

        // console.log({ eventHtml: JSON.stringify(eventHtml.html(), null, 8) });
        console.log({ index });
        console.log('VARIABLES', { name, dateInfo, date, time, link });
      }

      // Log current event object
      console.log(event);

      events.push(event);
    });
    resolve(events);
  });
}

function createDateObj(date, time) {
  const year = new Date().getFullYear();

  const dateStr = date;
  const dateArr = dateStr.split('.');
  const month = parseInt(dateArr[1] - 1); // -1: months start with 0 (January)
  const day = parseInt(dateArr[0]);

  const timeStr = time;
  const timeStrClean = timeStr.replace('Beginn:', '').trim();
  const timeArr = timeStrClean.split(':');
  const hour = parseInt(timeArr[0]);
  const minute = parseInt(timeArr[1]);

  const eventDate = new Date(year, month, day, hour, minute);

  // DEBUGGING
  if (debug) {
    console.log('createDateObj:', { month, day, hour, minute });
    console.log('__________________________________________');
  }

  return eventDate;
}

async function parseEvents() {
  signalExecution(scriptName);
  let html;
  // prettier-ignore
  testData ? 
    (html = await readFile(file)) : 
    (html = await getHtml(url));

  const events = await getEvents(html);
  return events;
}

// Parse events without calling the function from an external script
if (debug) parseEvents();

module.exports.parseEvents = parseEvents;
