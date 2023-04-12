const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      throw new Error("Authentication Failed!");
    }
    jwt.verify(token, process.env.JWT_KEY, (err, decodedToken) => {
      if (err) {
        return res.status(401).json({ message: err.message });
      }
      req.userData = { userId: decodedToken.userId, role: decodedToken.role, username: decodedToken.username };
      return next();
    });
  } catch (err) {
    return res.status(401).json({ message: "Authentication Failed!" });
  }
};
