const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

/*Routes*/
const authRoutes = require("./routes/auth.routes");
const chatRoutes = require("./routes/chat.routes");

const app = express();

/* middlewares */
// CORS Configuration
app.use(
  cors({
    origin: "https://laughableai.vercel.app",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use(cookieParser());

/* Health check endpoint */
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Backend is running",
    timestamp: new Date().toISOString(),
  });
});

/* using routes */
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

module.exports = app;
