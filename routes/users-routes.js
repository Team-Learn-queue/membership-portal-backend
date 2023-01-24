const express = require('express')
const {check} = require('express-validator')
const userController = require('../controller/users-controller')

const router = express.Router()

router.post('/signup', [
    check("name").not().isEmpty().withMessage("Enter your Fullname"),
    check("email").normalizeEmail().isEmail().withMessage("Enter a valid Email"),
    check('password').isLength({min:6}).withMessage("Enter a password with minimum of 6 characters")
    
  ], userController.signup);

  router.get('/verify/:email/:token', userController.verifyEmail)


  exports.router = router


