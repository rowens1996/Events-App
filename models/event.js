const mongoose = require('mongoose');

const eventSchema = mongoose.Schema({
  name: String,
  location: String,
  date: String,
  price: Number,
  info: String,
})

module.exports.Event = mongoose.model('Event', eventSchema, 'Event')