const path = require('path');
const cheerio = require('cheerio');

const { signalExecution, signalTestData } = require('./utils/signals');
const { readFile, getHtml } = require('./getHtml');
const Event = require('./Event');
const { createDate } = require('./utils/createDate');
// Import array with names of months in German
const months = require('./utils/months');

const scriptName = path.basename(__filename);
const debug = process.env.DEBUG === 'true';
const testData = process.env.TEST_DATA === 'true';

// get HTML from here
const url = 'https://noergelbuff.de/programm/';
// test data
const file = `${__dirname}/test_data/noergelbuff.html`;

// Meta data to enrich the event object
const CONSTANTS = {
  place: 'Nörgelbuff',
  eventType: 'Konzert, Party',
};

function getEvents(html) {
  return new Promise((resolve, reject) => {
    const $ = cheerio.load(html);

    const events = [];
    const eventNodes = $('[id^="event_article_"]');
    eventNodes.each((index, el) => {
      // console.log($.html(el));

      const eventHtml = cheerio.load($.html(el));
      // const htmlEl = $.html(el);

      const name = eventHtml('h2.entry-title').text();
      const date = eventHtml('.ecs-eventDate').text();
      const time = eventHtml('.ecs-eventTime').text();
      const link = eventHtml('h2.entry-title > a').attr('href');

      // put together a date obj
      const dateObj = createDateObj(date, time);

      const event = new Event(
        CONSTANTS.eventType,
        CONSTANTS.place,
        name,
        link,
        dateObj
      );

      if (testData) signalTestData();
      if (debug) console.log('PARSED INFOS ==>', { name, date, time, link });

      // Log new event
      console.log(event);
      console.log('_______________________________________________________');

      events.push(event);
      console.log(events);
    });
    resolve(events);
  });
}

function createDateObj(date, time) {
  const dateStr = date;
  const dateArr = dateStr.split(' '); // Ex: [ '24.', 'Januar', '2022' ]
  const year = parseInt(dateArr[2]);
  const month = parseInt(months.indexOf(dateArr[1].toLowerCase()));
  const day = parseInt(dateArr[0].replace('.', ''));

  const timeStr = time; // Ex: ' @ 20:00 - 23:00'
  const timeStrClean = timeStr.split(' ')[2];
  const timeArr = timeStrClean.split(':');
  const hour = parseInt(timeArr[0]);
  const minute = parseInt(timeArr[1]);

  const eventDate = createDate(year, month, day, hour, minute);

  if (debug)
    console.log('createDateObj() ==>', {
      dateStr,
      dateArr,
      year,
      month,
      day,
      timeStr,
      timeArr,
      hour,
      minute,
    });

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
