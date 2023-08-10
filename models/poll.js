const mongoose = require("mongoose");

const pollSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true 
  },
  archive: {
    type: Boolean,
    default: false
  },
  categories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
  ],
  votedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
}],

});

module.exports = mongoose.model("Poll", pollSchema);
