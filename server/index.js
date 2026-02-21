const express = require("express");
const cors = require("cors");
require("dotenv").config();

// MongoDB connection
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

// 🔥 CONNECT MONGODB
mongoose.connect(process.env.MONGO_URI)
.then(()=> console.log("MongoDB Connected 🔥"))
.catch(err => console.log("Mongo error:", err.message));

// 👤 USER SCHEMA
const userSchema = new mongoose.Schema({
  name: String,
  age: Number,
  weight: Number,
  height: Number,
  goal: String,
  diet: String,
  experience: String,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);

// ROOT
app.get("/", (req, res) => {
  res.send("AURA backend running 🚀");
});

// 💾 SAVE USER DATA
app.post("/api/user/save", async (req,res)=>{
  try{
    const user = new User(req.body);
    await user.save();
    console.log("User saved:", user.name);
    res.json({msg:"User saved"});
  }catch(err){
    res.status(500).json(err);
  }
});

// 🤖 GEMINI AI PLAN ROUTE
// 🤖 GEMINI AI PLAN ROUTE (LATEST WORKING)
const axios = require("axios");

app.post("/api/ai/plan", async (req,res)=>{
  try{
    const { name, goal, weight, age } = req.body;

    const prompt = `
You are Aura AI fitness coach.
Create aggressive Indian gym + diet plan.

Name: ${name}
Age: ${age}
Weight: ${weight}
Goal: ${goal}

Give:
- Daily workout
- Indian diet plan
- Motivation
`;

    const response = await axios.post(
`https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
{
  contents: [
    {
      parts: [{ text: prompt }]
    }
  ]
}
);

    const text =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No plan generated";

    console.log("AI generated plan ✅");
    res.json({ plan: text });

  }catch(err){
    console.log("Gemini error:", err.response?.data || err.message);
    res.status(500).json({error:"Gemini failed"});
  }
});

// START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> console.log("Server running on port", PORT));