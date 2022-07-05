function dateIsValid(date) {
  return !isNaN(date);
}

const createDate = (year, month, day, hour, minute) => {
  let date;
  date = new Date(year, month, day, hour, minute);
  if (!dateIsValid(date)) return new Date(0);
  return date;
};

module.exports = {
  createDate,
};
