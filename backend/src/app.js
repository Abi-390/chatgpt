const express = require("express");
const cookieParser = require("cookie-parser");
const connectToDb = require("./db/db")

const app = express();
app.use(express.json());
app.use(cookieParser());

connectToDb();

module.exports = app;
