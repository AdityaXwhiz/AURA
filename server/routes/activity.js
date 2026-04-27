
const auth = require("../middleware/auth");


const express = require("express");
const Activity = require("../models/Activity");

const router = express.Router();

// 📅 GET DAILY ACTIVITY
router.get("/daily", auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const data = await Activity.find({
      userId: req.userId,
      date: { $gte: today }
    }).populate("userId", "name");

    res.json(data);
  } catch (err) {
    console.error("Daily activity error:", err.message);
    res.status(500).json({ error: "Failed to fetch daily activity" });
  }
});

// 📆 GET WEEKLY ACTIVITY
router.get("/weekly", auth, async (req, res) => {
  try {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const data = await Activity.find({
      userId: req.userId,
      date: { $gte: weekAgo }
    }).populate("userId", "name");

    res.json(data);
  } catch (err) {
    console.error("Weekly activity error:", err.message);
    res.status(500).json({ error: "Failed to fetch weekly activity" });
  }
});

module.exports = router;