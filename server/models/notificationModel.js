const mongoose = require("mongoose");

const notificationModel = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  notifications: {
    type: Map,
    of: String,
  },
});

const notification = mongoose.model("Notification", notificationModel);

module.exports = notification;
