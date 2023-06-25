const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true 
    },
    items: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item'
    }],
    votedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
  });
  
  
  module.exports = mongoose.model('Poll', pollSchema);