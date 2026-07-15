const axios = require("axios");
const User = require("../models/User");

const DEFAULT_PLAN = "aesthetic";

const getPlanType = (selectedPlan) => selectedPlan || DEFAULT_PLAN;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const buildFallbackPlan = (user) => ({
  overview: {
    goal: user?.goal || "Fitness",
    duration: "90 Days",
    trainingDays: "6 Days/Week",
    targetWeight: user?.target_weight || ""
  },
  weeklyWorkout: [],
  diet: [],
  tips: []
});

const createPlan = async (req, res) => {
  try {
    const userId = req.userId;
    const { user, selectedPlan } = req.body;

    // 🔥 Check if plan already exists in DB
    if (userId) {
      const existingUser = await User.findById(userId);
      const planType = getPlanType(selectedPlan);

      if (
        existingUser?.plans?.[planType] &&
        Object.keys(existingUser.plans[planType]).length > 0
      ) {
        return res.json({
          plan: existingUser.plans[planType],
          source: "db"
        });
      }
    }

    const prompt = `
You are AURA, an elite AI fitness architect.

CRITICAL RULES:
- Return STRICT valid JSON.
- Do NOT truncate response.
- Ensure JSON is COMPLETE and CLOSED.
- No explanations.
- No markdown.
- No template text.
- Only JSON.

Return STRICTLY this format:

{
  "overview": {
    "goal": "",
    "duration": "90 Days",
    "trainingDays": "",
    "targetWeight": ""
  },
  "weeklyWorkout": [
    {
      "day": "Monday",
      "focus": "",
      "exercises": [
        { "name": "", "sets": "", "reps": "" }
      ]
    }
  ],
  "diet": [
    {
      "day": "Monday",
      "breakfast": "",
      "lunch": "",
      "dinner": "",
      "snacks": ""
    }
  ],
  "tips": [
    "",
    ""
  ]
}

User:
Name: ${user?.name || "Athlete"}
Weight: ${user?.weight || "80kg"}
Goal: ${user?.goal || "Muscle Gain"}
Protocol: ${selectedPlan}
`;

    let response;
    let retries = 3;

    while (retries > 0) {
      try {
        response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 4000
            }
          },
          {
            headers: { "Content-Type": "application/json" }
          }
        );
        break; // success
      } catch (err) {
        if (err.response && err.response.status === 429) {
          console.log(`⚠️ Gemini rate limited. Retries left: ${retries - 1}`);
          await sleep(4000);
          retries--;
        } else {
          throw err;
        }
      }
    }

    if (!response) {
      return res.status(500).json({
        error: "Gemini rate limited. Try again in 20 seconds."
      });
    }

    const aiText =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    console.log("AI TEXT LENGTH:", aiText.length);
    console.log("LAST 500 CHARS:", aiText.slice(-500));

    // clean and parse JSON (robust)
    let structured;
    try {
      let cleaned = aiText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      // 🔥 extract JSON safely using first { and last }
      const start = cleaned.indexOf("{");
      const end = cleaned.lastIndexOf("}");

      if (start === -1 || end === -1) {
        throw new Error("No JSON found");
      }

      let jsonString = cleaned.substring(start, end + 1);

      // 🔥 fix common JSON issues (trailing commas, invalid commas)
      jsonString = jsonString
        .replace(/,\s*}/g, "}")
        .replace(/,\s*]/g, "]");

      try {
        structured = JSON.parse(jsonString);
      } catch (e) {
        console.error("Parse Error:", e.message);
        console.error("Failed JSON:", jsonString);
        throw e;
      }

      console.log("Parsed AI Plan:", structured);
    } catch (err) {
      console.error("AI JSON parse failed:", aiText);

      return res.status(500).json({
        error: "AI plan generation failed",
        raw: aiText,
      });
    }

    // 🔥 Save plan properly inside plans + currentPlan
    if (userId) {
      const existingUser = await User.findById(userId);

      if (existingUser) {
        const planType = getPlanType(selectedPlan);
        console.log("Saving plan type:", planType);

        // ensure plans object exists
        existingUser.plans = existingUser.plans || {};

        // store plan
        existingUser.plans[planType] = structured;
        existingUser.selectedPlan = planType;
        existingUser.currentPlan = structured;

        // 🧠 Adaptive Plan Versioning
        if (!existingUser.planVersions) {
          existingUser.planVersions = [];
        }

        const currentGoal =
          existingUser?.onboarding?.goal ||
          user?.goal ||
          'Fitness';

        // First version ever
        if (existingUser.planVersions.length === 0) {
          existingUser.activeVersion = 1;

          existingUser.planVersions.push({
            version: 1,
            goal: currentGoal,
            protocol: planType,
            aiReason: 'Initial onboarding version generated by AURA.',
            status: 'active',
            plan: structured,
          });

          existingUser.markModified('planVersions');
        } else {
          const activePlan = existingUser.planVersions.find(
            (v) => v.version === existingUser.activeVersion
          );

          const needsNewVersion =
            !activePlan ||
            activePlan.goal !== currentGoal ||
            activePlan.protocol !== planType;

          if (needsNewVersion) {
            existingUser.planVersions.forEach((v) => {
              v.status = 'archived';
            });

            const nextVersion =
              Math.max(...existingUser.planVersions.map((v) => v.version), 0) + 1;

            existingUser.planVersions.push({
              version: nextVersion,
              goal: currentGoal,
              protocol: planType,
              aiReason: `Plan strategy changed to ${currentGoal} using ${planType}.`,
              status: 'active',
              plan: structured,
            });

            existingUser.activeVersion = nextVersion;
            existingUser.markModified('planVersions');
          }
        }

        // force mongoose to detect nested change
        existingUser.markModified("plans");

        await existingUser.save();

        console.log("Saved Plans:", existingUser.plans);
      }
    }

    return res.json({ plan: structured, raw: aiText });
  } catch (err) {
    console.error("AI controller error:", err.message);
    res.status(500).json({ error: "AI failed" });
  }
};

module.exports = { createPlan };