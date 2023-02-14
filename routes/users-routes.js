const express = require("express");
const { check } = require("express-validator");
const multer = require("multer");

const userController = require("../controller/users-controller");
const { isResetTokenValid } = require("../middleware/user");
const fileUpload = require("../middleware/file-upload");
const auth = require("../middleware/auth")

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
      .withMessage("Your License Status is Required"),
    
    check("sector").not().isEmpty().withMessage("Fintech Sector is Required"),
  ],
  userController.signup
);

router.post("/login", userController.login);

router.get("/verify/:email/:token", userController.verifyEmail);
router.post(
  "/resend-link",
  [
    check("email")
      .normalizeEmail()
      .isEmail()
      .withMessage("Enter a valid Email"),
  ],
  userController.resendLink
);

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
router.get("/get-user", auth, userController.getLoggedUser); 

router.patch("/edit-profile", auth, userController.editProfile); 
router.post("/upload", auth, function (req, res, next) {
  fileUpload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        message: "Something went wrong, The field name should be upload and  Files should not be more than 5",
      });
    } else if (err) {
      return res.status(400).json({
        message: "Something went wrong, Please try again.",
      });
    }

    next()
  });
} , userController.upload);
router.get("/get-files/:uid",userController.getUploadedFiles);
router.get("/get-file/:id",userController.getSingleFile);

router.get("/download/:id",userController.download);
router.get("/new-bills", auth,userController.getNewBill)
router.get("/existing-bills", auth,userController.getUserExistingBill )
router.get("/payment-history", auth,userController.getPaymentHistory )




// router.post(
//   "/file-upload", auth,
//   function (req, res, next) {
//     fileUpload(req, res, function (err) {
//       if (err instanceof multer.MulterError) {
//         return res.status(400).json({
//           message: "Something went wrong, Files should not be more than 10",
//         });
//       } else if (err) {
//         return res.status(400).json({
//           message: "Something went wrong, Please try again.",
//         });
//       }

//       next()
//     });
//   },
//   userController.fileUpload
// );
// router.get("/get-files", auth, userController.userFiles);
// router.get("/file-download/:id", auth, userController.fileDownload);


exports.router = router;
