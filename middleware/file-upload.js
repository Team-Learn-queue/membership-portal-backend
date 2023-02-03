const multer = require("multer");


const fileUpload = multer({limits: 500000,
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, "uploads");
      },
      filename: (req, file, cb) => {
        const ext = file.mimetype.split("/")[1];
        cb(null, `files/${file.fieldname}-${Date.now()}.${ext}`);

      },
    })}).array("upload",10)



module.exports = fileUpload

// if (error.code === "LIMIT_UNEXPECTED_FILE") {
//     return res.status(400).send({
//       message: "Too many files to upload.",
//     });
//   }