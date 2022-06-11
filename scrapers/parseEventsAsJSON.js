/* ======================================================== >>
  This module parses Event-objects into a single JSON-File
  Event objects are created in individual scrapers
  Each scraper returns an array of such events
<< ======================================================== */

// Set timezone
// This is important to instantiate dates using the right time zone in each individual scraper
process.env.TZ = 'Europe/Berlin';

const fs = require('fs');
const { redisSet, redisAppend } = require('../useRedis');
const { sortEvents } = require('../utils/sortEvents');
const writeToLocalFile = process.env.WRITE_TO_LOCAL_FILE === 'true';

// SCRAPERS
// const cinemaxx = require('./cinemaxx');
// const lokhalle = require('./lokhalle');
const apex = require('./apex');
const dots = require('./dots');
const dt = require('./dt');
const esel = require('./esel');
const exilConcerts = require('./exilConcerts');
const gso = require('./gso');
const jt = require('./jt');
const lumiere = require('./lumiere');
const melies = require('./melies');
const musa = require('./musa');
const noergelbuff = require('./noergelbuff');

// Put JSON here:
const redisKey = 'eventsData';
const path = `${__dirname}/../data/`;
const fileName = 'events.json';

const init = async () => {
  const scrapers = [
    /*
    cinemaxx, => to much clutter
    */
    apex,
    dots,
    dt,
    esel,
    exilConcerts,
    gso,
    jt,
    // lokhalle, => not working
    lumiere,
    melies,
    musa,
    noergelbuff,
  ];

  // Store events
  let eventsAll = [];
  for (const scraper of scrapers) {
    try {
      console.log(scraper);
      const events = await scraper.parseEvents();
      eventsAll.push(...events);
    } catch (error) {
      console.log(`ERROR while runing ${scraper}.parseEvents(): `, error);
    }
  }

  // Sort all events according to their starting date + time
  sortEvents(eventsAll);
  const json = JSON.stringify(eventsAll);

  // Write json into a local file, and not into redis
  // The local file can be served for easy local development of the frontend app
  if (writeToLocalFile) return fs.writeFileSync(`${path}${fileName}`, json);

  // Production: Dump json into redis
  redisSet('eventsData', json);

  return;
};
init();
