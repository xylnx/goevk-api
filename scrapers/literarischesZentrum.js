const path = require('path');
const cheerio = require('cheerio');

const { signalExecution, signalTestData } = require('./utils/signals');
const { readFile, getHtml } = require('./getHtml');
const Event = require('./Event');
// Import array with names of months in German
const months = require('./utils/months');

const scriptName = path.basename(__filename);
const debug = process.env.DEBUG === 'true';
const testData = process.env.TEST_DATA === 'true';

// get HTML from here
const url = 'https://www.literarisches-zentrum-goettingen.de/programm';
// test data
const file = `${__dirname}/test_data/litZentrum.html`;

// Meta data to enrich the event object
const CONSTANTS = {
  place: 'Literarisches Zentrum',
  eventType: 'Lesung, Workshop, Literatur',
};

function cleanName(string) {
  // Strip string from tabs + new lines
  return string.replaceAll('\t', '').replaceAll('\n', '');
}

function getEvents(html) {
  return new Promise((resolve, reject) => {
    const $ = cheerio.load(html);

    const events = [];
    const eventNodes = $('.event');
    eventNodes.each((index, el) => {
      // console.log($.html(el));

      const eventHtml = cheerio.load($.html(el));
      // const htmlEl = $.html(el);

      let guest = eventHtml('h3 > a > .guests ').text().trim();
      let title = eventHtml('h3 > a > .title ').text().trim();
      // let subtitle = eventHtml('h3 > a > .subtitle ').text().trim();

      guest = cleanName(guest);
      console.log({ guest, title });

      let dates = eventHtml('.event > .meta > .datetime > a > span');
      dates = dates.text().replaceAll('\t', '').split('\n');
      dates = dates.filter(function (str) {
        return /\S/.test(str);
      });
      console.log({ dates });

      const linkRoot = 'https://www.literarisches-zentrum-goettingen.de';
      const link = linkRoot + eventHtml('h3 > a').attr('href');
      console.log({ link });

      /*
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
    */
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

  const eventDate = new Date(year, month, day, hour, minute);

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
