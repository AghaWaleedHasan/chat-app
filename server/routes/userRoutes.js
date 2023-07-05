const express = require("express");
const {
  userRegisterController,
  userLoginController,
  userSearchController,
} = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/signup", userRegisterController);
router.post("/login", userLoginController);
router.get("/users", authMiddleware, userSearchController);

module.exports = router;
