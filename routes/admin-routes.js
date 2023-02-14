const express = require('express')
const adminController = require('../controller/admin-controller')
const auth = require("../middleware/auth")
const { check } = require("express-validator");

const router = express.Router()

router.get('/getusers',auth, adminController.getUsers) // Add auth middleware to identify that the user is an admin before performin the operation
router.get('/user/:uid', adminController.getUser )

router.get('/export', auth, adminController.exportData)  // Add auth middleware to identify that the user is an admin before performin the operation
router.get('/all-files', auth, adminController.getAllUploadedFiles)
router.post('/create-bill',auth,[ 
    check("bill_name").not().isEmpty().withMessage("Bill name is required"),
    check("bill_amount").not().isEmpty().withMessage("Bill amount is required"),
    check("bill_type").not().isEmpty().withMessage("Bill type is required"),
    check("duration").not().isEmpty().withMessage("Bill duration is required"),

    

   
  ],adminController.createBills)   // Add auth middleware to identify that the user is an admin before performin the operation

  router.get('/existing-bills', auth, adminController.getExistingBill)   // Add auth middleware to identify that the user is an admin before performin the operation
  router.get('/payment-report', auth, adminController.getPaymentReport)   // Add auth middleware to identify that the user is an admin before performin the operation


exports.router = router