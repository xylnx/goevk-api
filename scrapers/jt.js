const path = require('path');
const cheerio = require('cheerio');

const { signalExecution, signalTestData } = require('./utils/signals');
const { readFile, getHtml } = require('./getHtml');
const Event = require('./Event');

const scriptName = path.basename(__filename);
const debug = process.env.DEBUG === 'true';
const testData = process.env.TEST_DATA === 'true';

// get HTML from here
const url = 'https://www.junges-theater.de/spielplan/';
// test data
const file = `${__dirname}/test_data/jt.html`;

// Meta data to enrich the event object
const CONSTANTS = {
  place: 'Junges Theater',
  eventType: 'Theater, Musicals, Veranstaltungen',
};

function getEvents(html) {
  return new Promise((resolve, reject) => {
    const $ = cheerio.load(html);

    // store extracted events here
    const events = [];

    // get html for all events
    // const eventNodes = $('.et_pb_section.et_pb_section_1.et_section_regular');
    const allTabs = $('.et_pb_all_tabs').children('div').last();

    const everything = cheerio.load($.html(allTabs));
    const eventNodes = everything('.et_pb_section.et_section_regular');

    // const eventNodes = $('.et_pb_section.et_section_regular');

    // extract html of individual events
    eventNodes.each((index, el) => {
      const eventHtml = cheerio.load($.html(el));

      const name = eventHtml('.et_builder_inner_content > a').text();

      console.log(index, ':', name);

      // Parse infos from eventHtml
      const date = eventHtml('.et_pb_text_inner > h3').text();
      const time = eventHtml('.et_pb_text_inner > h3 > span.rechts').html();
      let link = eventHtml('.et_builder_inner_content > a').attr('href');

      // put together a date obj
      const dateObj = createDateObj(date, time);

      // build the event link
      // const linkRoot = 'https://www.jt.de';
      // link = linkRoot + link;

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
  //const timeStrClean = timeStr.replace('Beginn:', '').trim();
  const timeArr = timeStr.split(':');
  const hour = parseInt(timeArr[0]);
  const minute = parseInt(timeArr[1]);

  const eventDate = new Date(year, month, day, hour, minute);

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
