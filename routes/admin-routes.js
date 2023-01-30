const express = require('express')
const adminController = require('../controller/admin-controller')

const router = express.Router()

router.get('/getusers', adminController.getUsers)
router.get('/:uid', adminController.getUser )

// router.get('/export', adminController.exportData)



exports.router = router