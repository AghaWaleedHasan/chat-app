const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

const {
  sendMessageController,
  getChatMessagesController,
} = require("../controllers/messageController");

router.post("/send", authMiddleware, sendMessageController);
router.get("/:chatId", authMiddleware, getChatMessagesController);

module.exports = router;
