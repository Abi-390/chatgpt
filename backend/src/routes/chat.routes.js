const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const chatController = require("../controllers/chat.controller");

const router = express.Router();

router.post("/", authMiddleware.authUser, chatController.createChat);
router.get("/:chatId", authMiddleware.authUser, chatController.getChat);
router.post(
  "/:chatId/message",
  authMiddleware.authUser,
  chatController.sendMessage,
);

module.exports = router;
