const express = require("express");
const router = express.Router();

const { signup, login } = require("../controllers/authController");

// 🔐 SIGNUP ROUTE
router.post("/signup", signup);

// 🔐 LOGIN ROUTE
router.post("/login", login);

module.exports = router;
