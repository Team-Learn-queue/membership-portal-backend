const express = require("express");
const { check } = require("express-validator");
const voteController = require("../controller/vote-controller");
const auth = require("../middleware/auth")
const multer = require("multer");
const storage = multer.diskStorage({});
const upload = multer({ storage , fileFilter: function(req, file, callback) {
  if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
    return callback(new Error('Only image files are allowed!'));
  }
  callback(null, true);
}})
const router = express.Router();

router.post("/set-vote",upload.single("image"),[
    check("description").not().isEmpty().withMessage("Vote description is required"),
    check("startDate").not().isEmpty().withMessage("Start Date is required"),
    check("endDate").not().isEmpty().withMessage("End Date is required"),
  ], auth,
  voteController.setVote); 

router.post("/:voteId", auth, voteController.vote); 


exports.router = router;
