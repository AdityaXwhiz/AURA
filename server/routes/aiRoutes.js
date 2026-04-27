const express = require("express");
const router = express.Router();
const { createPlan } = require("../controllers/aiController");
const auth = require("../middleware/auth");

router.post("/plan", auth, createPlan);

// GET CURRENT PLAN
router.get("/plan", auth, async (req, res) => {
  try {
    const User = require("../models/User");

    const user = await User.findById(req.userId);

    if (!user || !user.currentPlan) {
      return res.status(404).json({ error: "No plan found" });
    }

    res.json(user.currentPlan);

  } catch (err) {
    console.error("Fetch plan error:", err.message);
    res.status(500).json({ error: "Failed to fetch plan" });
  }
});

module.exports = router;