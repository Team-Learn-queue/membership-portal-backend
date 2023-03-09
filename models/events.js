const mongoose = require("mongoose");
const router = require('../routes/events-routes');
const Schema = mongoose.Schema;

const EventsSchema = new Schema({
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
        type: Date 

    },
    
    Time:{
       

    },
    setReminder:{
        type:Boolean,
        default: true,

    }
    
},
{timestamps: true});
module.exports = mongoose.model("Event", EventsSchema);