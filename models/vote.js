const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  image: {
    type: String,
  },
  description: {
    type: String,
    required: true
  },
  votes: {
    type: Number,
    default: 0
  },
  votedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true 
  }
});

module.exports = mongoose.model('Vote', voteSchema);