const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");

async function authUser(req, res, next) {
  // Try to get token from Authorization header first, then from cookies
  let token = null;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7); // Remove "Bearer " prefix
  } else {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel.findById(decoded.id);

    req.user = user;

    next();
  } catch (error) {
    res.status(401).json({
      message: "Unauthorized token",
    });
  }
}

module.exports = { authUser };
