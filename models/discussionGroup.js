const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const discussionGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: "Name is required!",
    lowercase: true,
    trim: true,


  },
  users:[{
    type: Schema.Types.ObjectId,
    ref: "User",
  }
  ],
}, { timestamps: true });

module.exports = mongoose.model("DiscussionGroup", discussionGroupSchema);
