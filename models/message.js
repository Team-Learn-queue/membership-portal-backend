const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  discussionGroup: {
    type: mongoose.Schema.Types.ObjectId,
    required: "DiscussionGroup is required!",
    ref: "DiscussionGroup",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: "DiscussionGroup is required!",
    ref: "User",
  },
  message: {
    type: String,
    required: "Message is required!",
  },
});

module.exports = mongoose.model("Message", messageSchema);
