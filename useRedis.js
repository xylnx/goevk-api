const { createClient } = require('redis');

const debug = process.env.DEBUG === 'true';

const redisConnect = async () => {
  const client = createClient({
    url: process.env.REDIS_URL,
  });
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

const redisAppend = async (key, value) => {
  const client = await redisConnect();

  await client.append(key, value);
  await client.disconnect();

  return console.log(`==> Data appended to redis key ${key}`);
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

// if (debug) init();

module.exports = {
  redisSet,
  redisAppend,
  redisGet,
};
