const mongoose = require("mongoose");

const discussionGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: "Name is required!",
  },
});

module.exports = mongoose.model("DiscussionGroup", discussionGroupSchema);
