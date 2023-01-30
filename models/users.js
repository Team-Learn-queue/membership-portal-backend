const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
},
  phone_number: {
    type: Number,
    required: true
  },
  password: {
    type: String,
    required: true,
    minLength: 6,
  },
  company: {
    type: String,
    required: true,
  },
  license_status: {
    type: String,
    enum:{ 
      values: ['Licensed', 'Unlicensed'],
       message: '{VALUE} is not an option'
      },
    
  },
  regulator: {
    type: String,
    enum: {
      values: ['CBN','PENCOM','NAICOM','SEC'],
      message: '{VALUE} is not an option'
    },
    
  },
  sector: [{
    type: String,
    required: true,
  }],
  isVerified: {
    type: Boolean,
     default: false 
  }
}); 



module.exports = mongoose.model("User", userSchema);
