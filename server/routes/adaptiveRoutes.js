const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth");
const validateDailyCheckin = require("../middleware/adaptiveValidation");
const {
  submitDailyCheckin,
  getPlanVersions,
  activatePlanVersion,
  createPlanVersion,
  deletePlanVersion,
} = require("../controllers/adaptiveController");
const WorkoutHistory = require("../models/WorkoutHistory");
const User = require("../models/User");

// Submit today's adaptive check-in and generate an optimized workout.
router.post(
  "/checkin",
  authMiddleware,
  validateDailyCheckin,
  submitDailyCheckin
);

// Get today's optimized workout.
router.get("/today", authMiddleware, async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const workout = await WorkoutHistory.findOne({
      user: req.userId,
      date: today,
    }).lean();

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: "No optimized workout found for today.",
      });
    }

    return res.json({
      success: true,
      workout,
    });
  } catch (error) {
    console.error("Today's Workout Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch today's workout.",
    });
  }
});

// Get optimization history.
router.get("/history", authMiddleware, async (req, res) => {
  try {
    const history = await WorkoutHistory.find({
      user: req.userId,
    })
      .sort({ generatedAt: -1 })
      .lean();

    return res.json({
      success: true,
      history,
    });
  } catch (error) {
    console.error("Workout History Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch workout history.",
    });
  }
});

// Latest recovery snapshot.
router.get("/recovery", authMiddleware, async (req, res) => {
  try {
    const latest = await WorkoutHistory.findOne({
      user: req.userId,
    })
      .sort({ generatedAt: -1 })
      .lean();

    if (!latest) {
      return res.status(404).json({
        success: false,
        message: "Recovery data not found.",
      });
    }

    return res.json({
      success: true,
      recovery: latest.recovery,
      generatedAt: latest.generatedAt,
    });
  } catch (error) {
    console.error("Recovery API Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch recovery data.",
    });
  }
});

// Adaptive Center - Version History
router.get('/versions', authMiddleware, getPlanVersions);

// Adaptive Center - Activate Version
router.post('/activate/:version', authMiddleware, activatePlanVersion);

// Adaptive Center - Create Version
router.post('/create-version', authMiddleware, createPlanVersion);

// Adaptive Center - Delete Version
router.delete('/version/:version', authMiddleware, deletePlanVersion);

module.exports = router;
