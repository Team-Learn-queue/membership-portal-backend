const express = require("express");
const { check } = require("express-validator");
const userController = require("../controller/users-controller");
const { isResetTokenValid } = require("../middleware/user");
const auth = require("../middleware/auth")

const router = express.Router();

router.post("/signup", [ 
    check("first_name").not().isEmpty().withMessage("Firstname is required"),
    check("last_name").not().isEmpty().withMessage("Lastname is required"),
    check("email").normalizeEmail().isEmail().withMessage("Enter a valid Email"),
    check("phone_number").not().isEmpty().withMessage("Enter a valid phone number"),
    check("password").isLength({ min: 6 }).withMessage("Enter a password with minimum of 6 characters"),
    check("confirm_password").isLength({ min: 6 }).custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Confirm password  does not match password');
      }
      return true;
    }),
    check("years_of_exp").not().isEmpty().withMessage("Years of experience is required"),
    check("membership_type").not().isEmpty().withMessage("Membership type is required"),
  ],userController.signup
);
router.post("/login", userController.login);
router.get("/email-verification", userController.verifyEmail);
router.post("/resend-link",[check("email").normalizeEmail().isEmail().withMessage("Enter a valid Email"),],userController.resendLink);
router.post("/forgot-password",[
    check("email").normalizeEmail().isEmail().withMessage("Enter a valid Email"),
  ], userController.forgotPassword
  );
router.post("/reset-password",[
  check("password").isLength({ min: 6 }).withMessage("Enter a password with minimum of 6 characters"),
  ], isResetTokenValid,
  userController.resetPassword
);
router.get("/get-user", auth, userController.getLoggedUser); 
router.patch("/edit-profile", auth, userController.editProfile); 
router.get("/get-files", auth, userController.getUploadedFiles);
router.get("/get-downloaded-files", auth, userController.getDownloadedFiles);
router.get("/preview/:id", userController.preview);
router.get("/download/:id", auth, userController.download);
router.get("/new-bills", auth,userController.getNewBill)
router.get("/user-bills", auth,userController.userBills )
router.get("/user-paid-bills", auth,userController.userPaidBills )
router.get("/user-unpaid-bills", auth,userController.userUnpaidBills )
router.get("/get-cert", auth, userController.getCert )
router.get("/reciept/:billId", auth, userController.getReciept )

router.post("/pay/:billId",  auth, userController.pay )
router.post("/webhook", userController.webhook )
router.get('/user-events', auth, userController.userEvents) 

exports.router = router;  
