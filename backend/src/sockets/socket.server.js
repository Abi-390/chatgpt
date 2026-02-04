const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const aiService = require("../services/ai.service");
const messageModel = require("../models/message.model");
const { createMemory, queryMemory } = require("../services/vector.service");
const { v4: uuidv4 } = require("uuid");

function initSocketServer(httpServer) {
  const io = new Server(httpServer, {});

  io.use(async (socket, next) => {
    const cookies = cookie.parse(socket.handshake.headers?.cookie || "");

    if (!cookies.token) {
      next(new Error("Authentication error:No token provided"));
    }

    try {
      const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET);

      const user = await userModel.findById(decoded.id);

      socket.user = user;

      next();
    } catch (error) {
      next(new Error("Authentication error:Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log("New socket connection:", socket.id);

    // Socket.IO handler disabled to prevent duplicate API calls
    // The REST API endpoint (/api/chat/:chatId/message) is the primary method for sending messages
    // Using both REST and Socket.IO was causing the Google Gemini API rate limit to be hit twice as fast

    socket.on("ai-message", async (messagePayload) => {
      console.log(
        "⚠️ Socket.IO ai-message handler is disabled. Use REST API instead.",
      );
      socket.emit("ai-response", {
        error:
          "Socket.IO messaging is disabled. Please use the REST API endpoint.",
      });
    });
  });
}

module.exports = initSocketServer;
