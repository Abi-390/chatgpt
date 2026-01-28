const chatModel = require("../models/chat.model");

async function createChat(req, res) {
  const { title } = req.body;

  const chat = await chatModel.create({
    user: req.user,
    title,
  });

  res.status(201).json({
    message:"Chat created successfully", chat:{
        _id : chat._id,
        title : chat.title,
        lastActivity : chat.lastActivity,
        user:chat.user
    }
  })
}

module.exports = {createChat};