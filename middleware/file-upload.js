const multer = require("multer");
const mongoose = require("mongoose");
const crypto = require('crypto');
const path = require('path');

const dotenv = require("dotenv");
const { GridFsStorage } = require("multer-gridfs-storage");
dotenv.config();


// const connection = mongoose.createConnection(
//   `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zchdj.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
//   { useNewUrlParser: true, useUnifiedTopology: true, }
// );


const connection = mongoose.connection

const storage = new GridFsStorage({
  db: connection,
  file: (req, file) => ({
    // filename: `${file.originalname}_${Date.now()}`, // Override the default filename

    filename: file.originalname, // Override the default filename
    bucketName: "resources", // Override the default bucket name (fs)
    chunkSize: 500000, // Override the default chunk size (255KB)
    // metadata: {
    //   uploadedBy: req.userData.userId,
    //   username: req.userData.username,  
    // }, // Attach any metadata to the uploaded file
  }),
});
const fileUpload = multer({
  storage,

  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpeg|jpg|png|pdf|doc|docx|xlsx|xlx)$/)) {
      req.fileValidationError =
        "Extension not supported, Supported ext : jpeg|jpg|png|pdf|doc|docx|xlsx|xlx";
      return cb(null, false, req.fileValidationError);
    }
    cb(undefined, true);
  },
}).array("upload", 5);

module.exports = fileUpload;

// const fileUpload = multer({
//   limits: 500000,
//   storage: multer.diskStorage({
//     destination: (req, file, cb) => {
//       cb(null, "uploads");
//     },
//     filename: (req, file, cb) => {
//       const ext = file.mimetype.split("/")[1];
//       cb(null, `files/${file.fieldname}-${Date.now()}.${ext}`);
//     },
//   }),

//   fileFilter(req, file, cb) {
//     if (!file.originalname.match(/\.(jpeg|jpg|png|pdf|doc|docx|xlsx|xlx)$/)) {
//       req.fileValidationError =
//         "Extension not supported, Supported ext : jpeg|jpg|png|pdf|doc|docx|xlsx|xlx";
//       return cb(null, false, req.fileValidationError);
//     }
//     cb(undefined, true);
//   },
// }).array("upload", 2);
