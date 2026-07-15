const DailyCheckin = require("../models/DailyCheckin");
const WorkoutHistory = require("../models/WorkoutHistory");
const User = require("../models/User");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const { calculateRecovery } = require("../services/recoveryService");
const { generateConstraints } = require("../services/constraintService");
const { optimizeWorkout } = require("../services/adaptiveGeminiService");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const versionModel = genAI.getGenerativeModel({
  model: "gemini-flash-latest",
});

const submitDailyCheckin = async (req, res) => {
  try {
    const userId = req.userId;
    const today = new Date().toISOString().split("T")[0];

    const alreadyExists = await DailyCheckin.findOne({
      user: userId,
      date: today,
    });

    if (alreadyExists) {
      return res.status(409).json({
        success: false,
        message: "Today's check-in has already been submitted.",
      });
    }

    const checkin = await DailyCheckin.create({
      user: userId,
      date: today,
      ...req.body,
    });

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (!user.currentPlan || Object.keys(user.currentPlan).length === 0) {
      if (user.planVersions && user.planVersions.length > 0) {
        const activeVersion =
          user.planVersions.find(
            (v) => v.version === user.activeVersion
          ) || user.planVersions.find((v) => v.status === "active");

        if (activeVersion?.plan) {
          user.currentPlan = activeVersion.plan;
          await user.save();
        }
      }
    }

    if (!user.currentPlan || Object.keys(user.currentPlan).length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Your fitness plan is still being prepared. Please refresh and try again.",
      });
    }

    const previousWorkout = await WorkoutHistory.findOne({
      user: userId,
    })
      .sort({ createdAt: -1 })
      .lean();

    const latestWorkout = previousWorkout || {
      workout: {},
      recovery: {},
      constraints: {},
      reason: [],
    };

    const recovery = calculateRecovery(checkin);

    const constraints = generateConstraints(
      checkin,
      recovery,
      latestWorkout,
      user
    );
    console.log("=====================================");
console.log("Calling Gemini Optimizer...");
console.log("Recovery:", recovery);
console.log("Constraints:", constraints);
console.log("User Plan Exists:", !!user.currentPlan);
console.log("=====================================");
    const aiResult = await optimizeWorkout({
      user,
      currentPlan: user.currentPlan,
      checkin,
      recovery,
      constraints,
      previousWorkout: latestWorkout,
    });
    console.log("Gemini Response:");
    console.dir(aiResult, { depth: null });

    await WorkoutHistory.create({
      user: userId,
      date: today,
      version: 1,
      originalWorkout: aiResult.originalWorkout,
      optimizedWorkout: aiResult.optimizedWorkout,
      changes: aiResult.changes,
      reason: aiResult.reason,
      recovery,
      constraints,
      generatedAt: aiResult.generatedAt,
    });

    return res.status(201).json({
      success: true,
      message: "Today's workout optimized successfully.",
      recovery,
      constraints,
      originalWorkout: aiResult.originalWorkout,
      optimizedWorkout: aiResult.optimizedWorkout,
      changes: aiResult.changes,
      reason: aiResult.reason,
      generatedAt: aiResult.generatedAt,
    });
  } catch (error) {
    console.error("══════════════════════════════════════");
console.error("Adaptive Check-in Error");
console.error("Message:", error.message);
console.error("Stack:");
console.error(error.stack);
console.error("Full Error:", error);
console.error("══════════════════════════════════════");

return res.status(500).json({
  success: false,
  message: "Unable to optimize today's workout.",
  error: error.message,
});
  }
};

const getPlanVersions = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Legacy user migration
    if (
      (!user.planVersions || user.planVersions.length === 0) &&
      user.currentPlan &&
      Object.keys(user.currentPlan || {}).length > 0
    ) {
      user.planVersions = [
        {
          version: 1,
          goal: user.selectedPlan || 'Fitness',
          protocol: user.selectedPlan || 'Aesthetic',
          aiReason: 'Migrated from legacy AURA plan.',
          status: 'active',
          plan: user.currentPlan,
        },
      ];

      user.activeVersion = 1;

      user.markModified('planVersions');

      await user.save();
    }

    console.log('VERSIONS:', user.planVersions);

    return res.json({
      success: true,
      activeVersion: user.activeVersion || 1,
      versions: user.planVersions || [],
    });
  } catch (error) {
    console.error('Get Versions Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to fetch versions.',
    });
  }
};

