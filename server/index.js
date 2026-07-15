const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

require("dotenv").config();

/* ==========================================
   ENVIRONMENT VALIDATION
========================================== */

const requiredEnv = [
  "MONGO_URI",
  "JWT_SECRET",
  "GEMINI_API_KEY",
];

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Missing environment variable: ${key}`);
    process.exit(1);
  }
});

console.log("🤖 Gemini API Loaded");

const app = express();

/* ==========================================
   SECURITY MIDDLEWARE
========================================== */

app.use(helmet());

app.use(compression());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.use(
  morgan(process.env.NODE_ENV === "production" ? "combined" : "dev")
);

/* ==========================================
   CORS
========================================== */

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
  "https://aura-zbb4.onrender.com",
];

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.warn("Blocked by CORS:", origin);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(express.json());

/* ==========================================
   ROOT
========================================== */

app.get("/", (req, res) => {
  res.send("AURA Backend Running 🚀");
});

/* ==========================================
   ROUTES
========================================== */

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/ai", require("./routes/aiRoutes"));
app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/fitness", require("./routes/fitness"));
app.use("/api/activity", require("./routes/activity"));
app.use("/api/adaptive", require("./routes/adaptiveRoutes"));

/* ==========================================
   404 HANDLER
========================================== */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/* ==========================================
   GLOBAL ERROR HANDLER
========================================== */

app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : err.message,
  });
});

/* ==========================================
   DATABASE CONNECTION
========================================== */

const PORT = process.env.PORT || 5001;

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB Connected");

    app.listen(PORT, () => {
      console.log("🚀 Aura Backend Started");
      console.log(`🌐 Server running on port ${PORT}`);
      console.log("🤖 Gemini Service Ready");
    });
  } catch (err) {
    console.error("❌ MongoDB Connection Failed:", err.message);
    process.exit(1);
  }
}

startServer();

/* ==========================================
   GRACEFUL SHUTDOWN
========================================== */

process.on("SIGINT", async () => {
  console.log("\n⚠️ Shutting down server...");

  await mongoose.connection.close();

  console.log("✅ MongoDB Connection Closed");

  process.exit(0);
});