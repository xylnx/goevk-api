/* ======================================================== >>
  This module parses Event-objects into a single JSON-File
  Event objects are created in individual scrapers
  Each scraper returns an array of such events
<< ======================================================== */

const fs = require('fs');
const { redisSet, redisAppend } = require('../useRedis');
const { sortEvents } = require('../utils/sortEvents');

const dt = require('./dt');
const jt = require('./jt');
const lokhalle = require('./lokhalle');
const lumiere = require('./lumiere');
const melies = require('./melies');
const musa = require('./musa');

// Put JSON here:
const redisKey = 'eventsData';
const path = `${__dirname}/../data/`;
const fileName = 'bvents.json';

console.log(`${path}${fileName}`);

const init = async () => {
  const scrapers = [dt, jt, lokhalle, lumiere, melies, musa];
  // const scrapers = [lokhalle];
  let eventsAll = [];

  for (const scraper of scrapers) {
    const events = await scraper.parseEvents();
    eventsAll.push(...events);
  }

  sortEvents(eventsAll);
  const json = JSON.stringify(eventsAll);

  // Dump json into redis
  redisSet('eventsData', json);

  // Write
  // fs.writeFileSync(`${path}${fileName}`, json);
  return;
};
init();
