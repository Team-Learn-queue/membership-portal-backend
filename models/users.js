const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs')


const userSchema = new Schema({
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
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

  dob: {
    type: Date
    
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
      values: ['CBN','PENCOM','NAICOM','SEC', null],
      message: '{VALUE} is not an option'
    },
    
  },
  sector: [{
    type: String,
  }],
  bills:[ {
    type: Schema.Types.ObjectId,
    ref: "Bill",
  }],
  unjoined_groups:[{
    type: Schema.Types.ObjectId,
    ref: "DiscussionGroup",
  }
  ],
  joined_groups:[{
    type: Schema.Types.ObjectId,
    ref: "DiscussionGroup",
  }
  ],
  isVerified: {
    type: Boolean,
     default: false 
  },
  
}); 

userSchema.pre("save", async function (next) {
  if(this.isModified("password")) {
      const hash = await bcrypt.hash(this.password, 12);
      this.password = hash
  }

  next()
})


userSchema.methods.comparePassword = async function (password) {
  const result  = await bcrypt.compare(password, this.password);
  return result
}


module.exports = mongoose.model("User", userSchema);
