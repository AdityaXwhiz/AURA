const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { getNextRank, getUserRank } = require("../utils/rank");

// ==============================
// Helpers
// ==============================
const createUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  onboarding: user.onboarding || {},
  selectedPlan: user.selectedPlan || null,
  aiPlan: user.aiPlan || null,
  points: user.points || 0,
  rank: getUserRank(user.points || 0),
  nextRank: getNextRank(user.points || 0),
});

const normalizeCredentials = ({ name, email, password }) => ({
  name: typeof name === "string" ? name.trim() : name,
  email: typeof email === "string" ? email.trim().toLowerCase() : email,
  password,
});

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

// ==============================
// SIGNUP
// ==============================
const signup = async (req, res) => {
  try {
    let { name, email, password } = normalizeCredentials(req.body);

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "All fields are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: "Signup successful",
      token,
      user: createUserResponse(user),
    });
  } catch (err) {
    console.error("Signup Error:", err.stack || err);

    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

// ==============================
// LOGIN
// ==============================
const login = async (req, res) => {
  try {
    let { email, password } = normalizeCredentials(req.body);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    const token = generateToken(user._id);

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: createUserResponse(user),
    });
  } catch (err) {
    console.error("Login Error:", err.stack || err);

    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

module.exports = {
  signup,
  login,
};