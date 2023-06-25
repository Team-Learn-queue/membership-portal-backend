const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const voteSchema = new Schema({
    name: {
        type: String,
        required: true,

    },
    votes: {
        type: Number,
    },
    users_voted: [String],
    createdAt:{
        type: Date,
        default: Date.now,

    },
    voteId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: true,
    }

});

module.exports = mongoose.model('Votes', voteSchema);