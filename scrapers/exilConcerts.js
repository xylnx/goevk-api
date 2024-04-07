const cheerio = require('cheerio'); // used to parse HTML
const { readFile, getHtml } = require('./getHtml');
const { createDate: createISODate } = require('./utils/createDate');
const { monthsLong } = require('./utils/months');
const Event = require('./Event.js');
const { signalExecution, signalTestData } = require('./utils/signals');

const isTestData = process.env.TEST_DATA === 'true';
const isDebug = process.env.DEBUG === 'true';

const CONSTANTS = {
  eventType: 'Konzert',
  place: 'Exil',
  currentYear: new Date().getFullYear(),
  url: 'https://exil-web.de/events/kategorie/konzerte/liste',
  testDataPath: `${__dirname}/test_data/exil-concerts.html`,
};

async function parseEvents(html) {
  const $ = cheerio.load(html);
  const raw_events = $('.tribe-events-calendar-list__event-row')
    .get()
    .map((event) => ({
      name: $(event)
        .find('.tribe-events-calendar-list__event-title-link')
        .text(),
      date: $(event).find('.tribe-event-date-start').text(),
      link: $(event)
        .find('.tribe-events-calendar-list__event-title-link')
        .attr('href'),
    }));

  return raw_events;
}

function getISODate(rawDate) {
  // raw: 30. Mai - 19:00'
  
  // [ '24.', 'Mai', '-', '19:00' ]
  const dateArr = rawDate.split(' ');
  const timeArr = dateArr[3].split(':');

  const day = parseInt(dateArr[0].replace('.', ''));
  const month = parseInt(monthsLong.indexOf(dateArr[1].toLowerCase()));
  const year = CONSTANTS.currentYear;
  const hour = parseInt(timeArr[0]);
  const minute = parseInt(timeArr[1]);

  return createISODate(year, month, day, hour, minute);
}

async function clean(data) {
  return data.map((dp) => ({
    ...dp,
    name: dp?.name?.trim() ?? 'n/a',
    date: getISODate(dp.date),
  }));
}

async function createEventObjs(cleanData) {
  return cleanData.map(
    (dp) =>
      new Event(
        CONSTANTS.eventType,
        CONSTANTS.place,
        dp.name,
        dp.link,
        dp.date,
      ),
  );
}

async function init() {
  const html = isTestData
    ? await readFile(CONSTANTS.testDataPath)
    : await getHtml(CONSTANTS.url);

  const raw_data = await parseEvents(html);
  const clean_data = await clean(raw_data);

  return await createEventObjs(clean_data);
}

// DEBUGGING
if (isDebug) {
  const path = require('path');
  const scriptName = path.basename(__filename);

  init().then((events) => {
    signalExecution(scriptName);
    if (isTestData) signalTestData();
    console.log({ events });
    if (isTestData) signalTestData();
  });
}
