const express = require("express");
const cors = require("cors");
require("dotenv").config();
console.log("GEMINI KEY:", process.env.GEMINI_API_KEY);

// MongoDB
const mongoose = require("mongoose");

const app = express();
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json());

/* ===============================
   🔥 CONNECT MONGODB
================================ */
mongoose.connect(process.env.MONGO_URI)
.then(()=> console.log("MongoDB Connected 🔥"))
.catch(err => console.log("Mongo error:", err.message));

/* ===============================
   ROOT TEST
================================ */
app.get("/", (req, res) => {
  res.send("AURA backend running 🚀");
});

/* ===============================
   🔐 AUTH ROUTES
================================ */
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

/* ===============================
   🤖 AI ROUTES (NEW CLEAN SYSTEM)
================================ */
const aiRoutes = require("./routes/aiRoutes");
app.use("/api/ai", aiRoutes);

/* ===============================
   👤 USER DATA ROUTES
================================ */
const userRoutes = require("./routes/userRoutes");
app.use("/api/user", userRoutes);

/* ===============================
   🏃 FITNESS ROUTES
================================ */
const fitnessRoutes = require("./routes/fitness");
app.use("/api/fitness", fitnessRoutes);

/* ===============================
   📊 ACTIVITY ROUTES
================================ */
const activityRoutes = require("./routes/activity");
app.use("/api/activity", activityRoutes);

/* ===============================
   START SERVER
================================ */
const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> console.log("Server running on port", PORT));