const express = require("express");
const { check } = require("express-validator");

const userController = require("../controller/users-controller");
const { isResetTokenValid } = require("../middleware/user");
const auth = require("../middleware/auth")
//for the user to be able to edit their events meeting
//const eventsController = require("../controller/events-controller");

const router = express.Router();

router.post(
  "/signup", 
  [ 
    check("first_name").not().isEmpty().withMessage("Firstname is required"),
    check("last_name").not().isEmpty().withMessage("Lastname is required"),

    check("email")
      .normalizeEmail()
      .isEmail()
      .withMessage("Enter a valid Email"),
    check("phone_number")
      .not()
      .isEmpty()
      .withMessage("Enter a valid phone number"),
    check("dob").not().isEmpty().withMessage("Date of Birth is Required"),
    check("address").not().isEmpty().withMessage("Address is required"),

    check("password")
      .isLength({ min: 6 })
      .withMessage("Enter a password with minimum of 6 characters"),


    check("confirm_password").isLength({ min: 6 }).custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Confirm password  does not match password');
      }
  
      // Indicates the success of this synchronous custom validator
      return true;
    }),
    check("employer").not().isEmpty().withMessage("Employers name is required"),
    check("years_of_exp").not().isEmpty().withMessage("Years of experience is required"),
    check("membership_type").not().isEmpty().withMessage("Membership type is required"),

    // check("license_status")
    //   .not()
    //   .isEmpty()
    //   .withMessage("Your License Status is Required"),
    
    // check("sector").not().isEmpty().withMessage("Fintech Sector is Required"),
  ],
  userController.signup
);

router.post("/login", userController.login);

router.get("/email-verification", userController.verifyEmail);
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

router.get("/get-files", auth, userController.getUploadedFiles);
router.get("/get-downloaded-files", auth, userController.getDownloadedFiles);
router.get("/preview/:id", userController.preview);

router.get("/download/:id", auth, userController.download);



router.get("/new-bills", auth, userController.getNewBill)
router.get("/user-bill", auth, userController.userBills )
router.get("/get-cert", auth, userController.getCert )

//for the events
//this is for the user.
//user wont be able to access some features like update and all.

router.get('/events', auth, userController.getAllEvents);
router.get('/event/:id', auth, userController.getEvent);


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
