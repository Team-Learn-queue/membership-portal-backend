const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  image: {
    type: String,
  },
  name: {
    type: String,
  },
  description: {
    type: String,
  },
  votes: {
    type: Number,
    default: 0
  },
  
 
});

module.exports = mongoose.model('Item', itemSchema);

