//import express from "express";
const express = require("express");
const auth = require("../middleware/auth");
const eventsController = require("../controller/events-controller");

const router = express.Router();

//this is for the user.
//user wont be able to access some features like update and all.

router.get('/', auth, eventsController.getAllEvents);
router.get('/', auth, eventsController.getEvent); //gets events by id
router.delete('/event/:id', auth,  eventsController.deleteEvent); //delete the meeting when done

exports.router = router;