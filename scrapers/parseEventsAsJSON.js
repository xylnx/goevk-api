/* ======================================================== >>
  This module parses Event-objects into a single JSON-File
  Event objects are created in individual scrapers
  Each scraper returns an array of such events
<< ======================================================== */

const fs = require('fs');

const dt = require('./dt');
const lumiere = require('./lumiere');
const melies = require('./melies');
const musa = require('./musa');

// Put JSON here:
const path = '../data/';
const fileName = 'bvents.json';

const init = async () => {
  const scrapers = [dt, lumiere, melies, musa];
  // const scrapers = [musa];
  let eventsAll = [];

  for (const scraper of scrapers) {
    const events = await scraper.parseEvents();
    eventsAll.push(...events);
  }
  const json = JSON.stringify(eventsAll);
  fs.writeFileSync(`${path}${fileName}`, json);
};
init();
