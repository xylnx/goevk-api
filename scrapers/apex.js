const { COLOR } = require('./utils/COLORS');
const cheerio = require('cheerio');
const { readFile, getHtml } = require('./getHtml');
const Event = require('./Event');

// Get HTML from here
const URL = 'https://www.apex-goe.de/programm';
const TEST_DATA = '../test_data/apex.html';

const CONSTANTS = {
  place: 'Apex',
  eventType: '???',
};

const createDateObj = () => {
  console.log(999);
};

const getEvents = (html) => {
  const events = [];
  const $ = cheerio.load(html);

  // General info for all events
  const year = null;
  const month = null;

  const eventNodes = null;
  eventNodes.each((index, el) => {
    const name = null;
    const link = null;
    const eventDate = null;

    const event = new Event(
      CONSTANTS.eventType,
      CONSTANTS.place,
      name,
      link,
      eventDate
    );
    events.push(event);
    console.log(event);
  });
  return events;
};

async function parseEventsApex() {}
