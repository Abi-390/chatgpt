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

    socket.on("ai-message", async (messagePayload) => {
      console.log("Payload message sent to  AI :", messagePayload);

      await messageModel.create({
        chat: messagePayload.chat,
        user: socket.user._id,
        content: messagePayload.content,
        role: "user",
      });

      const vectors = await aiService.generateVector(messagePayload.content);

      await createMemory({
        vectors,
        messageId: uuidv4(),
        metadata: {
          chat: messagePayload.chat,
          user: socket.user._id,
        },
      });

      const chatHistory = await messageModel
        .find({
          chat: messagePayload.chat,
        })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

      const response = await aiService.generateResponse(
        chatHistory.map((item) => {
          return {
            role: item.role,
            parts: [{ text: item.content }],
          };
        }),
      );
      console.log("AI response:", response);

      await messageModel.create({
        chat: messagePayload.chat,
        user: socket.user._id,
        content: response,
        role: "model",
      });

      const responseVectors = await aiService.generateVector(response);

      await createMemory({
        vectors : responseVectors,
        messageId : uuidv4(),
         metadata: {
          chat: messagePayload.chat,
          user: socket.user._id,
        },

      })

      socket.emit("ai-response", {
        content: response,
        chat: messagePayload.chat,
      });
    });
  });
}

module.exports = initSocketServer;
