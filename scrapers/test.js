const year = 2021;
const dateStr = '25.06.'
const dateArr = dateStr.split('.');
const month = parseInt(dateArr[1] - 1);
const day = parseInt(dateArr[0]);


const timeStr = 'Beginn: 19:00'
const timeStrClean = timeStr.replace('Beginn:', '').trim();
const timeArr = timeStrClean.split(':');
const hour = parseInt(timeArr[0]);
const minute = parseInt(timeArr[1]);

const eventDate = new Date(year, month, day, hour, minute);

// DATE FROM A STRING
const dateFromStr = new Date("1995-12-17T03:24");
console.log(dateFromStr)

