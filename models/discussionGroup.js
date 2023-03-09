const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const discussionGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: "Name is required!",
  },
  // belong: {
  //   type: String,
  //   enum: {
  //     values: ['users','admin'],
  //     message: '{VALUE} is not an option'
  //   },
  //   default: 'users'
  // },
  users:[{
    type: Schema.Types.ObjectId,
    ref: "User",
  }
  ],
});

module.exports = mongoose.model("DiscussionGroup", discussionGroupSchema);
