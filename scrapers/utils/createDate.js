const createDate = (year, month, day, hour, minute) => {
  return new Date(year, month, day, hour, minute);
};

module.exports = {
  createDate,
};
