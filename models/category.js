const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    categoryName: {
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
  });
  
  
  module.exports = mongoose.model('Category', categorySchema);