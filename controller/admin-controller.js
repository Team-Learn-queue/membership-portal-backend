const User = require("../models/users");
const fs = require("fs");
const csv = require("csv-string");
const auth = require("../middleware/auth");
const { isValidObjectId } = require("mongoose");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const HttpError = require("../models/http-error")

dotenv.config();

const connection = mongoose.connection

// const connection = mongoose.createConnection(
//   `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zchdj.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
//   { useNewUrlParser: true, useUnifiedTopology: true }
// ); 

let bucket;
connection.once("open", () => {
  bucket = new mongoose.mongo.GridFSBucket(connection, {
    bucketName: "resources", // Override the default bucket name (fs)
    chunkSizeBytes: 1048576, // Override the default chunk size (255KB)
  });
});
const getUsers = async (req, res, next) => {
  // console.log(req.userData.role)
  //  if(req.userData.role === "user") return next(HttpError("Invalid Credentials, could not log you in", 403));
  //  return res.status(403).json({message: "You are unauthorized for this operation"})
  User.find(
    { isVerified: true },
    " email first_name last_name phone_number company isVerified role sector dob"
  )
    .then((users) => {
      

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
const getAllUploadedFiles = async (req, res) => {
  if (req.userData.role === "user")
    return res
      .status(403)
      .json({ message: "You are unauthorized for this operation" });
    

  const cursor = bucket.find({});
  const filesMetadata = await cursor.toArray();
  if (!filesMetadata.length) return res.json({ err: "No a File was found" });

  res.json(filesMetadata);
};
module.exports = {
  getUsers,
  getUser,
  exportData,
  getAllUploadedFiles,
};
