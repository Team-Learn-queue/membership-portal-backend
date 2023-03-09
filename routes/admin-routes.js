const express = require('express')
const adminController = require('../controller/admin-controller')
const auth = require("../middleware/auth")
const { check } = require("express-validator");
const multer = require("multer");
const fileUpload = require("../middleware/file-upload");

const router = express.Router()

router.get('/getusers',auth, adminController.getUsers) // Add auth middleware to identify that the user is an admin before performin the operation
router.get('/user/:uid', adminController.getUser )

router.get('/export', auth, adminController.exportData)  // Add auth middleware to identify that the user is an admin before performin the operation
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
} , adminController.upload);

// router.get('/all-files', auth, adminController.getAllUploadedFiles)
// router.get('/get-user-files/:uid', auth, adminController.getUserFiles)

router.post('/create-bill',auth,[ 
    check("bill_name").not().isEmpty().withMessage("Bill name is required"),
    check("bill_amount").not().isEmpty().withMessage("Bill amount is required"),

    

   
  ],adminController.createBills)   // Add auth middleware to identify that the user is an admin before performin the operation
 router.patch('/bill/:id',auth, adminController.updateBill)
  router.get('/existing-bills', auth, adminController.getExistingBill)   // Add auth middleware to identify that the user is an admin before performin the operation
  router.get('/paid-bills', auth, adminController.getPaidBills)   // Add auth middleware to identify that the user is an admin before performin the operation
  router.get('/download-report', auth, adminController.downloadPaymentReport)   // Add auth middleware to identify that the user is an admin before performin the operation


exports.router = router