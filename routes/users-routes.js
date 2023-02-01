const express = require("express");
const { check } = require("express-validator");
const userController = require("../controller/users-controller");
const { isResetTokenValid } = require("../middleware/user");

const router = express.Router();

router.post(
  "/signup",
  [
    check("name").not().isEmpty().withMessage("Enter your Fullname"),
    check("email")
      .normalizeEmail()
      .isEmail()
      .withMessage("Enter a valid Email"),
    check("phone_number")
      .not()
      .isEmpty()
      .withMessage("Enter a valid phone number"),
    check("dob").not().isEmpty().withMessage("Date of Birth is Required"),
    check("password")
      .isLength({ min: 6 })
      .withMessage("Enter a password with minimum of 6 characters"),
    check("company").not().isEmpty().withMessage("Enter your Company's name"),
    check("license_status")
      .not()
      .isEmpty()
      .withMessage("Your Lincense Status is Required"),
    check("regulator").not().isEmpty().withMessage("Regulator is Required"),
    check("sector").not().isEmpty().withMessage("Fintech Sector is Required"),
  ],
  userController.signup
);

router.post("/login", userController.login);

router.get("/verify/:email/:token", userController.verifyEmail);
router.post("/resend-link",  [
  check("email")
    .normalizeEmail()
    .isEmail()
    .withMessage("Enter a valid Email"),
], userController.resendLink);

router.post(
  "/forgot-password",
  [
    check("email")
      .normalizeEmail()
      .isEmail()
      .withMessage("Enter a valid Email"),
  ],
  userController.forgotPassword
);
router.post(
  "/reset-password",
  [
    check("password")
      .isLength({ min: 6 })
      .withMessage("Enter a password with minimum of 6 characters"),
  ],
  isResetTokenValid,
  userController.resetPassword
);
router.patch("/edit-profile/:id", userController.editProfile);

exports.router = router;
