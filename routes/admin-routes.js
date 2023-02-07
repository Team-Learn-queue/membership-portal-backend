const express = require('express')
const adminController = require('../controller/admin-controller')
const auth = require("../middleware/auth")

const router = express.Router()

router.get('/getusers', adminController.getUsers)
router.get('/user/:uid', adminController.getUser )

router.get('/export', adminController.exportData)
router.get('/all-files', auth, adminController.allFiles)



exports.router = router