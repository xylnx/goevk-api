const cheerio = require('cheerio');
const { readFile, getHtml } = require('./getHtml');
const Event = require('./Event');

// Meta data to enrich the event object
const CONSTANTS = {
  place: 'Musa',
  eventType: 'Konzert, Party, Kultur',
};

// get HTML from here
const url = 'https://www.musa.de/konzerte-partys/';

// test data
const file = './test_data/musa-data.html';

function getEvents(html) {
  return new Promise((resolve, reject) => {
    const $ = cheerio.load(html);

    const events = [];
    const eventNodes = $('.container.event.p-2').not('.canceled');
    eventNodes.each((index, el) => {
      /* const event = {} */

      const eventHtml = cheerio.load($.html(el));
      // const htmlEl = $.html(el);

      // Parse info from eventHtml
      const name = eventHtml('.musa-event-title > a').eq(0).text();
      const date = eventHtml('.h2.pt-2.mb-0').text().trim();
      const time = eventHtml('.event-time').html();

      // put together a date obj
      const dateObj = createDateObj(date, time);

      // build the event link
      const linkRoot = 'https://www.musa.de';
      let link = eventHtml('.musa-event-title > a').eq(0).attr('href');
      link = linkRoot + link;

      const event = new Event(
        CONSTANTS.eventType,
        CONSTANTS.place,
        name,
        link,
        dateObj
      );

      /*
      event.type = CONSTANTS.eventType;
      event.place = CONSTANTS.place;
      event.name = name;
      event.link = link;
      event.date = JSON.stringify(eventDate);
      event.timestamp = JSON.stringify(eventDate.getTime());
      */

      //event.html = htmlEl;

      // console.log(event);

      events.push(event);
    });
    resolve(events);
  });
}

function createDateObj(date, time) {
  const year = new Date().getFullYear();

  const dateStr = date;
  const dateArr = dateStr.split('.');
  const month = parseInt(dateArr[1] - 1);
  const day = parseInt(dateArr[0]);

  const timeStr = time;
  const timeStrClean = timeStr.replace('Beginn:', '').trim();
  const timeArr = timeStrClean.split(':');
  const hour = parseInt(timeArr[0]);
  const minute = parseInt(timeArr[1]);

  const eventDate = new Date(year, month, day, hour, minute);

  //const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
  //const eventDateLocalized = eventDate.toLocaleDateString('de-DE', options);
  //console.log('localized date obj: ', eventDateLocalized)
  // console.log('date obj: ', eventDate.getTime())

  return eventDate;
}

async function parseEventsMusa() {
  // const html = await readFile(file);
  const html = await getHtml(url);
  const events = await getEvents(html);
  // console.log('from module: ', events);
  return events;
}

// parseEventsMusa();

// old version
// module.exports.parseEventsMusa = parseEventsMusa;
module.exports.parseEvents = parseEventsMusa;
