const Message = require("../models/messageModel");
const Chat = require("../models/chatModel");
const mongoose = require("mongoose");

const sendMessageController = async (req, res) => {
  const { text, chatId } = req.body;

  try {
    var message = await Message.create({
      text: text,
      chat: chatId,
      sender: req.user,
    });
    await Chat.updateOne({ _id: chatId }, { latestMessage: message });
    res.status(200).json({
      success: true,
      data: await message.populate("chat", "users"),
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getChatMessagesController = async (req, res) => {
  const { chatId } = req.params;

  try {
    // const messages = await Message.find({
    //   chat: { $eq: chatId },
    // }).populate("sender", "email name");
    let idToSearch = new mongoose.Types.ObjectId(chatId);
    const messages = await Message.aggregate([
      { $match: { chat: idToSearch } },
      {
        $lookup: {
          from: "users",
          localField: "sender",
          foreignField: "_id",
          as: "sender",
        },
      },
      {
        $unwind: "$sender",
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          messages: { $push: "$$ROOT" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { getChatMessagesController, sendMessageController };
