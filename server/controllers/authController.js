const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { getNextRank, getUserRank } = require("../utils/rank");

// ==============================
// 🟢 SIGNUP CONTROLLER
// ==============================
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // check if user exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "User already exists" });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create user
    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      msg: "Signup successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        selectedPlan: user.selectedPlan || null,
        points: user.points || 0,
        rank: getUserRank(user.points || 0),
        nextRank: getNextRank(user.points || 0)
      }
    });

  } catch (err) {
    console.log("Signup error:", err.message);
    res.status(500).json({ error: "Signup failed" });
  }
};

// ==============================
// 🔵 LOGIN CONTROLLER
// ==============================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    // check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      msg: "Login success",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        onboarding: user.onboarding || {},
        selectedPlan: user.selectedPlan || null,
        aiPlan: user.aiPlan || null,
        points: user.points || 0,
        rank: getUserRank(user.points || 0),
        nextRank: getNextRank(user.points || 0)
      }
    });

  } catch (err) {
    console.log("Login error:", err.message);
    res.status(500).json({ error: "Login failed" });
  }
};

module.exports = { signup, login };