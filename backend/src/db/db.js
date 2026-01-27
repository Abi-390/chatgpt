const mongoose = require("mongoose");

async function connectToDb() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected to db");

  } catch (err) {

    console.log("Error connecting to db", err);

  }
}
 module.exports = connectToDb;