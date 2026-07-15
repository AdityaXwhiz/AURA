import axios from "axios";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  Check,
  ChevronLeft,
  Crown,
  Flame,
  Sparkles,
  Star,
  Target,
  Trophy,
  Utensils,
  Zap,
} from "lucide-react";

import AnimatedXP from "../components/dailyGoals/AnimatedXP";
import ConfettiBurst from "../components/dailyGoals/ConfettiBurst";
import MotivationalToast from "../components/dailyGoals/MotivationalToast";
import ProgressRing from "../components/dailyGoals/ProgressRing";
import StreakBadge from "../components/dailyGoals/StreakBadge";
import TaskCard from "../components/dailyGoals/TaskCard";
import { getNextRank, getUserRank, getSubTierProgress } from "../utils/rank";
import { buildDayWisePlan } from "../utils/dayPlanBuilder";
import {
  PROGRESS_KEY,
  STREAK_KEY,
  readProgress,
  getStreak,
  updateStreak,
} from "../utils/progressUtils";

/* ═══════════════════════════════════════════════════════════════════════════
   CONSTANTS & HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */


const MOTIVATIONAL_MESSAGES = [
  "Discipline > Motivation 🔥",
  "You're building momentum 🚀",
  "One step closer to greatness ⚡",
  "Champions don't skip reps 💪",
  "Stay locked in 🎯",
  "The grind never lies 🏆",
  "Another brick in the wall 🧱",
  "Consistency is the cheat code 🔑",
  "You showed up. That's everything 👑",
  "Excuses don't burn calories 🔥",
  "AURA rising... ✨",
  "Pain is temporary. Glory is forever 💎",
  "The body achieves what the mind believes 🧠",
  "Today's effort = tomorrow's physique 📈",
  "Unlocking your final form 🦾",
];

const XP_PER_TASK = 15;



/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */

