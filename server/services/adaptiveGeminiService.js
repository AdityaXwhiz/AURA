

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

const optimizeWorkout = async ({
  user,
  currentPlan,
  previousWorkout,
  checkin,
  recovery,
  constraints,
}) => {
  const prompt = `
You are AURA, an elite AI fitness optimization engine.

The user already has an existing AI-generated fitness program.

Your responsibility is to preserve the long-term structure of that program while optimizing ONLY today's workout.

Never redesign the complete split.
Never ignore the existing plan.
Respect progressive overload.
Respect recovery.
Respect previous workout history.
Respect all business constraints.

========================
USER PROFILE
========================

Goal: ${user.goal || "Unknown"}
Current Weight: ${user.weight || "Unknown"}
Target Weight: ${user.targetWeight || "Unknown"}
Experience: ${user.experience || "Beginner"}

========================
CURRENT AI FITNESS PLAN
========================

The following is the user's existing long-term AI-generated plan.
You MUST preserve its overall progression.
You are NOT allowed to redesign the complete program.
Only optimize today's workout.

${JSON.stringify(currentPlan, null, 2)}

========================
PREVIOUS WORKOUT
========================

${JSON.stringify(previousWorkout, null, 2)}

========================
TODAY'S CHECK-IN
========================

Sleep: ${checkin.sleepHours} hours
Energy: ${checkin.energyLevel}/5
Mood: ${checkin.mood}
Stress: ${checkin.stressLevel}/5
Water Intake: ${checkin.waterIntake}L
Available Time: ${checkin.availableTime} mins
Equipment: ${checkin.equipment}
Muscle Soreness: ${checkin.muscleSoreness.join(", ") || "None"}
Injury: ${checkin.injury ? checkin.injuryDescription : "None"}

========================
RECOVERY
========================

Score: ${recovery.score}/100
Level: ${recovery.level}

Reasons:
${recovery.reasons.map(r => `- ${r}`).join("\n")}

========================
CONSTRAINTS
========================

Intensity: ${constraints.intensity}
Duration: ${constraints.duration} mins
Equipment: ${constraints.equipment}

Avoid:
${constraints.avoid.length ? constraints.avoid.join(", ") : "None"}

Instructions:
${constraints.instructions.map(i => `- ${i}`).join("\n")}

========================
OUTPUT FORMAT
========================
Return ONLY valid JSON.

{
  "originalWorkout": {
    "title": ""
  },
  "optimizedWorkout": {
    "title": "",
    "duration": 30,
    "intensity": "",
    "exercises": [
      {
        "name": "",
        "sets": 3,
        "reps": "12",
        "rest": "60 sec"
      }
    ]
  },
  "changes": [
    "Changed 1",
    "Changed 2"
  ],
  "reason": [
    "Reason 1",
    "Reason 2"
  ]
}

Do not include markdown fences or extra commentary.
`;
const MODEL_NAME = "gemini-flash-latest";

const model = genAI.getGenerativeModel({
  model: MODEL_NAME,
});

console.log("Using Gemini model:", MODEL_NAME);
  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  let parsed;

  try {
    parsed = JSON.parse(text);
  } catch {
    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    parsed = JSON.parse(cleaned);
  }

  parsed.generatedAt = new Date().toISOString();
  parsed.recoveryScore = recovery.score;
  parsed.recoveryLevel = recovery.level;

  return parsed;
};

module.exports = {
  optimizeWorkout,
};