const { createClient } = require('redis');

const client = createClient();
const redisSet = async (key, value, client) => {
  client.on('error', (err) => console.log('Redis Client Error', err));
  await client.connect();

  await client.set(key, value);
  return console.log('data stored in redis');
};

const redisGet = async (key, client) => {
  client.on('error', (err) => console.log('Redis Client Error', err));
  // await client.connect();

  const value = await client.get(key);
  console.log(value);
  return value;
};

const init = async () => {
  await redisSet('bonjour', 'le monde', client);
  await redisGet('bonjour', client);
};
init();

module.export = {
  redisSet,
  redisGet,
};
