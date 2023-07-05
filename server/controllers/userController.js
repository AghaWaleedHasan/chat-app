const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const userSearchController = async (req, res) => {
  const searchQuery = req.query.search;
  // console.log("search query: ", searchQuery);

  try {
    if (searchQuery) {
      var users = await User.find({
        $or: [
          { name: { $regex: searchQuery, $options: "i" } },
          { email: { $regex: searchQuery, $options: "i" } },
        ],
        _id: { $ne: req.user._id },
      });

      res.json({
        success: true,
        data: users,
      });
    } else {
      res.json({
        success: true,
        data: null,
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const userRegisterController = async (req, res) => {
  const { username, email, password } = req.body;
  console.log(username, email, password);

  const emailExists = await User.findOne({ email: req.body.email });

  if (emailExists) return res.status(400).send("Email already exists");

  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name: username,
    email: email,
    password: hashPassword,
  });

  try {
    res.json({
      success: true,
      message: "Logged in",
      username: user.name,
      id: user._id,
      email: user.email,
      token: jwt.sign({ _id: user._id }, "394yfhs$13r"),
    });
  } catch (err) {
    res.status(400).send(err);
  }
};

const userLoginController = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({
    email: email,
  });

  console.log("user: ", user);

  if (!user) {
    res.status(400).json({
      success: false,
      error: "Email not registered",
    });
  } else {
    console.log("user: ", user);
  }

  if (await bcrypt.compare(password, user.password)) {
    console.log("result: ", bcrypt.compare(password, user.password));
    res.json({
      success: true,
      message: "Logged in",
      username: user.name,
      id: user._id,
      email: user.email,
      token: jwt.sign({ _id: user._id }, process.env.JWT_SECRET),
    });
  } else {
    res.json({
      success: false,
      message: "Invalid credentials",
    });
  }
};

module.exports = {
  userLoginController,
  userRegisterController,
  userSearchController,
};
