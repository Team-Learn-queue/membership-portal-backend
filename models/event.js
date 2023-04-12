const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema({

  name: {
    type: String,
    required: true,
    lowercase: true,

  },
  members: [{
    type: String,
    required: true,

  }],
  venue: {
    type: String,
    required: true,
    lowercase: true,

  },
  start_date: {
    type: Date,
    required: true,

  },
  end_date: {
    type: Date,
    required: true,

  },
  set_reminder: {
    type: Date
  }

});
 
module.exports = mongoose.model('event', eventSchema);