const activatePlanVersion = async (req, res) => {
  try {
    const versionNumber = Number(req.params.version);

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const selectedVersion = (user.planVersions || []).find(
      (v) => v.version === versionNumber
    );

    if (!selectedVersion) {
      return res.status(404).json({
        success: false,
        message: 'Version not found',
      });
    }

    user.planVersions.forEach((v) => {
      v.status = v.version === versionNumber ? 'active' : 'archived';
    });

    user.activeVersion = versionNumber;
    user.currentPlan = selectedVersion.plan;

    user.markModified('planVersions');
    await user.save();

    return res.json({
      success: true,
      activeVersion: versionNumber,
      message: `Version ${versionNumber} activated successfully.`,
    });
  } catch (error) {
    console.error('Activate Version Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to activate version.',
    });
  }
};

const createPlanVersion = async (req, res) => {
  try {
    const { goal } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const nextVersion =
      Math.max(...(user.planVersions || []).map((v) => v.version), 0) + 1;

    const onboarding = user.onboarding || {};

    const prompt = `
You are AURA AI.

Create a NEW fitness transformation plan.

User Profile:

Age: ${onboarding.age}
Weight: ${onboarding.weight}
Height: ${onboarding.height}
Diet: ${onboarding.diet}
Experience: ${onboarding.experience}
Target Weight: ${onboarding.target_weight}
Training Frequency: ${onboarding.commitment}
Lifestyle: ${onboarding.daily_role}
Training Time: ${onboarding.train_time}
Training Access: ${onboarding.train_access}

NEW GOAL:
${goal}

Return ONLY valid JSON in this structure:

{
  "overview": {},
  "weeklyWorkout": [],
  "diet": [],
  "tips": []
}
`;
    console.log('Generating version with Gemini...');
    console.log('Goal:', goal);
    console.log('Using Gemini model: gemini-flash-latest');

    const result = await versionModel.generateContent(prompt);

    const aiText = result.response.text().trim();

    let structured;

    try {
      structured = JSON.parse(aiText);
    } catch {
      const cleaned = aiText
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      structured = JSON.parse(cleaned);
    }

    const newVersion = {
      version: nextVersion,
      goal,
      protocol: user.selectedPlan || 'aesthetic',
      aiReason: `AI generated a new ${goal} strategy.`,
      status: 'active',
      plan: structured,
    };

    user.planVersions.forEach((v) => {
      v.status = 'archived';
    });

    user.planVersions.push(newVersion);

    user.activeVersion = nextVersion;
    user.currentPlan = structured;

    user.markModified('planVersions');

    await user.save();

    return res.json({
      success: true,
      version: newVersion,
    });
  } catch (error) {
    console.error('Create Version Error');
    console.error('Message:', error.message);
    console.error('Gemini Response:', error.response?.data);

    return res.status(500).json({
      success: false,
      message: 'Unable to create version',
    });
  }
};
const deletePlanVersion = async (req, res) => {
  try {
    const versionNumber = Number(req.params.version);

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.activeVersion === versionNumber) {
      return res.status(400).json({
        success: false,
        message: 'Active version cannot be deleted',
      });
    }

    const exists = (user.planVersions || []).some(
      (v) => v.version === versionNumber
    );

    if (!exists) {
      return res.status(404).json({
        success: false,
        message: 'Version not found',
      });
    }

    user.planVersions = (user.planVersions || []).filter(
      (v) => v.version !== versionNumber
    );

    user.markModified('planVersions');

    await user.save();

    return res.json({
      success: true,
      message: `Version ${versionNumber} deleted successfully.`,
    });
  } catch (error) {
    console.error('Delete Version Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to delete version.',
    });
  }
};

module.exports = {
  submitDailyCheckin,
  getPlanVersions,
  activatePlanVersion,
  createPlanVersion,
  deletePlanVersion,
};