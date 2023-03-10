const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categorySchema = new Schema({
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    category:{type: String,
    enum:{ 
      values: ['Student', 'Graduate', 'Corporate'],
       message: '{VALUE} is not an option'
      },
    required: true
   }
  });

  module.exports = mongoose.model("Category", categorySchema);
