const path = require('path');
const cheerio = require('cheerio');

const { signalExecution, signalTestData } = require('./utils/signals');
const { readFile, getHtml } = require('./getHtml');
const Event = require('./Event');
const { eventTypes: eT } = require('../utils/eventTypes');
const { createDate } = require('./utils/createDate');

const scriptName = path.basename(__filename);

// DEBUGGING + DEVELOPMENT
// when set to true, this module runs as a stand alone application and
// logs parsed events to the console
const debug = process.env.DEBUG === 'true';
// read test data from a file
// => prevent unnecessary requests when developing or debugging
const testData = process.env.TEST_DATA === 'true';
// test data
const file = `${__dirname}/test_data/exil-konzerte.html`;

// get HTML from here
const url = 'https://www.exil-web.de/index.php/ct-menu-item-5';

// Meta data to enrich the event object
const CONSTANTS = {
  place: 'Exil',
  eventType: `${eT.concert}, ${eT.club}`,
};

function getEvents(html) {
  return new Promise((resolve, reject) => {
    const $ = cheerio.load(html);

    const events = [];
    const eventNodes = $('.eb-event-container');

    eventNodes.each((index, el) => {
      const eventHtml = cheerio.load($.html(el));
      // const htmlEl = $.html(el);

      // Parse info from eventHtml
      const name = eventHtml('.eb-even-title-container').text().trim();

      const dateInfo = eventHtml('.eb-event-date-info').text().trim();
      // prettier-ignore
      const dateInfoClean = dateInfo
        .split(' ') // Turn string into an array
        .filter(function (str) { // filter out elements containing more than whitespace
          return /\S/.test(str);
        });
      const date = dateInfoClean[1];
      const time = dateInfoClean[2].replace('\n', '');
      // Put together a date obj
      const dateObj = createDateObj(date, time);

      // Build the event link
      const linkRoot = 'https://www.exil-web.de';
      let link = eventHtml('.eb-even-title-container > a').attr('href');
      link = linkRoot + link;

      // Create event object
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
        console.log('VARS ==> ', { name, date, time, link });
      }

      // Log event obj
      console.log({ index });
      console.log({ event });
      console.log('__________________________________________');

      events.push(event);
    });
    resolve(events);
  });
}

function createDateObj(date, time) {
  const dateStr = date;
  const dateArr = dateStr.split('.');

  const year = parseInt(dateArr[2]) ?? new Date().getFullYear();
  const month = parseInt(dateArr[1] - 1);
  const day = parseInt(dateArr[0]);

  const timeStr = time;
  const timeStrClean = timeStr.replace('Beginn:', '').trim();
  const timeArr = timeStrClean.split(':');
  const hour = parseInt(timeArr[0]);
  const minute = parseInt(timeArr[1]);

  // DEBUGGING
  if (debug) {
    console.log('createDateObj:', { month, day, hour, minute });
  }

  // Create + return new date
  const eventDate = createDate(year, month, day, hour, minute);
  return eventDate;
}

async function parseEvents() {
  signalExecution(scriptName);
  let html;

  // prettier-ignore
  // use test date, if `testData == true`, else scrape real html
  testData ? 
    (html = await readFile(file)) : 
    (html = await getHtml(url));

  const events = await getEvents(html);
  return events;
}

// Parse events without calling the function from parseEventsAsJSON()
if (debug) parseEvents();

module.exports.parseEvents = parseEvents;
