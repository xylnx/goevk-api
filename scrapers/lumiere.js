const fetch = require('node-fetch');

const { readFile, getHtml } = require('./getHtml');
const Event = require('./Event');

// Get json data from here
const url =
  'https://www.kinoheld.de/ajax/getShowsForCinemas?cinemaIds[]=728&lang=en';

// TESTDATA
const testData = './test_data/testData-melies.json';

// Metadata to enrich the event objects
const CONSTANTS = {
  place: 'Lumiere',
  eventType: 'Kino',
  linkRoot:
    'https://www.kinoheld.de/cinema-goettingen/kino-lumiere-goettingen/show',
};

// Get JSON data
async function getData(url) {
  const events = [];
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

// Put together an array with event objects
// containing all relevant event info
function parseEvents(data) {
  let events = [];

  // Loop over json data
  // extract information you want
  // create a date object
  // put everything into an event object
  // add in the venue name
  // build the link to the event
  data.shows.forEach((show) => {
    // const event = {};
    const date = show.date;
    const time = show.time;
    const dateObj = createDateObj(date, time);

    const event = new Event(
      CONSTANTS.eventType,
      CONSTANTS.place,
      show.name,
      CONSTANTS.linkRoot + show.id,
      dateObj
    );

    /*
    event.type = CONSTANTS.eventType;
    event.place = CONSTANTS.place;
    event.name = show.name;
    event.link = CONSTANTS.linkRoot + show.id;
    event.date = JSON.stringify(dateObj);
    event.timestamp = JSON.stringify(dateObj.getTime());
    */

    events.push(event);

    // console.log(event)
  });
  console.log(events);
  return events;
}

function createDateObj(date, time) {
  const dateStr = `${date}T${time}`;
  const dateObj = new Date(dateStr);
  return dateObj;
}

//{
//  type: 'Konzert, Party, Kultur',
//  place: 'Musa',
//  title: 'Twice a Couple - Open Air',
//  link: 'https://www.musa.de/konzerte-partys/twice-couple-open-air/',
//  date: 2021-06-26T17:00:00.000Z,
//  timestamp: 1624726800000
//}

async function init() {
  // TESTING
  // let data = await readFile(testData);
  // data = JSON.parse(data);

  const data = await getData(url);
  const events = await parseEvents(data);
  return events;
}

init();
module.exports.parseEvents = init;
