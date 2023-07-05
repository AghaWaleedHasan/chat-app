const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

const {
  accessChatController,
  getAllChatsController,
  getNotificationsController,
  updateNotificationsController,
} = require("../controllers/chatController");

router.put("/notifications", authMiddleware, updateNotificationsController);
router.get("/notifications", authMiddleware, getNotificationsController);
router.get("/chats", authMiddleware, getAllChatsController);
router.post("/", authMiddleware, accessChatController);

module.exports = router;
