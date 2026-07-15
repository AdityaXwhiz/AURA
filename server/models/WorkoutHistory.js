

const mongoose = require("mongoose");

const workoutHistorySchema = new mongoose.Schema(
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

    version: {
      type: Number,
      default: 1,
    },

    originalWorkout: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    optimizedWorkout: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    changes: {
      type: [String],
      default: [],
    },

    reason: {
      type: [String],
      default: [],
    },

    recovery: {
      score: {
        type: Number,
        required: true,
      },
      level: {
        type: String,
        required: true,
      },
      reasons: {
        type: [String],
        default: [],
      },
    },

    constraints: {
      intensity: {
        type: String,
        default: "Moderate",
      },
      duration: {
        type: Number,
        default: 30,
      },
      equipment: {
        type: String,
        default: "gym",
      },
      avoid: {
        type: [String],
        default: [],
      },
      instructions: {
        type: [String],
        default: [],
      },
    },

    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

workoutHistorySchema.index({ user: 1, date: -1 });
workoutHistorySchema.index({ user: 1, version: -1 });

module.exports = mongoose.model("WorkoutHistory", workoutHistorySchema);