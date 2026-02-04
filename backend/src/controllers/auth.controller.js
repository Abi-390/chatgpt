const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

async function registerUser(req, res) {
  try {
    const {
      fullName: { firstName, lastName },
      email,
      password,
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const isUserAlreadyExist = await userModel.findOne({ email });

    if (isUserAlreadyExist) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      fullName: { firstName, lastName },
      email,
      password: hashedPassword,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.cookie("token", token);

    res.status(201).json({
      message: "User registered successfully",
      token: token,
      user: {
        email: user.email,
        _id: user._id,
        fullName: user.fullName,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      message: "Error registering user",
      error: error.message,
    });
  }
}

async function loginUser(req, res) {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email });

  if (!user) {
    return res.status(401).json({
      message: "Invalid user or password",
    });
  }
  const isPasswordvalid = await bcrypt.compare(password, user.password);

  if (!isPasswordvalid) {
    return res.status(401).json({
      message: "Invalid Password",
    });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

  res.cookie("token", token);

  res.status(200).json({
    message: "Login successfull",
    token: token,
    user: {
      email: user.email,
      _id: user._id,
      fullName: user.fullName,
    },
  });
}

module.exports = { registerUser, loginUser };
