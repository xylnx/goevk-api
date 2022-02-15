const { redisSet, redisGet } = require('../useRedis');

const sortEvents = async (eventsArr) => {
  // turn date string into date
  eventsArr.forEach((ev) => (ev.date = new Date(ev.date)));

  // sort events compoaring their dates
  const eventsSorted = eventsArr.sort((a, b) => a.date - b.date);
};
// sortEvents();

module.exports.sortEvents = sortEvents;
