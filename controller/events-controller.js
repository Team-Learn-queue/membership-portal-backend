const Event = require("../models/events");
const { validationResult } = require("express-validator");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
/*let events = [{
    "NameofEvent":"Onboarding of the new executives",
    "Members": "seminire@gmail.com, okeyihedi@yahoo.com, okpara@gmail.com",
    "Venue":"Upper staff room",
    "Date": "23/2/2023",
    "Time":"16:00:00 WAT",
    "Set reminder": "true"
}]*/
//I will need the admin to send reminders to their email
const {
    transporter,
    verifyEmailTemplate,
    forgotEmailTemplate,
    passwordSetTemplate,
    verifiedTemplate,
  } = require("../util/email");

const getAllEvents = async (req, res) =>{
        //console.log(events);
        const events = await Event.find({});
        res.status(200).json(events);
}

const getEventById = async (req, res) => {
    let event;
    try {
      const FoundEvents = await Event.findById((event) => event.id ===id)
      res.json(FoundEvents);
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({ message: "Events Deleted." });
    }
  };


const addEvent =  async (req,res) => {
    const event = await req.body;
    //we need the id when creating the user
    //const eventsId = uuidv4();
    const events = Event({
        NameofEvent,
        Members,
        Venue,
        Date,
        Time,
        setReminder,


    });
    const eventwithId = ({ ...event, id});
    events.push(eventwithId);
    res.send(`event with the title ${event.NameOfEvent} is added to the calendar!`);

}

const getEvent =  (req,res) => {
    const {id} = req.params;
    const foundEvent = events.find((event) => event.id ===id);
    res.send(foundEvent);
}
const deleteEvent = (req,res) =>{
    const {id} = req.params;
    events = events.filter((event) => event.id !== false);
    res.send(`event with the id ${id} has been deleted from the calendar!`);
}
const updateEvent = (req,res) => {
  const {id} = req.params;
  const eventIndex = events.findIndex((event) => event.id === req.params.eventId);
  if (eventIndex !== -1) {
    const updatedEvent = Object.assign({}, events[eventIndex], req.body);
    events[eventIndex] = updatedEvent;
    res.json(updatedEvent);
  } else {
    res.status(404).send();
  }
}

module.exports = {
    getAllEvents,
    getEvent,
    addEvent,
    updateEvent,
    deleteEvent

}



