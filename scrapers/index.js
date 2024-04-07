const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const { COLOR } = require('./utils/COLORS');

const { parseEventsMusa } = require('./musa');
const { getEventsMelies } = require('./melies');
const { parseEventsDT } = require('./dt');

const dbPath = '../api/events.db';

function deleteDB(dbFile) {
  console.log('trying to delete DB');
  return new Promise((resolve, reject) => {
    try {
      resolve(fs.unlinkSync(dbFile));
    } catch (err) {
      console.error(err);
      reject();
    }
    console.log(COLOR('db file deleted', { fg: 'fgRed' }));
  });
}

// Return a database object
function openDB(dbPath) {
  let db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      return console.error(err.message);
    }
  });
  console.log('Connected to the SQlite database.');
  return db;
}

function readData(db) {
  const sql = 'select * from events';
  let data = [];

  return new Promise((resolve, reject) => {
    db.all(sql, [], (err, rows) => {
      if (err) {
        throw err;
      }
      rows.forEach((row) => {
        data.push(row);
      });
      resolve(data);
    });
  });
}

function closeDB(db) {
  db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Close the database connection.');
  });
}

function createTable(db, tableName) {
  tableName = tableName || 'events';
  const sql = `
    CREATE TABLE IF NOT EXISTS ${tableName} (
      type TEXT,
      place TEXT,
      name TEXT,
      link TEXT,
      dateObj TEXT,
      tstamp TEXT
    )`;

  return new Promise((resolve, reject) => {
    resolve(
      db.run(sql, (error) =>
        error
          ? console.log(error)
          : console.log(
              'TABLE',
              COLOR(`${tableName}`, { fg: 'fgGreen' }),
              'created',
            ),
      ),
    );
  });
}

// takes a db and an event object
function writeToDB(db, data) {
  const sql = `
    INSERT INTO events
    VALUES ('${data.type}','${data.place}', '${data.name}', '${data.link}', '${data.date}', '${data.timestamp}');
  `;
  db.run(sql, (error) =>
    error
      ? console.log(error)
      : console.log(COLOR('data written to db', { fg: 'fgYellow' })),
  );
}

async function parseEvents() {
  // Create a fresh db
  await deleteDB(dbPath);
  const db = openDB(dbPath);
  await createTable(db);

  // Get Events
  const eventsMusa = await parseEventsMusa();
  const eventsMelies = await getEventsMelies();
  const eventsDT = await parseEventsDT();

  // Store events
  eventsMusa.forEach((event) => writeToDB(db, event));
  eventsMelies.forEach((event) => writeToDB(db, event));
  eventsDT.forEach((event) => writeToDB(db, event));
  closeDB(db);
}

async function displayEvents() {
  const db = openDB(dbPath);
  const events = await readData(db);
  console.log('coming from displayEvents:', JSON.stringify(events));
}

function init() {
  // parseEvents();
  // displayEvents();
}
init();
