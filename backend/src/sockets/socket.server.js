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

    /* const message = await messageModel.create({
        chat: messagePayload.chat,
        user: socket.user._id,
        content: messagePayload.content,
        role: "user",
      });

      const vectors = await aiService.generateVector(messagePayload.content);*/

      const [message,vectors] = await Promise.all([
        messageModel.create({
        chat: messagePayload.chat,
        user: socket.user._id,
        content: messagePayload.content,
        role: "user",
      }),

      aiService.generateVector(messagePayload.content)

      ])

      /*const memory = await queryMemory({
        queryVector: vectors[0].values,
        limit: 3,
        metadata: {
         
        },
      }); */

      const [memory,chatHistory] = await Promise.all([
         queryMemory({
        queryVector: vectors[0].values,
        limit: 3,
        metadata: {
         user:socket.user._id
        },
      }),

      messageModel
        .find({
          chat: messagePayload.chat,
        })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean()

      ])

      await createMemory({
        vectors,
        messageId: uuidv4(),
        metadata: {
          chat: messagePayload.chat.toString(),
          user: socket.user._id.toString(),
          text: messagePayload.content,
        },
      });

      console.log(memory);

      /*const chatHistory = await messageModel
        .find({
          chat: messagePayload.chat,
        })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();*/

      const stm = chatHistory.reverse().map((item) => {
        return {
          role: item.role,
          parts: [{ text: item.content }],
        };
      });

      const ltm = [
        {
          role: "user",
          parts: [
            {
              text: `You are an AI assistant with access to long-term memory.
                        The following messages are IMPORTANT past conversation context.
                        You MUST use them when relevant.

                            Past conversation memory:
                ${memory.map(item => item.metadata.text).join("\n")}`,
            },
          ],
        },
      ];

      console.log(ltm[0]);
      console.log(stm);

      const response = await aiService.generateResponse([...ltm, ...stm]);
      console.log("AI response:", response);

     /*const responseMessage = await messageModel.create({
        chat: messagePayload.chat,
        user: socket.user._id,
        content: response,
        role: "model",
      });*/

     /* const responseVectors = await aiService.generateVector(response);*/

     const [responseMessage,responseVectors] = await Promise.all([
        messageModel.create({
        chat: messagePayload.chat,
        user: socket.user._id,
        content: response,
        role: "model",
      }),
        await aiService.generateVector(response)
     ])

      await createMemory({
        vectors: responseVectors,
        messageId: uuidv4(),
        metadata: {
          chat: messagePayload.chat.toString,
          user: socket.user._id.toString(),
          text: response,
        },
      });

      socket.emit("ai-response", {
        content: response,
        chat: messagePayload.chat,
      });
    });
  });
}

module.exports = initSocketServer;
