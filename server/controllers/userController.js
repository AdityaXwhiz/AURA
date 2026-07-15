const getUserProfile = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const hasReset = checkWeeklyReset(user);
    if (hasReset) await user.save();

    console.log("DB USER ONBOARDING:", user.onboarding);
    console.log("DB USER CURRENT PLAN:", !!user.currentPlan);
    console.log("DB USER ID:", user._id.toString());

    return res.json({
      onboardingCompleted: !!user.currentPlan,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        onboarding: user.onboarding || {},
      },
      currentPlan: user.currentPlan || null,
      plans: user.plans || {},
      selectedPlan: user.selectedPlan || "aesthetic",
      ...buildRankPayload(user),
      taskLedger: user.taskLedger || [],
      objectiveLedger: user.objectiveLedger || [],
    });
  } catch (err) {
    console.log("Profile error:", err.message);
    return res.status(500).json({ error: "Failed to load profile" });
  }
};
const User = require("../models/User");
const { getNextRank, getUserRank } = require("../utils/rank");
const buildRankPayload = (user) => ({
  points: user.points || 0,
  rank: getUserRank(user.points || 0),
  nextRank: getNextRank(user.points || 0),
});

// 🗓️ WEEK IDENTIFIER (ISO-like simple week index)
const getWeekId = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now - start;
  const week = Math.ceil(diff / (7 * 24 * 60 * 60 * 1000));
  return `${now.getFullYear()}-W${week}`;
};

/**
 * 🔄 WEEKLY RESET LOGIC
 * Clears completion ledgers if a new week has started.
 * A week starts on Monday 00:00.
 */
const checkWeeklyReset = (user) => {
  if (!user) return false;

  const now = new Date();
  const lastReset = new Date(user.lastWeeklyReset || user.createdAt);

  // Calculate start of CURRENT week (Monday 00:00)
  const startOfCurrentWeek = new Date(now);
  const day = startOfCurrentWeek.getDay();
  // getDay(): 0 is Sunday, 1 is Monday...
  // If today is Sunday(0), we go back 6 days to get previous Monday.
  // If today is Monday(1), we stay here.
  const diff = startOfCurrentWeek.getDate() - (day === 0 ? 6 : day - 1);
  startOfCurrentWeek.setDate(diff);
  startOfCurrentWeek.setHours(0, 0, 0, 0);

  // If last reset was BEFORE the start of this week, reset ledgers.
  if (lastReset < startOfCurrentWeek) {
    user.objectiveLedger = [];
    user.taskLedger = [];
    user.dailyBonusLedger = [];
    user.lastWeeklyReset = now;
    return true;
  }
  return false;
};

const saveOnboarding = async (req, res) => {
  try {
    const userId = req.userId;
    const { onboarding } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.onboarding = onboarding;
    checkWeeklyReset(user);
    await user.save();

    return res.json({ msg: "Onboarding saved", user });
  } catch (err) {
    console.log("Onboarding save error:", err.message);
    return res.status(500).json({ error: "Failed to save onboarding" });
  }
};

const getUserPlan = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const hasReset = checkWeeklyReset(user);
    if (hasReset) await user.save();

    return res.json({
      currentPlan: user.currentPlan,
      plans: user.plans,
      selectedPlan: user.selectedPlan || null,
      ...buildRankPayload(user),
      objectiveLedger: user.objectiveLedger || [],
      taskLedger: user.taskLedger || [],
    });
  } catch (err) {
    console.log("Fetch plan error:", err.message);
    return res.status(500).json({ error: "Failed to fetch plan" });
  }
};

const getUserRankProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const hasReset = checkWeeklyReset(user);
    if (hasReset) await user.save();

    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        selectedPlan: user.selectedPlan || "aesthetic",
      },
      ...buildRankPayload(user),
      objectiveLedger: user.objectiveLedger || [],
      taskLedger: user.taskLedger || [],
      dailyBonusLedger: user.dailyBonusLedger || [],
    });
  } catch (err) {
    console.log("Rank profile error:", err.message);
    return res.status(500).json({ error: "Failed to load rank profile" });
  }
};

const markObjectiveComplete = async (req, res) => {
  try {
    const userId = req.userId;
    const { day, objective, totalObjectives = 0, planType = "aesthetic" } = req.body;

    if (!day || !objective) {
      return res.status(400).json({ error: "day and objective are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const hasReset = checkWeeklyReset(user);
    if (hasReset) {
      await user.save();
    }

    const weekId = getWeekId();
    const objectiveKey = `${weekId}|${planType}|${day}|objective|${objective}`.toLowerCase();
    const dayKey = `${weekId}|${planType}|${day}`.toLowerCase();

    let pointsAdded = 0;
    const alreadyCompleted = user.objectiveLedger.includes(objectiveKey);

    if (!alreadyCompleted) {
      user.objectiveLedger.push(objectiveKey);
      pointsAdded += 15; // Standard XP
    }

    // Daily Bonus logic (if all tasks for the day are done)
    const dayCompletedCount = user.objectiveLedger.filter((key) => key.startsWith(`${dayKey}|`)).length;
    const qualifiesForBonus = Number(totalObjectives) > 0 && dayCompletedCount >= Number(totalObjectives);

    if (qualifiesForBonus && !user.dailyBonusLedger.includes(dayKey)) {
      user.dailyBonusLedger.push(dayKey);
      pointsAdded += 30; // Significant bonus for completing a whole day
    }

    if (pointsAdded > 0) {
      user.points = (user.points || 0) + pointsAdded;
    }

    await user.save();

    return res.json({
      msg: "Objective processed",
      pointsAdded,
      ...buildRankPayload(user),
      objectiveLedger: user.objectiveLedger || [],
      dailyBonusLedger: user.dailyBonusLedger || [],
      alreadyCompleted,
    });
  } catch (err) {
    console.log("Objective scoring error:", err.message);
    return res.status(500).json({ error: "Failed to score objective" });
  }
};

const markTaskComplete = async (req, res) => {
  try {
    const userId = req.userId;
    const { day, task, category = "objective", planType = "aesthetic" } = req.body;

    const safeCategory = String(category || "objective").toLowerCase();

    if (!day || !task) {
      return res.status(400).json({ error: "day and task are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const hasReset = checkWeeklyReset(user);
    if (hasReset) {
      await user.save();
    }

    const weekId = getWeekId();
    const taskKey = `${weekId}|${planType}|${day}|${safeCategory}|${task}`.toLowerCase();
    const alreadyCompleted = user.taskLedger.includes(taskKey);
    let pointsAdded = 0;

    if (!alreadyCompleted) {
      user.taskLedger.push(taskKey);
      pointsAdded = 15; // Match frontend XP_PER_TASK
      user.points = (user.points || 0) + pointsAdded;
    }

    // Always persist changes (including weekly reset side-effects)
    await user.save();

    return res.json({
      msg: "Task checkpoint processed",
      alreadyCompleted,
      pointsAdded,
      ...buildRankPayload(user),
      taskLedger: user.taskLedger || [],
    });
  } catch (err) {
    console.log("Task checkpoint error:", err.message);
    return res.status(500).json({ error: "Failed to score task checkpoint" });
  }
};

module.exports = {
  saveOnboarding,
  getUserPlan,
  getUserRankProfile,
  getUserProfile, // ✅ added
  markObjectiveComplete,
  markTaskComplete,
};
