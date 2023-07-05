const mongoose = require("mongoose");

const userModel = mongoose.Schema(
  {
    name: { type: String },
    email: { type: String },
    password: { type: String },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userModel);

module.exports = User;
