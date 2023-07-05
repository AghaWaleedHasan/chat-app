const jwt = require("jsonwebtoken");
const User = require("../models/userModel.js");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded._id).select("-password");

      //   console.log("req.user: ", req.user);

      next();
    } catch (error) {
      res.status(401);
      res.json({
        success: false,
        message: "Unauthorized",
      });
    }
  }

  if (!token) {
    res.status(401);
    res.json({
      success: false,
      message: "Unauthorized",
    });
  }
};

module.exports = protect;
