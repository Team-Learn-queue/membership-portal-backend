
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
    req.userData = { userId: decodedToken.userId, role: decodedToken.role };  
    next();
  } catch (err) {
    return next(Http.HttpError1("Authentication Failed", 403));
  }
};