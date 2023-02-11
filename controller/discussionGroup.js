const DiscussionGroup = require("../models/discussionGroup");
const io = require("../socket");
const { validationResult } = require("express-validator");

const Message = require("../models/message");
const User = require("../models/users.js");
const HttpError = require("../models/http-error")

String.prototype.toProperCase = function () {
  return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};




const createGroup = async (req, res,next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) { 
    const message = errors.errors[0].msg;
    return res.status(500).json({ message: message });
  }
  const { name } = req.body;

  const nameRegex = /^[A-Za-z\s]+$/;

  if (!nameRegex.test(name)) return next(HttpError("Discussion group name can contain only alphabets"))
  
  const caseName = name.toProperCase()
  const discussionGroupExists = await DiscussionGroup.findOne({ name: caseName });

  if (discussionGroupExists) return next(HttpError("Group Already Exist"));

  const discussionGroup = new DiscussionGroup({
    name: caseName
  });

  await discussionGroup.save();

  res.json({
    message: "Discussion Group created!",
  });
};

const getAllGroup = async (req, res) => {
  const discussionGroups = await DiscussionGroup.find({});

  res.json(discussionGroups);
};

const sendMessage = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const message = errors.errors[0].msg;
    return res.status(500).json({ message: message });
  }
  // const socket = require("../socket").socket();
  // console.log(socket.username)
  const { message } = req.body;
  const { gId } = req.params;
  const user = await User.findOne({ _id: req.userData.userId });
  //  console.log(user) 
  const newMessage = new Message({
    discussionGroup: gId,
    user: req.userData.userId,
    message,
  });
  await newMessage.save();
  io.getIO().to(gId).emit("newMessage", {
    message: newMessage.message,
    name: req.userData.username,
    userId: req.userData.userId,
  });
  res.status(201).json({
    message: "Post created successfully!",
    
  });
};

const getGroup = (req, res) => {
  const groupId = req.params.gId.replace(/\s+/g, " ").trim();
  DiscussionGroup.findById(groupId)
    .then((group) => {
      if (!group) return res.status(401).json({ message: "No user found" });
      return res.status(201).json(group);
    })
    .catch(() => {
      return res.status(404).json({ message: "Invalid id" });
    });
};


const getMessage = (req, res) => {
  const groupId = req.params.gId.replace(/\s+/g, " ").trim();
  Message.find({discussionGroup : groupId}, "-discussionGroup")
  .populate({path: 'user', select: 'first_name last_name'})

    .then((messages) => {
      
      
      if (!messages) return res.status(401).json({ message: "No user found" });
      const data = messages.map((message) => ({
        message: message.message,
        name:`${message.user.first_name} ${message.user.last_name}`  ,
        userId: message.user._id
      }))
      return res.status(201).json(data);
    })
    .catch(() => {
      return res.status(404).json({ message: "Invalid id" });
    });
};



module.exports = {
  createGroup,
  getAllGroup,
  sendMessage,
  getGroup,
  getMessage
};
