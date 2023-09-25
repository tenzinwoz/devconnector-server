const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  //get token form header
  const token = req.header("x-auth-token");

  //Check if no token
  if (!token) {
    res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.jwtSecret);
    req.user = decoded.user;
    next();
  } catch (error) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};
