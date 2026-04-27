const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  type: String, // "steps" | "task" | "xp"
  value: Number,
  label: String,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Activity", activitySchema);