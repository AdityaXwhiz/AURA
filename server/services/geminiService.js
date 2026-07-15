const axios = require("axios");
const GEMINI_MODEL = "gemini-2.0-flash";
const MAX_RETRIES = 2;

const url = `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`;

const extractAndParse = (rawText) => {
  console.debug("RAW AI RESPONSE:", rawText);

  let cleaned = rawText
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error("No JSON found in AI response");
  }

  return JSON.parse(jsonMatch[0]);
};

const generatePlan = async (userData) => {
  const {
    name,
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
    planType
  } = userData;

  const prompt = `
You are AURA — an elite AI body transformation coach.

The user has selected this transformation protocol: ${planType}.

Available Protocol Types:
- shred → Fat loss focused, calorie deficit, conditioning, high intensity.
- aesthetic → Balanced muscle gain + fat control, symmetry focus.
- elite → Advanced performance, strength, athletic conditioning.

IMPORTANT:
Design the entire plan strictly according to the selected protocol type.
Do NOT mix protocols.

User Profile:
Name: ${name}
Age: ${age}
Weight: ${weight} kg
Height: ${height} cm
Goal: ${goal}
Diet Preference: ${diet}
Experience Level: ${experience}
Target Weight: ${target_weight}
Training Frequency: ${commitment}
Lifestyle: ${daily_role}
Preferred Training Time: ${train_time}
Training Access: ${train_access}

Instructions:
- Make the plan realistic and actionable.
- Consider Indian diet options.
- Adjust intensity based on experience level.
- Adjust calories based on goal.
- Structure everything clearly.

CRITICAL:
Return ONLY valid JSON. No explanation, no markdown, no text outside JSON.

Format:
{
  "targetWeight": "",
  "weeklyWorkout": [
    {
      "day": "",
      "focus": "",
      "exercises": [
        {
          "name": "",
          "sets": "",
          "reps": ""
        }
      ]
    }
  ],
  "dietPlan": "",
  "weeklyTarget": "",
  "physiquePrediction": "",
  "motivation": ""
}
`;


  let lastError;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await axios.post(url, {
        contents: [{ parts: [{ text: prompt }] }],
      });

      const rawText =
        response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "";

      const parsed = extractAndParse(rawText);

      return parsed;
    } catch (err) {
      console.error(`ATTEMPT ${attempt + 1} FAILED:`, err.message);
      lastError = err;
      if (attempt < MAX_RETRIES - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    }
  }

  throw new Error(lastError?.message || "AI failed. Try again.");
};

module.exports = { generatePlan };