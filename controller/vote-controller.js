const User = require("../models/users");
const Item = require("../models/voteItem");
const Poll = require("../models/poll");
const cloudinary = require("cloudinary").v2;
const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");


cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

const setPoll = async (req, res, next) => {
  if (req.userData.role === "user")
    return next(HttpError("You are unauthorized for this operation", 403));
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors.errors[0].msg;
    return res.status(400).json({ message: message });
  }

  try {
    const { title, startDate, endDate } = req.body;
    const poll = await Poll.create({ title, startDate, endDate });

    let images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "anstesters-vote-image",
        });
        images.push(result.secure_url);
      }
    }
    const items = req.body.items.map((vote, index) => ({
      ...vote,
      image: images[index] || null,
    }));
    const createdItems = await Item.insertMany(items);
    poll.items = createdItems.map((item) => item._id);
    await poll.save();
    res.json({ message: "Vote details and dates set successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const vote = async (req, res) => {
  try {
    const { pollId } = req.params;
    const { itemId } = req.body;
    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ error: "Poll not found" });
    }
    const currentDate = new Date();
    if (currentDate < poll.startDate || currentDate > poll.endDate) {
      return res
        .status(400)
        .json({ error: "Voting for this poll is not allowed at the moment" });
    }
    const user = await User.findById(req.userData.userId);
    if (poll.votedBy.includes(user._id)) {
      return res.status(400).json({ error: "User has already voted" });
    }
    const item = await Item.findById(itemId);
    if (!item || !poll.items.includes(item._id)) {
      return res.status(404).json({ error: "Item not found" });
    }
    await Promise.all([
      Item.findOneAndUpdate({ _id: item._id }, { $inc: { votes: 1 } }),
      Poll.findOneAndUpdate(
        { _id: poll._id },
        { $push: { votedBy: user._id } }
      ),
    ]);
    res.status(200).json({ message: "Vote recorded successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to vote" });
  }
};

const getPoll = async (req, res) => {
  const { pollId } = req.params;
  try {
    const voteItems = await Poll.findById({ _id: pollId }).populate("items");
    res.json(voteItems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const calculatePercentage = async (req, res) => {
  try {
    const { pollId } = req.params;
    const poll = await Poll.findById(pollId).populate("items");
    if (!poll) {
      return res.status(404).json({ error: "Poll not found" });
    }
    const totalVotes = poll.votedBy.length;

    // Calculate the sum of all item votes
    const totalItemVotes = poll.items.reduce((sum, itemId) => {
      const item = poll.items.find((item) => item._id === itemId._id);
      return sum + item.votes;
    }, 0);
    // Calculate the percentage for each item in the poll
    const itemsWithPercentage = poll.items.map((itemId) => {
      const item = poll.items.find((item) => item._id === itemId._id);
      const percentage = (item.votes / totalItemVotes) * 100;
      return {
        description: item.description,
        votes: item.votes,
        image: item?.image,
        percentage,
      };
    });

    res.status(200).json({ itemsWithPercentage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to calculate percentages" });
  }
};

module.exports = {
  setPoll,
  getPoll,
  vote,
  calculatePercentage,
};
