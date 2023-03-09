const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const fileUploadSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User",
      },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('FileUpload', fileUploadSchema);