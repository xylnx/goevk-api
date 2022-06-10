const fetch = require('node-fetch');
const path = require('path');
const { readFile } = require('./getHtml');
const Event = require('./Event');
const { eventTypes: eT } = require('../utils/eventTypes');

// const url = 'https://www.gso-online.de/_api/wix-one-events-server/html/v2/widget-data?compId=comp-kfwdl2s1&locale=de&regional=de-de&viewMode=site&members=true&paidPlans=false&responsive=false&listLayout=1&showcase=false&tz=Europe%2FBerlin'

const CONSTANTS = {
  noLink: 'https://www.gso-online.de/konzerte',
};
const url = `${__dirname}/test_data/gso.json`;

const init = async () => {
  const data = await readFile(url);
  const parsedData = JSON.parse(data);
  const events = parsedData.component.events;
  events.map((event) => {
    console.log({
      title: event.title,
      date: event.scheduling.config.startDate,
      place: event.location.name,
      link: event.registration.external?.registration || CONSTANTS.noLink,
    });
  });
};
init();
