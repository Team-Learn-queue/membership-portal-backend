const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const EventsSchema = new Schema({
    // event_id:{
    //     type: mongoose.Schema.Types.ObjectId,
    //     required: true,
    //     ref: "Event",
    // },
    NameofEvent:{
        type: String,
        required: true,
        min: 3,
        max: 20,

    },
    Members:{
        type: Array,
        default: []

    },
    Venue:{
        type: String,
    },
    
    Date:{
        type: Date,
        required: true, 

    },
    attending:{
        type: Boolean,

    },
    setReminder:{
        type:Boolean,
        default: true,

    }
    
},
{timestamps: true});
module.exports = mongoose.model("Event", EventsSchema);