const mongoose = require("mongoose");
const bcrypt = require('bcryptjs')
const Schema = mongoose.Schema;
const resetTokenSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600,// this is the expiry time in seconds
  },
});


resetTokenSchema.pre("save", async function (next) {
    if(this.isModified("token")) {
        const hash = await bcrypt.hash(this.token, 12);
        this.token = hash
    }

    next()
})


resetTokenSchema.methods.compareToken = async function (token) {
    const result  = await bcrypt.compare(token, this.token);
    return result
}
module.exports = mongoose.model("ResetToken", resetTokenSchema);