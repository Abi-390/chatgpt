const chatModel = require("../models/chat.model");
const messageModel = require("../models/message.model");
const { generateResponse } = require("../services/ai.service");
const { createMemory, queryMemory } = require("../services/vector.service");
const { generateVector } = require("../services/ai.service");

// Track in-flight requests per chat to prevent duplicate API calls
const inFlightRequests = new Map();

async function createChat(req, res) {
  const { title } = req.body;

  const chat = await chatModel.create({
    user: req.user,
    title,
  });

  res.status(201).json({
    message: "Chat created successfully",
    chat: {
      _id: chat._id,
      title: chat.title,
      lastActivity: chat.lastActivity,
      user: chat.user,
    },
  });
}

async function sendMessage(req, res) {
  const { chatId } = req.params;

  try {
    const { message } = req.body;

    // Prevent duplicate requests for the same chat
    if (inFlightRequests.has(chatId)) {
      console.warn(
        `⚠️ Duplicate request detected for chat ${chatId}. Rejecting.`,
      );
      return res.status(429).json({
        error: "Request already in progress",
        message: "Please wait for your previous message to finish processing.",
        retryAfter: 5,
      });
    }

    // Mark this chat as having an in-flight request
    inFlightRequests.set(chatId, true);

    console.log("📨 Received message:", message);
    console.log("💬 Chat ID:", chatId);
    console.log("👤 User:", req.user);

    // Validate input
    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message cannot be empty" });
    }

    if (!chatId) {
      return res.status(400).json({ error: "Chat ID is required" });
    }

    // Save user message to database
    const userMsg = await messageModel.create({
      chat: chatId,
      user: req.user,
      content: message,
      role: "user",
    });

    console.log("✅ User message saved:", userMsg._id);

    // 🧠 RAG: Retrieve conversation history for context
    console.log("🧠 Retrieving conversation history for context...");
    let conversationHistory = [];

    try {
      // Get ALL messages from this chat to provide full context
      const allMessages = await messageModel
        .find({ chat: chatId })
        .sort({ createdAt: 1 })
        .limit(8); // Reduced from 20 → prevents Gemini token overload

      console.log(
        `📚 Found ${allMessages.length} previous messages in chat history`,
      );

      // Filter out the current message (which was just created)
      conversationHistory = allMessages.filter(
        (msg) => msg._id.toString() !== userMsg._id.toString(),
      );

      console.log(`💭 Using ${conversationHistory.length} messages as context`);

      // Vector search disabled - generateVector() calls waste Gemini API quota
      // Each call to generateVector() = 1 Gemini API call consumed
      // RAG still works via conversation history passed to generateResponse()
      // TODO: Re-enable when using separate embedding service (Hugging Face, etc.)
      /*
      if (conversationHistory.length > 0) {
        console.log("🔍 Generating vector embedding for semantic search...");
        try {
          const messageVector = await generateVector(message);
          const relevantMessages = await queryMemory({
            queryVector: messageVector,
            limit: 3,
            metadata: { chat: chatId },
          });

          if (relevantMessages && relevantMessages.length > 0) {
            console.log(
              `✨ Found ${relevantMessages.length} semantically similar messages`,
            );
          }
        } catch (vectorError) {
          console.warn(
            "⚠️ Vector search failed (non-critical):",
            vectorError.message,
          );
          // Continue without vector search - conversation history is still available
        }
      }
      */
    } catch (historyError) {
      console.warn(
        "⚠️ Error retrieving conversation history:",
        historyError.message,
      );
      // Continue without history - will still generate response
    }

    // Generate AI response WITH conversation context
    console.log("🤖 Generating AI response with context...");
    let aiResponse;

    try {
      // Small delay helps stabilize free-tier API limits
      await new Promise((resolve) => setTimeout(resolve, 800));

      aiResponse = await generateResponse(message, conversationHistory);
    } catch (apiError) {
      console.error("❌ Google API Error:", apiError);

      // Handle specific API errors
      if (
        apiError.status === 429 ||
        apiError.message?.toLowerCase().includes("quota") ||
        apiError.message?.toLowerCase().includes("rate")
      ) {
        return res.status(429).json({
          error: "Rate limit exceeded",
          message:
            "I'm getting too many requests right now! 😅 Please wait a moment and try again. The free tier Google API is a bit stingy with its quotas. Try again in a few seconds!",
          retryAfter: 60,
        });
      }

      if (apiError.message && apiError.message.includes("401")) {
        return res.status(401).json({
          error: "Authentication failed",
          message:
            "Oops! My API key might be invalid or expired. 🔑 Please check the backend configuration.",
        });
      }

      // Re-throw other errors
      throw apiError;
    }

    // Fallback response if Gemini fails silently
    if (!aiResponse) {
      aiResponse =
        "Oops 😅 my comedy engine crashed for a second. Try sending that again!";
    }

    console.log("✅ AI response generated:", aiResponse);

    // Save AI response to database
    const aiMsg = await messageModel.create({
      chat: chatId,
      content: aiResponse,
      role: "model",
    });

    console.log("✅ AI message saved:", aiMsg._id);

    // Vector storage disabled - each generateVector() call wastes Gemini API quota
    // TODO: Re-enable when using separate embedding service
    /*
    try {
      const userMsgVector = await generateVector(message);
      await createMemory({
        vectors: userMsgVector,
        metadata: {
          chat: chatId,
          userId: req.user,
          role: "user",
          messageId: userMsg._id.toString(),
        },
        messageId: userMsg._id,
      });
      console.log("✅ User message stored in vector database");
    } catch (vectorStoreError) {
      console.warn(
        "⚠️ Failed to store in vector database:",
        vectorStoreError.message,
      );
      // Non-critical, continue anyway
    }
    */

    res.status(200).json({
      success: true,
      message: "Message processed successfully",
      reply: aiResponse,
      userMessage: userMsg,
      aiMessage: aiMsg,
      contextUsed: conversationHistory.length > 0,
    });
  } catch (error) {
    console.error("❌ Error in sendMessage:", error.message);
    console.error("Stack:", error.stack);

    if (
      error.status === 429 ||
      error.message?.toLowerCase().includes("rate") ||
      error.message?.toLowerCase().includes("quota")
    ) {
      return res.status(429).json({
        error: "Rate limit exceeded",
        message:
          "I'm getting too many requests! 😅 Please wait a moment and try again.",
        retryAfter: 60,
      });
    }

    res.status(500).json({
      error: error.message || "Unknown error occurred",
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  } finally {
    // Always clear in-flight lock
    inFlightRequests.delete(chatId);
  }
}

// Get chat with all messages
async function getChat(req, res) {
  try {
    const { chatId } = req.params;

    console.log("📖 Retrieving chat:", chatId);

    // Get chat details
    const chat = await chatModel.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    // Get all messages in the chat
    const messages = await messageModel
      .find({ chat: chatId })
      .sort({ createdAt: 1 });

    console.log(`✅ Retrieved chat with ${messages.length} messages`);

    res.status(200).json({
      success: true,
      chat: {
        _id: chat._id,
        title: chat.title,
        user: chat.user,
        createdAt: chat.createdAt,
        lastActivity: chat.lastActivity,
      },
      messages,
      messageCount: messages.length,
    });
  } catch (error) {
    console.error("❌ Error in getChat:", error.message);
    res.status(500).json({
      error: error.message,
      details: error.stack,
    });
  }
}

module.exports = { createChat, sendMessage, getChat };