const DailyGoals = () => {
  const navigate = useNavigate();
  const { type } = useParams();

  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState([]);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("auraUser")) || null;
    } catch {
      return null;
    }
  });
  const userId = user?._id || user?.id;
  const [taskProgress, setTaskProgress] = useState(() => {
    try {
      const all = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
      return all[userId] || {};
    } catch {
      return {};
    }
  });
  const [error, setError] = useState("");
  const [points, setPoints] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("auraUser") || "{}");
      return Number(stored.points) || 0;
    } catch { return 0; }
  });
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [toast, setToast] = useState(null);
  const [streak, setStreak] = useState(getStreak().count);
  const [adaptiveWorkout, setAdaptiveWorkout] = useState(null);
  const loadAdaptiveWorkout = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:5001/api/adaptive/today",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Adaptive Workout Response:", res.data);

      if (res.data?.workout) {
        const workout = res.data.workout;

        if (workout.optimizedWorkout) {
          setAdaptiveWorkout(workout.optimizedWorkout);
        }
        console.log("WORKOUT DATA:", workout);
        console.log("RECOVERY SCORE:", workout.recovery?.score);
console.log("RECOVERY LEVEL:", workout.recovery?.level);
console.log("FULL WORKOUT:", workout);

        setRecoveryData({
  score: workout.recovery?.score || 0,
  level: workout.recovery?.level || "Unknown",

  sleep: workout.sleepHours,
  energy: workout.energyLevel,
  stress: workout.stressLevel,
  soreness: workout.soreness,
  readiness: workout.readiness,
});

        setAiReason(workout.reason || "");
        setConstraints(workout.constraints || []);
      }
    } catch (err) {
     if (err.response?.status === 404) {
  console.log("NO DAILY CHECKIN FOUND");
  setShowCheckinPrompt(true);
  return;
}

      console.error(err);
      setAdaptiveWorkout(null);
    }
  }, []);
  

  const [recoveryData, setRecoveryData] = useState(null);

  const [constraints, setConstraints] = useState([]);

  const [aiReason, setAiReason] = useState("");
  const [showCheckinPrompt, setShowCheckinPrompt] = useState(false);
  
  useEffect(() => {
    const loadPlan = async () => {
      if (!userId) {
        setError("No active user found. Please login first.");
        setLoading(false);
        return;
      }

      // Get JWT token
      const token = localStorage.getItem("token");

      try {
        let plan = null;
        let savedData = null;

        if (type) {
          const aiRes = await fetch("https://aura-backend-nxps.onrender.com/api/ai/plan", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              selectedPlan: type,
              user: {
                name: user?.name,
                weight: user?.onboarding?.weight,
                goal: user?.onboarding?.goal,
                target_weight: user?.onboarding?.target_weight,
              },
            }),
          });

          const aiData = await aiRes.json();
          plan = aiData?.plan || null;
        }

        const profileRes = await fetch(`https://aura-backend-nxps.onrender.com/api/user/rank`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!profileRes.ok) {
          console.warn("Rank fetch failed:", profileRes.status);
        }
        const profileData = await profileRes.json();
        
        if (profileRes.ok) {
          setPoints(Number(profileData?.points) || 0);

          // Update local sync
          const auraUser = JSON.parse(localStorage.getItem("auraUser") || "{}");
          localStorage.setItem("auraUser", JSON.stringify({
            ...auraUser,
            points: profileData?.points,
            rank: profileData?.rank,
          }));

          // Synchronize task completion status from backend ledger
          if (Array.isArray(profileData?.taskLedger)) {
            const dayProgress = {};

            profileData.taskLedger.forEach((entry) => {
              const parts = String(entry).toLowerCase().split("|");

              if (parts.length < 4) return;

              const day = parts[1];
              const category = parts[2];
              const task = parts.slice(3).join("|");

              if (!dayProgress[day]) {
                dayProgress[day] = {};
              }

              dayProgress[day][`${category}|${task}`] = true;
            });
            // Merge with local storage progress for this user
            const localAll = readProgress();
            const localUserProgress = localAll[userId] || {};
            const mergedProgress = { ...localUserProgress, ...dayProgress };
            setTaskProgress(mergedProgress);

            // Sync localStorage progress too
            const allProgress = readProgress();
            localStorage.setItem(PROGRESS_KEY, JSON.stringify({ ...allProgress, [userId]: mergedProgress }));
          }
        }

        if (!plan) {
          const savedRes = await fetch(`https://aura-backend-nxps.onrender.com/api/user/profile`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (savedRes.ok) {
            savedData = await savedRes.json();
          } else {
            console.warn("Profile fetch failed:", savedRes.status);
          }

          // Adjust based on your backend response
          plan =
            savedData?.currentPlan ||
            savedData?.user?.currentPlan ||
            savedData?.plan ||
            savedData?.user?.plan ||
            savedData?.plans?.[type] ||
            savedData?.plans?.aesthetic ||
            savedData?.overview ||   // 🔥 IMPORTANT FIX (your Mongo structure)
            savedData?.user?.overview ||
            null;
        }

        if (!plan) {
          console.warn("No plan found, using fallback");

          plan = {
            weeklyWorkout: [
              {
                day: "Day 1",
                exercises: [{ name: "Push Ups", sets: "3", reps: "15" }],
              },
            ],
            diet: [
              {
                day: "Day 1",
                breakfast: "Eggs",
                lunch: "Rice + Chicken",
                dinner: "Salad",
              },
            ],
            tips: ["Stay consistent"],
          };
        }

        console.log("PROFILE RESPONSE:", savedData);
        console.log("EXTRACTED PLAN:", plan);
        const normalized = buildDayWisePlan(plan);
        setDays(normalized);
        setActiveDayIndex(0);
        // Base plan is now available, load today's adaptive workout.
       await loadAdaptiveWorkout();

      } catch (_err) {
        setError("Unable to load your daily goals plan right now.");
      } finally {
        setLoading(false);
      }
    };

    loadPlan();
  }, [type, userId,  loadAdaptiveWorkout]);

  const activeDay = days[activeDayIndex] || null;

  const workoutsToRender =
    adaptiveWorkout?.exercises ||
    adaptiveWorkout?.workouts ||
    activeDay?.workouts || [];

 

  const resetDayProgress = async () => {
    if (!activeDay) return;

    // Normalize the day key
    const normalizedDay = String(activeDay.day || "").toLowerCase();

    // Get JWT token
    const token = localStorage.getItem("token");

    try {
      await fetch("https://aura-backend-nxps.onrender.com/api/user/reset-day", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          day: normalizedDay,
        }),
      });
    } catch (err) {
      console.error("Reset failed:", err);
    }

    setTaskProgress((prev) => {
      const updated = { ...prev };
      delete updated[normalizedDay];

      const allProgress = readProgress();
      const updatedAll = { ...allProgress };
      if (updatedAll[userId]) {
        delete updatedAll[userId][normalizedDay];
      }

      localStorage.setItem(PROGRESS_KEY, JSON.stringify(updatedAll));
      return updated;
    });
  };
  const currentSubTier = getUserRank(points);
  const nextRank = getNextRank(points);
  const rankProgressValue = getSubTierProgress(points);

  /* ── Daily task completion percentage ── */
  const totalTasks = activeDay
    ? workoutsToRender.length + activeDay.meals.length + activeDay.objectives.length
    : 0;

  const completedTasks = activeDay
    ? [
        ...workoutsToRender.map((w) => Boolean(taskProgress[String(activeDay.day || "").toLowerCase()]?.[`workout|${w.name}`.toLowerCase()])),
        ...activeDay.meals.map((m) => Boolean(taskProgress[String(activeDay.day || "").toLowerCase()]?.[`meal|${m.label}: ${m.value}`.toLowerCase()])),
        ...activeDay.objectives.map((o) => Boolean(taskProgress[String(activeDay.day || "").toLowerCase()]?.[`objective|${o}`.toLowerCase()])),
      ].filter(Boolean).length
    : 0;

  const dailyProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  /* ── Show motivational toast ── */
  const showMotivation = useCallback((xp) => {
    const msg = MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];
    setToast({ message: msg, xp });
  }, []);

  /* ── Toggle task (no double counting) ── */
  const toggleTask = useCallback(
    async (day, category, task) => {
      const taskKey = `${category}|${task}`.toLowerCase();
      const dayKey = String(day || "").toLowerCase();

      if (taskProgress?.[dayKey]?.[taskKey]) return;

      // Update streak
      const newStreak = updateStreak();
      setStreak(newStreak);

      // Confetti + toast
      setConfettiTrigger((c) => c + 1);
      showMotivation(XP_PER_TASK);

      // Get JWT token
      const token = localStorage.getItem("token");

      try {
        const selectedPlan = type || user?.selectedPlan || "aesthetic";
        const res = await fetch("https://aura-backend-nxps.onrender.com/api/user/task-complete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            day: dayKey,
            task,
            category,
            planType: selectedPlan,
          }),
        });

        const data = await res.json();
        console.log("XP API RESPONSE:", data);
        if (res.ok) {
          const nextPoints = Number(data?.points) || 0;

          // force update even if same value (important)
          setPoints(() => nextPoints);

          setTaskProgress((prev) => {
            const dayKey = String(day || "").toLowerCase();
            const dayState = prev[dayKey] || {};
            const updated = {
              ...prev,
              [dayKey]: { ...dayState, [taskKey]: true },
            };

            const allProgress = readProgress();
            localStorage.setItem(
              PROGRESS_KEY,
              JSON.stringify({ ...allProgress, [userId]: updated })
            );

            return updated;
          });

          const updatedUser = {
            ...(user || {}),
            points: nextPoints,
            selectedPlan,
          };

          setUser(updatedUser);
          localStorage.setItem("auraUser", JSON.stringify(updatedUser));
        }
      } catch (_error) {
        // Keep UI optimistic; server handles duplicate prevention.
      }
    },
    [taskProgress, userId, type, user, showMotivation]
  );

  /* ═══════════════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════════════ */

  // Prepare UI variables for Adaptive Banner
  const recScore = recoveryData?.score != null ? Number(recoveryData.score) : 0;
  let recRec = "Recovery Day";
  let recColor = "#ef4444"; // red
  if (recScore >= 85) { recRec = "Push Hard"; recColor = "#4ade80"; } // green
  else if (recScore >= 70) { recRec = "Train Normally"; recColor = "#60a5fa"; } // blue
  else if (recScore >= 50) { recRec = "Moderate Session"; recColor = "#facc15"; } // yellow

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background effects */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "radial-gradient(circle at 50% -20%, rgba(220,38,38,0.08) 0%, transparent 50%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "radial-gradient(circle at 80% 80%, rgba(139,92,246,0.04) 0%, transparent 40%)",
          pointerEvents: "none",
        }}
      />

      {/* Confetti canvas */}
      <ConfettiBurst trigger={confettiTrigger} />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <MotivationalToast
            message={toast.message}
            xpGained={toast.xp}
            onDone={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "7rem 1.5rem 5rem",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Back button */}
        <motion.button
          onClick={() => navigate(-1)}
          whileHover={{ x: -3 }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            color: "#71717a",
            fontSize: "0.85rem",
            fontWeight: 600,
            background: "none",
            border: "none",
            cursor: "pointer",
            marginBottom: "2rem",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#71717a")}
        >
          <ChevronLeft size={16} /> Back
        </motion.button>

        {/* ── HEADER ── */}
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <p
              style={{
                color: "#ef4444",
                fontSize: "0.6rem",
                textTransform: "uppercase",
                letterSpacing: "0.5em",
                fontFamily: "monospace",
                fontWeight: 700,
              }}
            >
              AURA Daily Objectives
            </p>
            <StreakBadge count={streak} />
          </div>
          <h1
            style={{
              fontSize: "clamp(2rem, 5vw, 3.2rem)",
              fontWeight: 900,
              fontStyle: "italic",
              textTransform: "uppercase",
              letterSpacing: "-0.03em",
              marginTop: "0.75rem",
              lineHeight: 1.1,
            }}
          >
            YOUR BLITZKREIG
          </h1>
          <p style={{ color: "#71717a", marginTop: "0.75rem", maxWidth: "600px", fontSize: "0.9rem", lineHeight: 1.5 }}>
            Complete tasks, earn XP, and level up your discipline. Every rep counts.
          </p>
        </div>

        {/* ── STATS DASHBOARD ── */}
        <div
          style={{
            marginBottom: "2rem",
            padding: "1.5rem",
            borderRadius: "20px",
            border: "1px solid rgba(63,63,70,0.3)",
            background: "linear-gradient(135deg, rgba(24,24,27,0.7) 0%, rgba(15,15,15,0.85) 100%)",
            backdropFilter: "blur(16px)",
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: "1.5rem",
            alignItems: "center",
          }}
        >
          <div>
            {/* Rank + Points row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <p style={{ fontSize: "0.6rem", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.35em", color: "#71717a", marginBottom: "4px" }}>
                  Current Rank
                </p>
                <p style={{ fontSize: "1.5rem", fontWeight: 900, fontStyle: "italic", color: "#ef4444", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Crown size={20} /> {currentSubTier.name} {currentSubTier.tier}
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: "0.6rem", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.35em", color: "#71717a", marginBottom: "4px" }}>
                  Total XP
                </p>
                <p style={{ fontSize: "1.8rem", fontWeight: 900, fontStyle: "italic", color: "#fff" }}>
                  <AnimatedXP value={points} />
                </p>
              </div>
            </div>

            {/* XP progress bar */}
            <div style={{ marginTop: "1rem" }}>
              <div
                style={{
                  height: "8px",
                  background: "rgba(39,39,42,0.6)",
                  borderRadius: "99px",
                  overflow: "hidden",
                  border: "1px solid rgba(63,63,70,0.3)",
                }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${rankProgressValue}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  style={{
                    height: "100%",
                    background: "linear-gradient(90deg, #7f1d1d, #ef4444, #f97316)",
                    borderRadius: "99px",
                    boxShadow: "0 0 12px rgba(239,68,68,0.4)",
                  }}
                />
              </div>
              <p style={{ fontSize: "0.6rem", color: "#52525b", marginTop: "6px", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.15em" }}>
                {nextRank ? `${nextRank.threshold - points} XP to ${nextRank.name}` : "Maximum rank unlocked ✨"}
              </p>
            </div>

            {/* Quick stats */}
            <div style={{ display: "flex", gap: "1.5rem", marginTop: "1rem", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Trophy size={14} color="#eab308" />
                <span style={{ fontSize: "0.75rem", color: "#a1a1aa", fontWeight: 600 }}>
                  {completedTasks}/{totalTasks} tasks today
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Sparkles size={14} color="#a855f7" />
                <span style={{ fontSize: "0.75rem", color: "#a1a1aa", fontWeight: 600 }}>
                  +{XP_PER_TASK} XP per task
                </span>
              </div>
            </div>
          </div>

          {/* Daily Progress Ring */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <ProgressRing progress={dailyProgress} size={110} strokeWidth={10} />
          </div>
        </div>

        {loading ? (
          <div
            style={{
              padding: "3rem",
              borderRadius: "16px",
              border: "1px solid rgba(63,63,70,0.3)",
              background: "rgba(24,24,27,0.5)",
              textAlign: "center",
              color: "#71717a",
            }}
          >
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} style={{ display: "inline-block", marginBottom: "1rem" }}>
              <Zap size={24} color="#ef4444" />
            </motion.div>
            <p>Loading your mission objectives...</p>
          </div>
        ) : error ? (
          <div
            style={{
              padding: "2rem",
              borderRadius: "16px",
              border: "1px solid rgba(127,29,29,0.4)",
              background: "rgba(127,29,29,0.1)",
              color: "#fca5a5",
            }}
          >
            {error}
          </div>
        ) : (
          <>
            {/* TODAY'S MISSION */}

<div
  style={{
    marginBottom: "2rem",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  }}
>
  <div
    style={{
      padding: "10px 18px",
      borderRadius: "14px",
      border: "1px solid rgba(239,68,68,.3)",
      background: "rgba(239,68,68,.1)",
      color: "#ef4444",
      fontSize: ".75rem",
      fontWeight: 800,
      letterSpacing: ".15em",
      textTransform: "uppercase",
    }}
  >
    Today's Mission
  </div>

  {adaptiveWorkout && (
    <div
      style={{
        padding: "8px 14px",
        borderRadius: "12px",
        background: "rgba(59,130,246,.12)",
        border: "1px solid rgba(59,130,246,.25)",
        color: "#60a5fa",
        fontSize: ".7rem",
        fontWeight: 700,
      }}
    >
      AI Optimized
    </div>
  )}
</div>
            {activeDay && (
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
                <button
                  onClick={resetDayProgress}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "10px",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    cursor: "pointer",
                    border: "1px solid rgba(239,68,68,0.4)",
                    background: "rgba(127,29,29,0.15)",
                    color: "#f87171",
                    transition: "all 0.2s",
                  }}
                >
                  Reset Day
                </button>
              </div>
            )}

            {/* ── TASK CARDS GRID ── */}
            <AnimatePresence mode="wait">
              {activeDay && (
                <motion.div
                  key={activeDay.day}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >

                  {/* AI Banner */}
                  {adaptiveWorkout && (
                    <div style={{ marginBottom: "2.5rem" }}>
                      <style dangerouslySetInnerHTML={{ __html: `
                        .ai-dashboard-grid {
                          display: grid;
                          grid-template-columns: 2fr 1fr;
                          gap: 16px;
                        }
                        @media (max-width: 768px) {
                          .ai-dashboard-grid {
                            grid-template-columns: 1fr;
                          }
                        }
                      `}} />
                      
                      <div className="ai-dashboard-grid">
                        
                        {/* Left Card: AURA Adaptive Intelligence Engine */}
                        <div
                          style={{
                            padding: "1.5rem",
                            borderRadius: "16px",
                            border: "1px solid rgba(59,130,246,0.2)",
                            borderTop: "2px solid #3b82f6",
                            background: "linear-gradient(135deg, rgba(15,23,42,0.95), rgba(0,0,0,0.95))",
                            backdropFilter: "blur(16px)",
                            boxShadow: "0 8px 32px rgba(0,0,0,0.5), inset 0 0 20px rgba(59,130,246,0.05)",
                            position: "relative",
                            overflow: "hidden",
                            display: "flex",
                            flexDirection: "column"
                          }}
                        >
                          <div style={{ position: "absolute", top: "-50px", left: "-50px", width: "100px", height: "100px", background: "rgba(239,68,68,0.2)", filter: "blur(40px)", pointerEvents: "none" }} />
                          
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem", flexWrap: "wrap", gap: "10px" }}>
                            <h3 style={{ margin: 0, color: "#fff", fontSize: "1.1rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", display: "flex", alignItems: "center", gap: "8px" }}>
                              <Zap size={18} color="#3b82f6" /> AURA Adaptive Intelligence Engine
                            </h3>
                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                              <span style={{ background: "rgba(59,130,246,0.15)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.3)", padding: "4px 10px", borderRadius: "8px", fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                                AI Optimized Workout
                              </span>
                              {recoveryData?.level && (
                                <span style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)", padding: "4px 10px", borderRadius: "8px", fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                                  Recovery: {recoveryData.level}
                                </span>
                              )}
                            </div>
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1, justifyContent: "center" }}>
                            <div style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.05)", padding: "12px", borderRadius: "10px" }}>
                              <p style={{ margin: 0, fontSize: "0.7rem", color: "#60a5fa", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.1em", marginBottom: "4px" }}>
                                AI Decision
                              </p>
                              <p style={{ margin: 0, fontSize: "0.85rem", color: "#e2e8f0", lineHeight: 1.5 }}>
                                Today's workout was dynamically optimized utilizing your Daily Check-In biometrics.
                              </p>
                            </div>

                            {aiReason && (
                              <div style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)", padding: "12px", borderRadius: "10px", borderLeft: "3px solid #ef4444" }}>
                                <p style={{ margin: 0, fontSize: "0.7rem", color: "#ef4444", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.1em", marginBottom: "4px" }}>
                                  Optimization Rationale
                                </p>
                                <p style={{ margin: 0, fontSize: "0.85rem", color: "#e2e8f0", lineHeight: 1.5, fontStyle: "italic" }}>
                                  "{aiReason}"
                                </p>
                              </div>
                            )}

                            {constraints && constraints.length > 0 && (
                              <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", marginTop: "4px" }}>
                                <span style={{ fontSize: "0.65rem", color: "#a1a1aa", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.1em" }}>Constraints Applied:</span>
                                {constraints.map((c, i) => (
                                  <span key={i} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#cbd5e1", padding: "2px 8px", borderRadius: "6px", fontSize: "0.7rem", fontWeight: 600 }}>
                                    {c}
                                  </span>
                                ))}
                              </div>
                            )}

                            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "auto", paddingTop: "8px" }}>
                              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#3b82f6", boxShadow: "0 0 10px #3b82f6" }} className="animate-pulse" />
                              <span style={{ fontSize: "0.65rem", color: "#3b82f6", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.1em" }}>
                                Adaptive Status: Active
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right Card: Recovery Flash Card */}
                        <div
                          style={{
                            padding: "1.5rem",
                            borderRadius: "16px",
                            border: `1px solid ${recColor}40`,
                            background: "linear-gradient(135deg, rgba(15,23,42,0.8), rgba(9,9,11,0.9))",
                            backdropFilter: "blur(16px)",
                            boxShadow: `0 8px 32px rgba(0,0,0,0.5), inset 0 0 30px ${recColor}15`,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "flex-start",
                            textAlign: "center",
                            position: "relative"
                          }}
                        >
                          <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8", textTransform: "uppercase", fontWeight: 900, letterSpacing: "0.2em", marginBottom: "1.25rem" }}>
                            AURA Recovery Index
                          </p>

                          <div style={{ 
                            width: "110px", height: "110px", borderRadius: "50%", 
                            border: `4px solid ${recColor}`, 
                            display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: `0 0 25px ${recColor}40, inset 0 0 15px ${recColor}20`,
                            marginBottom: "1.25rem",
                            background: "rgba(0,0,0,0.3)",
                            flexShrink: 0
                          }}>
                            <span style={{ fontSize: "3rem", fontWeight: 900, color: "#fff", textShadow: `0 0 10px ${recColor}80`, lineHeight: 1 }}>
                              {recScore}
                            </span>
                          </div>

                          <h4 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            {recRec}
                          </h4>
                          
                          {recoveryData?.level && (
                            <p style={{ margin: "6px 0 0 0", fontSize: "0.75rem", color: recColor, textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.1em" }}>
                              Level: {recoveryData.level}
                            </p>
                          )}

                          {/* Recovery Factors Section */}
                          <div style={{ width: '100%', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <p style={{ margin: 0, fontSize: "0.65rem", color: "#64748b", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.15em", marginBottom: "1rem", textAlign: "left" }}>
                              Recovery Factors
                            </p>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
                              {[
                                { label: "Sleep Quality", value: recoveryData?.sleep ? `${recoveryData.sleep} hrs` : "7.5 hrs", color: "#4ade80" },
                                { label: "Energy Level", value: recoveryData?.energy || "High", color: "#4ade80" },
                                { label: "Muscle Soreness", value: (recoveryData?.soreness && recoveryData.soreness.length > 0) ? (Array.isArray(recoveryData.soreness) ? recoveryData.soreness.join(', ') : recoveryData.soreness) : "Moderate", color: "#facc15" },
                                { label: "Stress Level", value: recoveryData?.stress || "Low", color: "#4ade80" },
                                { label: "Workout Readiness", value: recoveryData?.readiness || "Prime", color: "#4ade80" }
                              ].map((factor, i) => (
                                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.03)", padding: "6px 10px", borderRadius: "8px" }}>
                                  <span style={{ fontSize: "0.7rem", color: "#cbd5e1", fontWeight: 600 }}>{factor.label}</span>
                                  <span style={{ fontSize: "0.7rem", color: factor.color, fontWeight: 800, textTransform: "uppercase" }}>{factor.value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  )}

                  {/* Section: Workouts */}
                  {workoutsToRender.length > 0 && (
                    <div style={{ marginBottom: "2rem" }}>
                      <h3
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          fontSize: "0.75rem",
                          fontWeight: 900,
                          textTransform: "uppercase",
                          letterSpacing: "0.2em",
                          color: "#ef4444",
                          marginBottom: "1rem",
                        }}
                      >
                        <Activity size={16} /> Workouts
                        <span style={{
                          marginLeft: "auto",
                          fontSize: "0.65rem",
                          color: "#52525b",
                          fontWeight: 600,
                        }}>
                          {workoutsToRender.filter((w) => taskProgress[String(activeDay.day || "").toLowerCase()]?.[`workout|${w.name}`.toLowerCase()]).length}/
                          {workoutsToRender.length}
                        </span>
                      </h3>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "12px" }}>
                        {workoutsToRender.map((w, idx) => {
                          const dayKey = String(activeDay.day || "").toLowerCase().trim();
                          const taskKey = `workout|${w.name.toLowerCase().trim()}`;
                          const desc = [w.sets && `${w.sets} sets`, w.reps && `${w.reps} reps`, w.duration]
                            .filter(Boolean)
                            .join(" • ") || "Custom session";
                          const done = Boolean(taskProgress[dayKey]?.[taskKey]);
                          return (
                            <TaskCard
                              key={`${w.name}-${idx}`}
                              title={w.name}
                              description={desc}
                              done={done}
                              icon={Activity}
                              category="Workout"
                              onComplete={() => toggleTask(activeDay.day, "workout", w.name)}
                              index={idx}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Section: Meals */}
                  {activeDay.meals.length > 0 && (
                    <div style={{ marginBottom: "2rem" }}>
                      <h3
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          fontSize: "0.75rem",
                          fontWeight: 900,
                          textTransform: "uppercase",
                          letterSpacing: "0.2em",
                          color: "#ef4444",
                          marginBottom: "1rem",
                        }}
                      >
                        <Utensils size={16} /> Meals
                        <span style={{
                          marginLeft: "auto",
                          fontSize: "0.65rem",
                          color: "#52525b",
                          fontWeight: 600,
                        }}>
                          {activeDay.meals.filter((m) => taskProgress[String(activeDay.day || "").toLowerCase()]?.[`meal|${m.label}: ${m.value}`.toLowerCase()]).length}/
                          {activeDay.meals.length}
                        </span>
                      </h3>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "12px" }}>
                        {activeDay.meals.map((m, idx) => {
                          const dayKey = String(activeDay.day || "").toLowerCase().trim();
                          const taskKey = `meal|${`${m.label}: ${m.value}`.toLowerCase()}`;
                          const done = Boolean(taskProgress[dayKey]?.[taskKey]);

                          return (
                            <TaskCard
                              key={`${m.label}-${idx}`}
                              title={m.label}
                              description={m.value}
                              done={done}
                              icon={Utensils}
                              category="Nutrition"
                              onComplete={() =>
                                toggleTask(activeDay.day, "meal", `${m.label}: ${m.value}`)
                              }
                              index={idx}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Section: Objectives */}
                  {activeDay.objectives.length > 0 && (
                    <div style={{ marginBottom: "2rem" }}>
                      <h3
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          fontSize: "0.75rem",
                          fontWeight: 900,
                          textTransform: "uppercase",
                          letterSpacing: "0.2em",
                          color: "#ef4444",
                          marginBottom: "1rem",
                        }}
                      >
                        <Target size={16} /> Objectives
                        <span style={{
                          marginLeft: "auto",
                          fontSize: "0.65rem",
                          color: "#52525b",
                          fontWeight: 600,
                        }}>
                          {activeDay.objectives.filter((o) => taskProgress[String(activeDay.day || "").toLowerCase()]?.[`objective|${o}`.toLowerCase()]).length}/
                          {activeDay.objectives.length}
                        </span>
                      </h3>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "12px" }}>
                        {activeDay.objectives.map((objective, idx) => {
                          const dayKey = String(activeDay.day || "").toLowerCase().trim();
                          const taskKey = `objective|${objective.toLowerCase().trim()}`;
                          const done = Boolean(taskProgress[dayKey]?.[taskKey]);
                          return (
                            <TaskCard
                              key={`${objective}-${idx}`}
                              title={objective}
                              description={null}
                              done={done}
                              icon={Target}
                              category="Objective"
                              onComplete={() => toggleTask(activeDay.day, "objective", objective)}
                              index={idx}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Empty state */}
                  {workoutsToRender.length === 0 && activeDay.meals.length === 0 && activeDay.objectives.length === 0 && (
                    <div
                      style={{
                        padding: "3rem",
                        borderRadius: "16px",
                        border: "1px solid rgba(63,63,70,0.3)",
                        background: "rgba(24,24,27,0.5)",
                        textAlign: "center",
                      }}
                    >
                      <Target size={32} color="#52525b" style={{ margin: "0 auto 1rem" }} />
                      <p style={{ color: "#71717a", fontSize: "0.9rem" }}>No tasks assigned for this day.</p>
                    </div>
                  )}

                  {/* Completion celebration */}
                  {totalTasks > 0 && completedTasks === totalTasks && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        marginTop: "2rem",
                        padding: "2rem",
                        borderRadius: "20px",
                        border: "1px solid rgba(34,197,94,0.3)",
                        background: "linear-gradient(135deg, rgba(22,101,52,0.15) 0%, rgba(5,46,22,0.1) 100%)",
                        textAlign: "center",
                      }}
                    >
                      <motion.div
                        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 3 }}
                      >
                        <Trophy size={40} color="#4ade80" style={{ margin: "0 auto" }} />
                      </motion.div>
                      <h3 style={{ fontSize: "1.5rem", fontWeight: 900, fontStyle: "italic", color: "#4ade80", marginTop: "1rem" }}>
                        ALL MISSIONS COMPLETE!
                      </h3>
                      <p style={{ color: "#86efac", fontSize: "0.85rem", marginTop: "0.5rem" }}>
                        You've conquered today. The AURA grows stronger. 🔥
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
        <AnimatePresence>
  {showCheckinPrompt && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,.85)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "500px",
          maxWidth: "90%",
          background: "#0a0a0a",
          border: "1px solid rgba(239,68,68,.25)",
          borderRadius: "24px",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <Zap
          size={42}
          color="#ef4444"
          style={{ marginBottom: "1rem" }}
        />

        <h2
          style={{
            color: "#fff",
            fontSize: "1.7rem",
            fontWeight: 800,
            marginBottom: ".75rem",
          }}
        >
          AURA Daily Optimization
        </h2>

        <p
          style={{
            color: "#a1a1aa",
            lineHeight: 1.7,
            marginBottom: "2rem",
          }}
        >
          Today's workout hasn't been optimized yet.
          Complete a Daily Check-In so AURA can generate
          an AI-adapted workout.
        </p>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={() => navigate("/daily-checkin")}
            style={{
              flex: 1,
              padding: "14px",
              borderRadius: "14px",
              border: "none",
              background:
                "linear-gradient(135deg,#ef4444,#b91c1c)",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Start Check-In
          </button>

          <button
            onClick={() => setShowCheckinPrompt(false)}
            style={{
              flex: 1,
              padding: "14px",
              borderRadius: "14px",
              border: "1px solid rgba(255,255,255,.08)",
              background: "#111",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Not Now
          </button>
        </div>
      </div>
    </motion.div>
  )}
</AnimatePresence>
      </div>
    </div>
  );
};

export default DailyGoals;