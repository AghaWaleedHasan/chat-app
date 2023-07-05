const mongoose = require("mongoose");

const messageModel = mongoose.Schema(
  {
    text: { type: String },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
  },
  { timestamps: true }
);

const message = mongoose.model("Message", messageModel);

module.exports = message;
