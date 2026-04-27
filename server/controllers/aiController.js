const axios = require("axios");
const User = require("../models/User");

const createPlan = async (req, res) => {
  try {
    const userId = req.userId;
    const { user, selectedPlan } = req.body;

    // 🔥 Check if plan already exists in DB
    if (userId) {
      const existingUser = await User.findById(userId);
      const planType = selectedPlan || "aesthetic";

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
          `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2500
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
          await new Promise(r => setTimeout(r, 4000));
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
        console.log("First parse failed, retrying with relaxed fix...");
        
        // fallback: remove unexpected characters
        const safeString = jsonString.replace(/[\u0000-\u0019]+/g, "");
        structured = JSON.parse(safeString);
      }

      console.log("Parsed AI Plan:", structured);
    } catch (err) {
      console.log("AI JSON parse failed:", aiText);

      // 🔥 fallback minimal structure to avoid crashing frontend
      structured = {
        overview: {
          goal: user?.goal || "Fitness",
          duration: "90 Days",
          trainingDays: "6 Days/Week",
          targetWeight: user?.target_weight || ""
        },
        weeklyWorkout: [],
        diet: [],
        tips: []
      };
    }

    // 🔥 Save plan properly inside plans + currentPlan
    if (userId) {
      const existingUser = await User.findById(userId);

      if (existingUser) {
        const planType = selectedPlan || "aesthetic";
        console.log("Saving plan type:", planType);

        // ensure plans object exists
        existingUser.plans = existingUser.plans || {};

        // store plan
        existingUser.plans[planType] = structured;
        existingUser.selectedPlan = planType;

        // set current active plan
        existingUser.currentPlan = structured;

        // force mongoose to detect nested change
        existingUser.markModified("plans");

        await existingUser.save();

        console.log("Saved Plans:", existingUser.plans);
      }
    }

    return res.json({ plan: structured, raw: aiText });
  } catch (err) {
    console.log("AI controller error:", err.message);
    res.status(500).json({ error: "AI failed" });
  }
};

module.exports = { createPlan };