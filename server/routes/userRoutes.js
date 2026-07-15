console.log("USER ROUTES LOADED");
const express = require("express");
const Activity = require("../models/Activity");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

// GET DAILY ACTIVITY
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

// GET WEEKLY ACTIVITY
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

// GET USER RANK + XP
router.get("/rank", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      points: user.points || 0,
      level: user.level || 1
    });

  } catch (err) {
    console.error("Rank error:", err.message);
    res.status(500).json({ error: "Failed to fetch rank" });
  }
});

// GET USER PLAN
router.get("/plan", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.currentPlan) {
      return res.status(404).json({ error: "No plan found" });
    }

    res.json(user.currentPlan);

  } catch (err) {
    console.error("Plan fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch plan" });
  }
});

// GET USER PROFILE (FIX FOR DAILY GOALS)
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 🔥 Debug statements
    console.log("🔥 PROFILE ROUTE HIT");
    const hasValidPlan = !!(
      user.currentPlan &&
      user.currentPlan.weeklyWorkout &&
      Array.isArray(user.currentPlan.weeklyWorkout) &&
      user.currentPlan.weeklyWorkout.length > 0
    );

    console.log({
      onboardingCompleted: hasValidPlan,
      activeVersion: user.activeVersion || 1,
      hasCurrentPlan: !!user.currentPlan,
      selectedPlan: user.selectedPlan,
    });

    res.json({
      onboardingCompleted: hasValidPlan,
      activeVersion: user.activeVersion || 1,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        onboarding: user.onboarding || {}
      },
      currentPlan: user.currentPlan || null,
      plans: user.plans || {},
      selectedPlan: user.selectedPlan || "aesthetic",
      points: user.points || 0,
      level: user.level || 1,
      taskLedger: user.taskLedger || [],
      objectiveLedger: user.objectiveLedger || []
    });

  } catch (err) {
    console.error("Profile error:", err.message);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

/*
  COMPLETE TASK (FIX FOR DAILY GOALS)
*/
router.post("/task-complete", auth, async (req, res) => {
  try {
    const { day, category, task } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // normalize
    const dayKey = String(day || "").toLowerCase().trim();
    const taskKey = `${category}|${task}`.toLowerCase().trim();

    if (!user.taskLedger) user.taskLedger = [];

    // check if already exists
    const exists = user.taskLedger.find(
      (t) => t.day === dayKey && t.task === taskKey
    );

    if (!exists) {
      user.taskLedger.push({
        day: dayKey,
        task: taskKey,
        completedAt: new Date()
      });

      // give XP
      user.points = (user.points || 0) + 15;
    }

    await user.save();

    res.json({
      success: true,
      taskLedger: user.taskLedger,
      points: user.points
    });

  } catch (err) {
    console.error("Task complete error:", err.message);
    res.status(500).json({ error: "Failed to complete task" });
  }
});

// SAVE ONBOARDING DATA (FIX FOR ONBOARDING ERROR)
router.post("/onboarding", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const {
      age,
      weight,
      height,
      goal,
      diet,
      experience,
      target_weight,
      commitment,
      daily_role,
      train_time,
      train_access,
    } = req.body;

    user.onboarding = {
      age,
      weight,
      height,
      goal,
      diet,
      experience,
      target_weight,
      commitment,
      daily_role,
      train_time,
      train_access,
    };

    await user.save();

    res.json({
      success: true,
      onboarding: user.onboarding,
    });

  } catch (err) {
    console.error("Onboarding save error:", err.message);
    res.status(500).json({ error: "Failed to save onboarding" });
  }
});

module.exports = router;
