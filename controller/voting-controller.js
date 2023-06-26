const express = require("express");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const dotenv = require("dotenv");
const Votes = require("../models/vote");
var _ = require('lodash');

dotenv.config();

const getVotes = async (req, res) =>{

    try{
        const voteId = req.params.voteId;
    }catch (err) {
        
        return res.status(500).json({ success: false, message: 'Failed to retrieve vote' });
      }
   
}

const getVote= async (req, res) =>{
try {
    const voteId = req.params.voteId;
    // Find the vote by ID
    const vote = await Vote.findById(voteId);

    if (!vote) {
      return res.status(404).json({ success: false, message: 'Vote not found' });
    }

    res.status(200).json({ success: true, vote });
  }catch (err) {
    
    return res.status(500).json({ success: false, message: 'Failed to retrieve vote' });
  }
};

const createVote = async (req, res) => {
    // Extract necessary data from request body
    const { userId, voteId } = req.body;

    // Create a new vote
    const vote = new Vote({ itemId, userId });
    await vote.save();

    res.status(201).json({ success: true, vote });
  };  
  
  
  // Increment the vote number of an option of a poll
  // Returns a 403 if the user already voted
  const addVote = async (req, res) => {
    var id = req.params.id;
    var optionIndex = req.params.option;
    var username = req.user.name;
  
    Votes.findById(id, function(err, poll) {
      if (err) {
        return handleError(res, err);
      }
      if (!poll) {
        return res.status(404).send('Not Found');
      }
      if (poll.users_voted.indexOf(username) !== -1) {
        return res.status(403).send('User already cast vote');
      }
      poll.users_voted.push(username);
      poll.votes[optionIndex] = poll.votes[optionIndex] + 1;
      poll.markModified('votes');
      poll.save(function(err, newPoll) {
        if (err) {
          return handleError(res, err);
        }
        return res.status(200).json(newPoll);
      });
    });
  };
  

const updateVote = async (req, res) => {
    try {
      const voteId = req.params.voteId;
      const { itemId, userId } = req.body;
  
      // Find the vote by ID and update its properties
      const vote = await Vote.findByIdAndUpdate(voteId, { itemId, userId }, { new: true });
  
      if (!vote) {
        return res.status(404).json({ success: false, message: 'Vote not found' });
      }
  
      res.status(200).json({ success: true, vote });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to update vote' });
    }
  };
  
  // Delete vote
  const deleteVote = async (req, res) => {
    try {
      const voteId = req.params.voteId;
  
      // Find the vote by ID and remove it
      const vote = await Vote.findByIdAndRemove(voteId);
  
      if (!vote) {
        return res.status(404).json({ success: false, message: 'Vote not found' });
      }
  
      res.status(200)
    }catch(err){
        return res.status(500).json({ success: false, message: 'Failed to retrieve vote' });
    }
};

module.exports = {
    getVote,
    getVotes,
    createVote,
    addVote,
    updateVote,
    deleteVote,

}