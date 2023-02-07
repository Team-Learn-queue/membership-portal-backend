const User = require("../models/users");
const fs = require("fs");
const csv = require("csv-string");
const auth = require("../middleware/auth");
const { isValidObjectId } = require("mongoose");


const getUsers = async (req, res) => {
  // console.log(req.userData.role)
  //  if(req.userData.role === "user") return res.status(403).json({message: "You are unauthorized for this operation"})
  User.find(
    { isVerified: true },
    " email first_name last_name phone_number company isVerified role sector dob"
  )
    .then((users) => {
      // members = users.map((user) => ({

      //   first_name: user.name.split(" ")[0],
      //   last_name: user.name.split(" ")[1],
      //   email: user.email,
      //   company: user.company,
      //   phone_number: user.phone_number,
      //   isVerified: user.isVerified,
      //   role: user.role,
      //   sector: user.sector,
      //   dob: user.dob
      // }));

      return res.status(200).json({ users });
    })
    .catch((e) => {
      return res.status(500).json({ message: "Cannot find users" });
    });
};

//Get Single User

const getUser = (req, res, next) => {
  const userId = req.params.uid.replace(/\s+/g, " ").trim();
  User.findById(
    userId,
    " email first_name last_name phone_number company isVerified role sector dob"
  )
    .then((user) => {
      if (!user) return res.status(401).json({ message: "No user found" });
      return res.status(201).json(user);
    })
    .catch(() => {
      return res.status(404).json({ message: "Invalid id" });
    });
};

const exportData = async (req, res) => {
  User.find({}, "-__v")
    .then((data) => {
      const headers = Object.keys(data[0].toObject());
      const csvData = csv.stringify([
        headers,
        ...data.map((item) => Object.values(item.toObject())),
      ]);

      fs.writeFileSync("export.csv", csvData);
      res.download("export.csv");
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

const allFiles = (req, res) => {
  if (req.userData.role === "user")
    return res
      .status(403)
      .json({ message: "You are unauthorized for this operation" });

  if (!isValidObjectId(req.userData.userId))
    return res.status(404).json({ message: "Invalid Request" });

  User.find({}, " first_name last_name resource_library")
    .populate({ path: "resource_library", select: "name path" })

    .then((user) => {
      if (!user) return res.status(400).json({ message: "No User Found" });

      return res.status(200).json(user);
    })
    .catch((e) => {
      return res
        .status(500)
        .json({ message: "Something went wrong, Please try again", err: e });
    });
};

module.exports = {
  getUsers,
  getUser,
  exportData,
  allFiles
};
