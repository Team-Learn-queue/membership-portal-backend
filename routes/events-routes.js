//import express from "express";
const express = require("express");
const auth = require("../middleware/auth");
const eventsController = require("../controller/events-controller");

const router = express.Router();

    /*"NameofEvent":"Onboarding of the new executives",
    "Members": "seminire@gmail.com, okeyihedi@yahoo.com, okpara@gmail.com",
    "Venue":"Upper staff room",
    "Date": "23/2/2023",
    "Time":"16:00:00 WAT",
    "Set reminder": "true"
}]*/

//admin can get all user events
router.get('/', auth, eventsController.getAllEvents);
router.get('/', auth, eventsController.getEvent); //gets events by id
router.post('/event/:id', auth, eventsController.addEvent); // schedule a meeting/event for the user
router.delete('/event/:id', auth,  eventsController.deleteEvent); //delete the meeting when done

exports.router = router;