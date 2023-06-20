const User = require("../models/users");
const Vote = require("../models/vote");
const cloudinary = require("cloudinary").v2;
const { validationResult } = require("express-validator");

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY
  });


const setVote = async (req, res) => {
    if (req.userData.role === "user") return next(HttpError("You are unauthorized for this operation", 403));
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const message = errors.errors[0].msg;
      return res.status(400).json({ message: message });
    }
    let image 
    if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path, { folder: 'anstesters-vote-image' });
         image = result.secure_url;
    }
   
    try {
        const vote = await Vote.create({...req.body,image:image?image:null});
        res.json({ message: 'Vote details and dates set successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };

const vote = async (req, res) => {
    try {
    const { voteId } = req.params;
    const vote = await Vote.findById(voteId);
    if (!vote) return res.status(404).json({ message: 'Item not found' });
    const currentDate = new Date();
    if (currentDate < vote.startDate || currentDate > vote.endDate) {
        return res.status(400).json({ message: 'Voting is not currently active' });
    }
    if (vote.votedBy.includes(req.userData.userId)) return res.status(400).json({ message: 'User already voted for this Item' });
    vote.votes += 1;
    vote.votedBy.push(req.userData.userId);
    await vote.save();
    res.json({ message: 'Vote successful' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  module.exports = {
    setVote,
    vote
  };