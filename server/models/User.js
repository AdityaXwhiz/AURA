const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
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
    trim: true,
    index: true
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
  selectedPlan: {
    type: String,
    enum: ["shred", "aesthetic", "elite"],
    default: "aesthetic"
  },

  // 🤖 AI GENERATED PLANS (saved forever per user)
  plans: {
    shred: { type: Schema.Types.Mixed, default: {} },
    aesthetic: { type: Schema.Types.Mixed, default: {} },
    elite: { type: Schema.Types.Mixed, default: {} }
  },

  // 🔥 CURRENT ACTIVE PLAN (easy access in frontend)
  currentPlan: {
    type: Schema.Types.Mixed,
    default: {}
  },

  // 🧠 ADAPTIVE PLAN VERSIONING
  activeVersion: {
    type: Number,
    default: 1
  },

  planVersions: {
    type: [
      {
        version: {
          type: Number,
          required: true
        },

        goal: {
          type: String,
          default: ""
        },

        protocol: {
          type: String,
          default: ""
        },

        aiReason: {
          type: String,
          default: ""
        },

        status: {
          type: String,
          enum: ["active", "archived"],
          default: "active"
        },

        createdAt: {
          type: Date,
          default: Date.now
        },

        plan: {
          type: Schema.Types.Mixed,
          default: {}
        }
      }
    ],
    default: []
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

userSchema.set("versionKey", false);

module.exports = mongoose.model("User", userSchema);