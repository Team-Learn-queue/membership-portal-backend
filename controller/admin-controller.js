const User = require("../models/users");

const getUsers = async (req, res) => {
  User.find({}, "email name phone_number isVerified")
    .then((users) => {
      return res.status(200).json({ users: users });
    })
    .catch((e) => {
      return res.status(500).json({ message: "Cannot find users" });
    });
};

module.exports = {
  getUsers,
};
