const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const billSchema = new Schema(
  {
    individual: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    bill_name: {
      trim: true,
      type: String,
      required: true,
      lowercase: true,
    },
    bill_amount: {
      type: Number,
      required: true,
    },
    // bill_type: {
    //   type: String,
    //   enum: {
    //     values: ["optional", "mandatory"],
    //     message: "{VALUE} is not an option",
    //   },
    // },
    duration: {
      type: String,
    },
    status: {
      type: String,
      enum: {
        values: ["unpaid", "paid"],
        message: "{VALUE} is not an option",
      },
      default: "unpaid",
    },
    dateIssued: {
      type: Date
    },
    validUntil: {
      type: Date,
    },
    mode_of_payment: {
      type: String,
    },
    transaction_ref: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bill", billSchema);

// date={new Date(post.createdAt).toLocaleDateString('en-US')}
