const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const discussionGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: "Name is required!",
  },
  users:[{
    type: Schema.Types.ObjectId,
    ref: "User",
  }
  ],
});

module.exports = mongoose.model("DiscussionGroup", discussionGroupSchema);
