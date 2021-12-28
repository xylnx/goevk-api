const { createClient } = require('redis');

const debug = process.env.DEBUG === 'true';

const redisConnect = async () => {
  const client = createClient();
  client.on('error', (err) => console.log('Redis Client Error', err));
  await client.connect();
  return client;
};

const redisSet = async (key, value) => {
  const client = await redisConnect();

  await client.set(key, value);
  await client.disconnect();

  return console.log('data stored in redis');
};

const redisGet = async (key) => {
  const client = await redisConnect();

  const value = await client.get(key);
  return value;
};

const init = async () => {
  const json = JSON.stringify({ greeting: 'bonjour le monde' });
  await redisSet('eventsData', json);
  await redisGet('eventsData');
};

if (debug) init();

module.exports = {
  redisSet,
  redisGet,
};
