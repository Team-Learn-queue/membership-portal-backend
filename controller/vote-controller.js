const User = require("../models/users");
const Item = require("../models/voteItem");
const Poll = require("../models/poll");
const Category = require("../models/category");
const cloudinary = require("cloudinary").v2;
const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const { isValidObjectId } = require("mongoose");

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
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { title, startDate, endDate, categoryName, items } = req.body;
    let poll = await Poll.findOne({ title });
    if (!poll) {
      poll = await Poll.create({ title });
    }
    const categoryExists = await Category.findOne({
      _id: { $in: poll.categories },
      categoryName: categoryName,
    });

    if (categoryExists) {
      return res
        .status(400)
        .json({
          message: "Category with the same name already exists in this poll",
        });
    }

    if (req.files && req.files.length > 0) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const imageFile = req.files.find(
          (file) => file.fieldname === `items[${i}][image]`
        );
        if (imageFile) {
          const result = await cloudinary.uploader.upload(imageFile.path, {
            folder: "anstesters-vote-image",
          });
          item.image = result.secure_url;
        }
      }
    }
    const createdItems = await Promise.all(
      items.map(async (item) => {
        if (item.image) {
          const createdItem = await Item.create({
            name: item.name,
            description: item.description,
            image: item.image,
          });
          return createdItem;
        } else {
          return await Item.create({
            name: item.name,
            description: item.description,
          });
        }
      })
    );
    const category = await Category.create({
      categoryName,
      startDate,
      endDate,
      items: createdItems.map((item) => item._id),
    });
    poll.categories.push(category);
    await poll.save();
    res.json({
      message: "Vote details set successfully"});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }

  // const errors = validationResult(req);
  // if (!errors.isEmpty()) {
  //   const message = errors.errors[0].msg;
  //   return res.status(400).json({ message: message });
  // }
  // try {
  //   const { title, startDate, endDate, categoryName } = req.body;
  //   let poll = await Poll.findOne({ title });
  //   if (!poll) {
  //     poll = await Poll.create({ title });
  //   }
  //   const categoryExists = await Category.findOne({
  //     _id: { $in: poll.categories },
  //     categoryName: categoryName,
  //   });
  //   if (categoryExists) {
  //     return res.status(400).json({ message: "Category with the same name already exists in this poll" });
  //   }
  //   let images = [];
  //   console.log(req.files)
  //   if (req.files && req.files.length > 0) {
  //     for (const file of req.files) {
  //       const result = await cloudinary.uploader.upload(file.path, {
  //         folder: "anstesters-vote-image",
  //       });
  //       images.push(result.secure_url);
  //     }
  //   }
  //   const items = req.body.items.map((vote, index) => ({
  //     ...vote,
  //     image: images[index] || null,
  //   }));
  //   const createdItems = await Item.insertMany(items);
  //   const category = await Category.create({
  //     categoryName,
  //     startDate,
  //     endDate,
  //     items: createdItems.map((item) => item._id),
  //   });
  //   poll.categories.push(category);
  //   await poll.save();
  //   res.json({ message: "Vote details and dates set successfully" });
  // } catch (err) {
  //   console.error(err);
  //   res.status(500).json({ message: "Internal Server Error" });
  // }
};

const vote = async (req, res) => {
  try {
    const { pollId } = req.params;
    // const isValid = mongoose.Types.ObjectId.isValid(id);
    // if (!isValid) throw new Error("This id is not valid or not Found");
    if(!isValidObjectId(pollId)) return res.status(404).json({ message: "Invalid Poll" });

    const { votesArray } = req.body;
    const user = await User.findById(req.userData.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ message: "Poll not found" }); 
    }
    for (const voteItem of votesArray) {
      const { itemId, categoryId } = voteItem;
      if (poll.votedBy.includes(user._id)) {
        return res.status(400).json({ message: "User has already voted" });
      }
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      const currentDate = new Date();
      if (currentDate < category.startDate || currentDate > category.endDate) {
        return res
          .status(400)
          .json({
            message: "Voting for this category is not allowed at the moment",
          });
      }
      if (category.votedBy.includes(user._id)) {
        return res.status(400).json({ message: "User has already voted" });
      }
      const item = await Item.findById(itemId);
      if (!item || !category.items.includes(item._id)) {
        return res.status(404).json({ message: "Item not found" });
      }
      await Promise.all([
        Item.findOneAndUpdate({ _id: item._id }, { $inc: { votes: 1 } }),
        Category.findOneAndUpdate(
          { _id: category._id },
          { $push: { votedBy: user._id } }
        ),
      ]);
    }
    await Poll.findOneAndUpdate(
      { _id: poll._id },
      { $push: { votedBy: user._id } }
    ),
      res.status(200).json({ message: "Votes recorded successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to vote" });
  }
};

const getPolls = async (req, res) => {
  try {
    const voteItems = await Poll.find({})
      .populate({
        path: "categories",
        populate: {
          path: "items",
        },
      })
      .exec();
    res.json(voteItems);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong, Please try again!" });
  }
};

const getPoll = async (req, res) => {
  const { pollId } = req.params;
  try {
    const voteItems = await Poll.findById({ _id: pollId })
      .populate({
        path: "categories",
        populate: {
          path: "items",
        },
      })
      .exec();
    res.json(voteItems);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong, Please try again!" });
  }
};

const calculatePercentage = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const poll = await Category.findById(categoryId).populate("items");
    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }
    const totalVotes = poll.votedBy.length;

    const totalItemVotes = poll.items.reduce((sum, itemId) => {
      const item = poll.items.find((item) => item._id === itemId._id);
      return sum + item.votes;
    }, 0);
    const itemsWithPercentage = poll.items.map((itemId) => {
      const item = poll.items.find((item) => item._id === itemId._id);
      const percentage = (item.votes / totalItemVotes) * 100;
      return {
        name: item.name,
        description: item.description,
        votes: item.votes,
        image: item?.image,
        percentage,
      };
    });

    res.status(200).json({ itemsWithPercentage });
  } catch (err) {
    res.status(500).json({ message: "Failed to calculate percentages" });
  }
};

module.exports = {
  setPoll,
  getPoll,
  vote,
  calculatePercentage,
  getPolls,
};
