const path = require('path');
const cheerio = require('cheerio');

const { signalExecution, signalTestData } = require('./utils/signals');
const { readFile, getHtml } = require('./getHtml');
const Event = require('./Event');
const { eventTypes: eT } = require('../utils/eventTypes');
const { createDate } = require('./utils/createDate');

const scriptName = path.basename(__filename);
const debug = process.env.DEBUG === 'true';
const testData = process.env.TEST_DATA === 'true';

// get HTML from here
const url = 'https://www.musa.de/konzerte-partys/';
// test data
const file = `${__dirname}/test_data/musa-data.html`;

// Meta data to enrich the event object
const CONSTANTS = {
  place: 'Musa',
  eventType: `${eT.concert}, ${eT.party}`,
};

function getEvents(html) {
  return new Promise((resolve, reject) => {
    const $ = cheerio.load(html);

    const events = [];
    const eventNodes = $('.container.event.p-2').not('.canceled');
    eventNodes.each((index, el) => {
      /* const event = {} */

      const eventHtml = cheerio.load($.html(el));
      // const htmlEl = $.html(el);

      // Parse info from eventHtml
      const name = eventHtml('.musa-event-title > a').eq(0).text();
      const date = eventHtml('.h2.pt-2.mb-0').text().trim();
      const time = eventHtml('.event-time').html();

      // put together a date obj
      const dateObj = createDateObj(date, time);

      // build the event link
      const linkRoot = 'https://www.musa.de';
      let link = eventHtml('.musa-event-title > a').eq(0).attr('href');
      link = linkRoot + link;

      const event = new Event(
        CONSTANTS.eventType,
        CONSTANTS.place,
        name,
        link,
        dateObj
      );

      // Log new event
      if (testData) signalTestData();
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

  const month = parseInt(dateArr[1] - 1);
  const day = parseInt(dateArr[0]);

  const timeStr = time;
  const timeStrClean = timeStr.replace('Beginn:', '').trim();
  const timeArr = timeStrClean.split(':');

  const hour = parseInt(timeArr[0]);
  const minute = parseInt(timeArr[1]);

  // date data should come in strings, like so:
  // year='2022'; month="2"; day="26"; hour="17"; minute="30"
  const eventDate = createDate(year, month, day, hour, minute);

  return eventDate;
}

async function parseEventsMusa() {
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
if (debug) parseEventsMusa();

module.exports.parseEvents = parseEventsMusa;
