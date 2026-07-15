const mongoose = require("mongoose");

const dailyCheckinSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    date: {
      type: String,
      required: true,
      index: true,
    },

    sleepHours: {
      type: Number,
      required: true,
      min: 0,
      max: 12,
    },

    energyLevel: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    mood: {
      type: String,
      enum: [
        "excellent",
        "good",
        "neutral",
        "low",
        "exhausted",
      ],
      required: true,
    },

    availableTime: {
      type: Number,
      required: true,
    },

    equipment: {
      type: String,
      enum: [
        "gym",
        "home",
        "bands",
        "bodyweight",
      ],
      required: true,
    },

    waterIntake: {
      type: Number,
      required: true,
      min: 0,
      max: 8,
    },

    muscleSoreness: [
      {
        type: String,
        enum: [
          "chest",
          "back",
          "legs",
          "shoulders",
          "arms",
          "core",
        ],
      },
    ],

    injury: {
      type: Boolean,
      default: false,
    },

    injuryDescription: {
      type: String,
      default: "",
    },

    stressLevel: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    notes: {
      type: String,
      maxlength: 500,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

dailyCheckinSchema.index(
  {
    user: 1,
    date: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model(
  "DailyCheckin",
  dailyCheckinSchema
);