const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

/*Routes*/
const authRoutes = require("./routes/auth.routes");
const chatRoutes = require("./routes/chat.routes");


const app = express();

/* middlewares */
// CORS Configuration
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(cookieParser());

/* using routes */
app.use("/api/auth",authRoutes);
app.use("/api/chat",chatRoutes)

module.exports = app;
