const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  // 🔐 AUTH
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },

  // 👤 ONBOARDING DATA
  onboarding: {
    age: Number,
    weight: Number,
    height: Number,
    goal: String,
    diet: String,
    experience: String,
    target_weight: Number,
    commitment: String,
    daily_role: String,
    train_time: String,
    train_access: String
  },

  // 🎯 CURRENT SELECTED PLAN
  selectedPlan: String,

  // 🤖 AI GENERATED PLANS (saved forever per user)
  plans: {
    shred: { type: Object, default: {} },
    aesthetic: { type: Object, default: {} },
    elite: { type: Object, default: {} }
  },

  // 🔥 CURRENT ACTIVE PLAN (easy access in frontend)
  currentPlan: {
    type: Object,
    default: {}
  },

  // 🎮 GAMIFICATION
  points: {
    type: Number,
    default: 0
  },
  lastWeeklyReset: {
    type: Date,
    default: Date.now
  },
  objectiveLedger: {
    type: [
      {
        day: String,
        objective: String,
        completedAt: Date
      }
    ],
    default: []
  },
  taskLedger: {
    type: [
      {
        day: String,
        task: String,
        completedAt: Date
      }
    ],
    default: []
  },
  dailyBonusLedger: {
    type: [String],
    default: []
  },

  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

module.exports = mongoose.model("User", userSchema);