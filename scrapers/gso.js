// Node core modules
const fetch = require('node-fetch');
const path = require('path');

// Custom modules
const { readFile } = require('./getHtml');
const Event = require('./Event');
const { eventTypes: eT } = require('../utils/eventTypes');

// Debugging modules and vars
const { signalExecution, signalTestData } = require('./utils/signals');
const scriptName = path.basename(__filename);
const debug = process.env.DEBUG === 'true';
const testData = process.env.TEST_DATA === 'true';

// Source data from here
const TEST_DATA = `${__dirname}/test_data/gso.json`;

const LIVE_DATA =
  'https://www.gso-online.de/_api/wix-one-events-server/html/v2/widget-data?compId=comp-kfwdl2s1&locale=de&regional=de-de&viewMode=site&members=true&paidPlans=false&responsive=false&listLayout=1&showcase=false&tz=Europe%2FBerlin';

// GSO's event data api won't answer if you don't sent the right cookie
const LIVE_DATA_COOKIE =
  'svSession=f5f138db4ba6e030cbecad4a6791e524ca67a0750eb491c94e830c8cb086a64e4bfd070f6609ab4e8964f4120e6263621e60994d53964e647acf431e4f798bcdead87e2149d7a36f1260b298ac8510f3a8dca1d75d0579fbcd78e64e48140786194e195cac45540976f72e572d8e5458a90bb7c40b6e2bedaeba0d39f38a9dee4a7b31f861d0caa29f10bbe92a7ae626';

// Additional meta data (used to enricht the event objects)
const CONSTANTS = {
  noLink: 'https://www.gso-online.de/konzerte',
  eventType: `${eT.concert}, ${eT.classicalMusic}`,
  eventPlacePrefix: 'GSO',
};

// Extract relevant data from JSON
const parseEventData = async (data) => {
  const events = data.component.events;
  const eventsExtractedData = events.map((event) => {
    return {
      name: event.title,
      date: event.scheduling.config.startDate,
      place: event.location.name,
      link: event.registration.external?.registration || CONSTANTS.noLink,
    };
  });
  return eventsExtractedData;
};

// Store event infos in an object
const createEventObjs = async (cleanEventData) => {
  const eventObjs = cleanEventData.map((event) => {
    return new Event(
      CONSTANTS.eventType,
      `${CONSTANTS.eventPlacePrefix} [${event.place}]`,
      event.name,
      event.link,
      new Date(event.date),
    );
  });

  return eventObjs;
};

// Reading data from this api is a bit more complicated:
// The API won't respond unless you give it a cookie
const readLiveData = async (url, { cookie } = {}) => {
  const opts = {
    headers: {
      cookie: cookie,
    },
  };
  const response = await fetch(url, opts);
  const json = await response.json();
  return json;
};

// Run
const init = async () => {
  // Get data
  let response;
  testData
    ? (response = await readFile(TEST_DATA, { json: true }))
    : (response = await readLiveData(LIVE_DATA, { cookie: LIVE_DATA_COOKIE }));

  // Extract relevant data on events
  const events_data_raw = await parseEventData(response);
  // Enricht data + organize it in event objects
  const events = await createEventObjs(events_data_raw);
  return events;
};

// DEBUGGING
if (debug) {
  init().then((events) => {
    signalExecution(scriptName);
    if (testData) signalTestData();
    console.log({ events });
    if (testData) signalTestData();
  });
}

module.exports.parseEvents = init;
