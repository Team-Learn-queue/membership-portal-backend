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
      // enum: {
      //   values: ["monthly", "quarterly", "yearly"],
      //   message: "{VALUE} is not an option",
      // },
    },
    status: {
      type: String,
      enum: {
        values: ["unpaid", "paid"],
        message: "{VALUE} is not an option",
      },
      default: "unpaid"
    },
    validUntil: {
      type: Date
    },
    mode_of_payment: {
      type: String,
      // default: "cash"

    },
    transaction_ref: {
      type: String, 
      // default: "000000011223344"

    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bill", billSchema);


// date={new Date(post.createdAt).toLocaleDateString('en-US')}