const express = require("express");
// const auth = require("../middleware/auth")

const { check } = require("express-validator");

const discussionController = require("../controller/discussionGroup");

const auth = require("../middleware/auth");

const router = express.Router();

router.get("/", auth, discussionController.getAllGroup);

router.post(
  "/",auth,
  [
    check("name")
      .not()
      .isEmpty()
      .withMessage("Name of Discussion Group is Required"),
  ],
  auth,
  discussionController.createGroup
); // add auth
router.post(
  "/send-message/:gId",
  [check("message").not().isEmpty().withMessage("Message Field is Empty")],
  auth,
  discussionController.sendMessage
);
router.get("/get-group/:gId", auth, discussionController.getGroup);
router.get("/get-messages/:gId", auth, discussionController.getMessage);
router.get("/join/:gId", auth, discussionController.JoinGroup);

router.get("/user-groups", auth, discussionController.getUserGroups);


exports.router = router;
