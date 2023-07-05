const Chat = require("../models/chatModel");
const User = require("../models/userModel");
const Notification = require("../models/notificationModel");

const updateNotificationsController = async (req, res) => {};

const getNotificationsController = async (req, res) => {
  try {
  } catch (error) {}
};

const getAllChatsController = async (req, res) => {
  try {
    var chats = await Chat.find({
      isGroupChat: false,
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("users", "-password")
      .populate("latestMessage");

    res.json({
      success: true,
      data: chats.sort(
        (a, b) => new Date(b["updatedAt"]) - new Date(a["updatedAt"])
      ),
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const accessChatController = async (req, res) => {
  const { userId } = req.body;

  //if chat exist, find chat
  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name email",
  });

  if (isChat.length > 0) {
    res.json({
      success: true,
      message: "chat gotten",
      data: isChat,
    });
  } else {
    //if chat does not exist, create chat
    const chat = await Chat.create({
      isGroupChat: false,
      users: [req.user._id, userId],
    });

    res.json({
      success: true,
      message: "chat created",
      data: chat,
    });
  }
};

module.exports = {
  getAllChatsController,
  accessChatController,
  getNotificationsController,
  updateNotificationsController,
};
