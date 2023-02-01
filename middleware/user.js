const User = require('../models/users')
const ResetToken = require('../models/resetToken')
const { isValidObjectId } = require('mongoose')


exports.isResetTokenValid = async(req,res,next) => {
    const {token,userId} = req.query

    if(!token && !userId)  return res.status(404).json({ message: "Invalid Request" });

    if(!isValidObjectId(userId)) return res.status(404).json({ message: "Invalid User" });


    const user = await User.findById(userId)
    if(!user) return res.status(404).json({ message: "User not found" });

    const resetToken = await ResetToken.findOne({userId:user.id})
    if(!resetToken) return res.status(404).json({ message: "Reset Token not found" });

    const isValid = await resetToken.compareToken(token)
    if(!isValid) return res.status(404).json({ message: "Token is not Valid" });

    req.user = user
    console.log(req.user)
    next()

}