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
router.post("/set-poll", upload.array("images", 10), auth, [
  check("title").not().isEmpty().withMessage("Poll Title is required"),
  check("startDate").not().isEmpty().withMessage("Start Date is required"),
  check("endDate").not().isEmpty().withMessage("End Date is required"),
  check("items").isArray({ min: 1 }).withMessage("At least one item is required"),
], voteController.setPoll); 
router.put('/polls/:pollId/vote',auth, voteController.vote)
router.get('/polls',auth, voteController.getPolls)
router.get('/polls/:pollId',auth, voteController.getPoll)
router.get('/polls/total-percentage/:pollId',auth, voteController.calculatePercentage)


exports.router = router;


// app.post('/polls/:pollId/vote', 