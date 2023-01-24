const express = require('express')
const adminController = require('../controller/admin-controller')

const router = express.Router()

router.get('/getusers', adminController.getUsers)


exports.router = router