const path = require('path');
const cheerio = require('cheerio');

const { signalExecution, signalTestData } = require('./utils/signals');
const { readFile, getHtml } = require('./getHtml');
const Event = require('./Event');

const scriptName = path.basename(__filename);
const debug = process.env.DEBUG === 'true';
const testData = process.env.TEST_DATA === 'true';

// get HTML from here
const url = 'https://cafebardots.de/events/';
// test data
const file = `${__dirname}/test_data/dots.html`;

// Meta data to enrich the event object
const CONSTANTS = {
  place: 'Cafe Bar Dots',
  eventType: 'Konzert, Party, Kultur',
  link: 'https://cafebardots.de/events/',
};

// Print script name to the console when executing it
signalExecution(scriptName);

function createDateObj(date, time) {
  const dateStr = date.trim();
  const dateArr = dateStr.split('.');
  const year = +parseInt('20' + dateArr[2]);
  const month = parseInt(dateArr[1] - 1);
  const day = parseInt(dateArr[0]);

  const timeStr = time.trim();
  const timeArr = timeStr.split(':');
  const hour = parseInt(timeArr[0]);
  const minute = parseInt(timeArr[1]);

  const eventDate = new Date(year, month, day, hour, minute);
  // console.log({ year }, { month }, { day }, { hour }, { minute });

  return eventDate;
}

function getEvents(html) {
  return new Promise((resolve, reject) => {
    const $ = cheerio.load(html);

    const events = [];
    const eventNodes = $('tr');
    eventNodes.each((index, eventNode) => {
      const name = $(eventNode).find('td:nth-child(1)').text();
      const date = $(eventNode).find('td:nth-child(3)').text();
      const time = $(eventNode).find('td:nth-child(4)').text();

      const dateObj = createDateObj(date, time);

      const link = CONSTANTS.link;

      const event = new Event(
        CONSTANTS.eventType,
        CONSTANTS.place,
        name,
        link,
        dateObj
      );

      // DEBUGGING
      if (testData) signalTestData();
      if (debug) console.log(event);

      events.push(event);
    });
    resolve(events);
  });
}

async function filterEvents(eventsArr) {
  /* the dots website does not only feature current events,
   * it keeps all past events in the list
   * this function removes past events */

  /* curDate is used to filter out events
   * events in the past will not be returned */
  const today = new Date();

  /* turn date string into date
   * date comes as an ISO string,
   * to compare dates we need a real date object */
  eventsArr.forEach((event) => (event.date = new Date(event.date)));

  // only keep events which will happen today or in the future
  const currentEvents = eventsArr.filter((event) => event.date >= today);

  // turn date back into an ISO string
  currentEvents.forEach((event) => (event.date = event.date.toISOString()));

  // DEBUGGING
  if (debug) console.log({ currentEvents });

  return currentEvents;
}

async function parseEvents() {
  let html;
  // prettier-ignore
  testData ? 
    (html = await readFile(file)) : 
    (html = await getHtml(url));

  const events = await getEvents(html);
  const filteredEvents = await filterEvents(events);
  return filteredEvents;
}

if (debug) parseEvents();

module.exports.parseEvents = parseEvents;
