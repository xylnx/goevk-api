const { COLOR } = require('./utils/COLORS');
const cheerio = require('cheerio');
const { readFile, getHtml } = require('./getHtml');
const Event = require('./Event');

// Get HTML from here
const URL = 'https://www.dt-goettingen.de/kalender';
const TEST_DATA = '../test_data/dt.html';

// Meta data to enrich the event obj
const CONSTANTS = {
  place: 'Deutsches Theater',
  eventType: 'Theater, Kultur, Veranstaltungen',
};

/* HELPER to put together date objects
 * from parsed strings */
const createDateObj = (eventYear, eventMonth, eventDay, eventTime) => {
  console.log(eventYear, eventMonth, eventDay, eventTime);

  const months = [
    'Januar',
    'Februar',
    'März',
    'April',
    'Mai',
    'Juni',
    'Juli',
    'August',
    'September',
    'Oktoer',
    'November',
    'Dezember',
  ];

  const year = parseInt(eventYear);
  const month = months.indexOf(eventMonth);
  const day = parseInt(eventDay);

  /* Isolate the start time
   * eventTime comes in an inconsistent format:
   * "19.00 Uhr" and "19.00 Uhr - 23.00 Uhr"
   * this is why we split at spaces and "."
   * And: since we only want the start time,
   * we only care about the first two indices of the resulting array */
  const eventTimeArr = eventTime.split(/[\s.]+/);
  const hour = eventTimeArr[0];
  const minutes = eventTimeArr[1];

  const eventObj = new Date(year, month, day, hour, minutes);

  return eventObj;
};

const getEvents = (html) => {
  const events = [];
  const $ = cheerio.load(html);

  // Retrieve current month and year in a select on the page
  const month_and_year = $(
    '.cal_month_select.cf select option[selected="selected"]'
  ).text();
  const year = month_and_year.split(' ')[1];
  const month = month_and_year.split(' ')[0];
  // store previously retrieved day
  // ==> if there is more than one event a day, no new day value can be retrieved, this one will be used instead
  let previousDay = null;

  // Get all events in a node list
  const eventNodes = $('.outer > tbody > tr');
  eventNodes.each((index, el) => {
    // const event = {};

    // Isolated HTML of a single event into cheerio
    const eventHTML = cheerio.load($.html(el));

    // Get day and time the event takes place
    const day =
      eventHTML('.date_num').text() != ''
        ? eventHTML('.date_num').text()
        : previousDay;
    console.log(day);
    previousDay = day;
    const time = eventHTML('.time').text(); // sth like 19:00 or 19:00 - 22:00

    // Put together a date object (month + year can be found above)
    const eventDate = createDateObj(year, month, day, time);

    // Get event name + link to a detailed description
    const name = eventHTML('.title').text();
    const link = eventHTML('.tcontent > a').attr('href');

    const event = new Event(
      CONSTANTS.eventType,
      CONSTANTS.place,
      name,
      link,
      eventDate
    );
    console.log(event);

    /*
    // Add properties to the event obj
    event.type = CONSTANTS.eventType;
    event.place = CONSTANTS.place;
    event.name = name;
    event.link = link;
    event.date = JSON.stringify(eventDate);
    event.timestamp = JSON.stringify(eventDate.getTime());
    */

    // Push the new event to an array of all DT events
    events.push(event);
  });

  return events;
};

async function parseEventsDT() {
  // const html = await readFile(TEST_DATA)
  const html = await getHtml(URL);

  const events = await getEvents(html);
  // console.log('from module: ', events);
  return events;
}

parseEventsDT();
// module.exports.parseEventsDT = parseEventsDT;
module.exports.parseEvents = parseEventsDT;
