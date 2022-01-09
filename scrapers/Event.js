class Event {
  constructor(type, place, name, link, date) {
    this.type = type;
    this.place = place;
    this.name = name;
    this.link = link;
    this.date = date.toISOString();
    // this.timestamp = date.getTime();
  }
}

module.exports = Event;
