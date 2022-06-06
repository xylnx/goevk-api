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
const url = 'https://www.junges-theater.de/spielplan/';
// test data
const file = `${__dirname}/test_data/jt.html`;

// Meta data to enrich the event object
const CONSTANTS = {
  place: 'Junges Theater',
  eventType: `${eT.theater}, ${eT.musical}, ${eT.generalEvents}`,
};

function getEvents(html) {
  return new Promise((resolve, reject) => {
    const $ = cheerio.load(html);

    // store extracted events here
    const events = [];

    // GET HTML FOR ALL EVENTS
    // JT Events are organized in tabs
    // Each contains a certain month and then there is a tab for all events togehter
    // => There is html for each event exists twice on this page
    // => we only grab the last tab, which is the one for all events, to not parse the same event twice (from month + from all events tab)!
    const lastTab = $('.et_pb_all_tabs').children('div').last();

    // Load html from last tab into cheerio
    const allEvents = cheerio.load($.html(lastTab));

    // Extract all event nodes
    const eventNodes = allEvents('.et_pb_section.et_section_regular');

    // Extract html of individual events
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
  const timeArr = timeStr.split(':');
  const hour = parseInt(timeArr[0]);
  const minute = parseInt(timeArr[1]);

  const eventDate = createDate(year, month, day, hour, minute);
  return eventDate;
}

async function parseEvents() {
  signalExecution(scriptName); // print out info that this script is runnig
  let html;
  // prettier-ignore
  testData ? 
    (html = await readFile(file)) : 
    (html = await getHtml(url));

  const events = await getEvents(html);
  return events;
}

// Parse events without calling parseEvents externally, for testing
if (debug) parseEvents();

module.exports.parseEvents = parseEvents;
