
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    if(req.method === 'OPTIONS') {
        return next()
    }
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      throw new Error("Authentication Failed!");
    }
    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    if(!decodedToken) {return res.status(403).json({message: "Authorization Failed!"})}
    req.userData = { userId: decodedToken.userId, role: decodedToken.role };  
    next();
  } catch (err) {
    return res.status(403).json({message: "Authorization Failed"});
  }
};