const mongoose = require("mongoose");

const pollSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
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
