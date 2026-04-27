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
import { getNextRank, getUserRank, getSubTierProgress } from "../utils/rank";

/* ═══════════════════════════════════════════════════════════════════════════
   CONSTANTS & HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

const PROGRESS_KEY = "auraDailyGoalsProgress";
const STREAK_KEY = "auraDailyStreak";

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

const toArray = (value) => {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  return [value];
};

const normalizeDay = (value, index) => {
  const clean = typeof value === "string" ? value.trim() : "";
  return clean || `Day ${index + 1}`;
};

const buildDayWisePlan = (plan) => {
  if (!plan || typeof plan !== "object") return [];

  const dayMap = new Map();
  const sharedObjectives = toArray(plan.tips).filter(Boolean);

  toArray(plan.weeklyWorkout).forEach((entry, index) => {
    const day = normalizeDay(entry?.day, index);
    const existing = dayMap.get(day) || { day, workouts: [], meals: [], objectives: [] };

    const exercises = toArray(entry?.exercises).map((exercise) => ({
      name: exercise?.name || "Workout",
      sets: exercise?.sets || "",
      reps: exercise?.reps || "",
      duration: exercise?.duration || "",
    }));

    if (exercises.length) {
      existing.workouts.push(...exercises);
    } else if (entry?.focus) {
      existing.workouts.push({
        name: entry.focus,
        sets: "",
        reps: "",
        duration: "",
      });
    }

    dayMap.set(day, existing);
  });

  toArray(plan.diet).forEach((mealDay, index) => {
    const day = normalizeDay(mealDay?.day, index);
    const existing = dayMap.get(day) || { day, workouts: [], meals: [], objectives: [] };

    existing.meals = [
      { label: "Breakfast", value: mealDay?.breakfast },
      { label: "Lunch", value: mealDay?.lunch },
      { label: "Dinner", value: mealDay?.dinner },
      { label: "Snacks", value: mealDay?.snacks },
    ].filter((meal) => Boolean(meal.value));

    dayMap.set(day, existing);
  });

  const days = Array.from(dayMap.values());
  if (!days.length) {
    return [
      {
        day: "Day 1",
        workouts: [],
        meals: [],
        objectives: sharedObjectives,
      },
    ];
  }

  return days.map((dayPlan) => ({
    ...dayPlan,
    objectives: sharedObjectives.length ? sharedObjectives : dayPlan.objectives,
  }));
};

const readProgress = () => {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

/* ═══════════════════════════════════════════════════════════════════════════
   STREAK HELPER
   ═══════════════════════════════════════════════════════════════════════════ */

const getStreak = () => {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) return { count: 0, lastDate: null };
    return JSON.parse(raw);
  } catch {
    return { count: 0, lastDate: null };
  }
};

const updateStreak = () => {
  const today = new Date().toDateString();
  const streak = getStreak();
  if (streak.lastDate === today) return streak.count;

  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const newCount = streak.lastDate === yesterday ? streak.count + 1 : 1;
  const updated = { count: newCount, lastDate: today };
  localStorage.setItem(STREAK_KEY, JSON.stringify(updated));
  return newCount;
};

/* ═══════════════════════════════════════════════════════════════════════════
   CONFETTI PARTICLE SYSTEM (Canvas-based, self-contained)
   ═══════════════════════════════════════════════════════════════════════════ */

const ConfettiBurst = ({ trigger }) => {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  useEffect(() => {
    if (!trigger || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = [
      "#ef4444", "#f97316", "#eab308", "#22c55e",
      "#3b82f6", "#a855f7", "#ec4899", "#ffffff",
    ];

    const particles = Array.from({ length: 60 }, () => ({
      x: canvas.width / 2 + (Math.random() - 0.5) * 200,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 16,
      vy: -Math.random() * 18 - 4,
      size: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 12,
    }));

    let frame = 0;
    const maxFrames = 90;

    const animate = () => {
      if (frame >= maxFrames) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.45;
        p.alpha -= 0.012;
        p.rotation += p.rotSpeed;

        if (p.alpha <= 0) return;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      });

      frame++;
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [trigger]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 9999,
      }}
    />
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   MOTIVATIONAL TOAST COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */

const MotivationalToast = ({ message, xpGained, onDone }) => (
  <motion.div
    initial={{ opacity: 0, y: 60, scale: 0.85 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -30, scale: 0.9 }}
    transition={{ type: "spring", stiffness: 350, damping: 25 }}
    style={{
      position: "fixed",
      bottom: "2rem",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 9998,
      display: "flex",
      alignItems: "center",
      gap: "1rem",
      padding: "1rem 1.75rem",
      borderRadius: "16px",
      border: "1px solid rgba(239, 68, 68, 0.3)",
      background: "linear-gradient(135deg, rgba(15,15,15,0.95) 0%, rgba(30,10,10,0.95) 100%)",
      backdropFilter: "blur(20px)",
      boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(239,68,68,0.15)",
      maxWidth: "90vw",
    }}
    onAnimationComplete={() => {
      setTimeout(onDone, 2200);
    }}
  >
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: "12px",
        background: "linear-gradient(135deg, #ef4444, #b91c1c)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Zap size={20} color="#fff" />
    </div>
    <div>
      <p style={{ color: "#fff", fontWeight: 800, fontSize: "0.95rem", margin: 0 }}>{message}</p>
      {xpGained > 0 && (
        <p style={{ color: "#f87171", fontSize: "0.75rem", fontWeight: 700, margin: "2px 0 0 0", fontFamily: "monospace" }}>
          +{xpGained} XP EARNED
        </p>
      )}
    </div>
  </motion.div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   ANIMATED XP COUNTER
   ═══════════════════════════════════════════════════════════════════════════ */

const AnimatedXP = ({ value }) => {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    const from = prevRef.current;
    const to = value;
    if (from === to) return;

    const duration = 600;
    const start = performance.now();

    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (to - from) * eased));

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        prevRef.current = to;
      }
    };

    requestAnimationFrame(step);
  }, [value]);

  return <>{display.toLocaleString()}</>;
};

/* ═══════════════════════════════════════════════════════════════════════════
   CIRCULAR PROGRESS RING
   ═══════════════════════════════════════════════════════════════════════════ */

const ProgressRing = ({ progress, size = 100, strokeWidth = 8 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(63,63,70,0.4)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#b91c1c" />
            <stop offset="50%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ fontSize: "1.5rem", fontWeight: 900, color: "#fff", fontStyle: "italic" }}>
          {Math.round(progress)}%
        </span>
        <span style={{ fontSize: "0.55rem", color: "#71717a", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.15em" }}>
          Complete
        </span>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   TASK CARD COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */

const TaskCard = ({ title, description, done, icon: Icon, category, onComplete, index }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -10, scale: 0.95 }}
    transition={{ duration: 0.3, delay: index * 0.05 }}
    whileHover={!done ? { scale: 1.02, y: -2 } : {}}
    style={{
      position: "relative",
      padding: "1.25rem",
      borderRadius: "16px",
      border: done ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(63,63,70,0.4)",
      background: done
        ? "linear-gradient(135deg, rgba(22,101,52,0.15) 0%, rgba(5,46,22,0.1) 100%)"
        : "linear-gradient(135deg, rgba(24,24,27,0.8) 0%, rgba(15,15,15,0.9) 100%)",
      backdropFilter: "blur(12px)",
      cursor: done ? "default" : "pointer",
      overflow: "hidden",
      transition: "border-color 0.3s, box-shadow 0.3s",
      boxShadow: done
        ? "0 0 20px rgba(34,197,94,0.08)"
        : "0 4px 20px rgba(0,0,0,0.3)",
    }}
    onClick={() => !done && onComplete()}
  >
    {/* Glow effect on completion */}
    {done && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          position: "absolute",
          top: "-50%",
          left: "-50%",
          width: "200%",
          height: "200%",
          background: "radial-gradient(circle at center, rgba(34,197,94,0.06) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />
    )}

    <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", position: "relative", zIndex: 1 }}>
      {/* Category Icon */}
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: "12px",
          background: done
            ? "linear-gradient(135deg, #166534, #15803d)"
            : "linear-gradient(135deg, rgba(63,63,70,0.5), rgba(39,39,42,0.5))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          border: done ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(63,63,70,0.3)",
        }}
      >
        {Icon && <Icon size={18} color={done ? "#4ade80" : "#a1a1aa"} />}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: "0.6rem",
            fontFamily: "monospace",
            textTransform: "uppercase",
            letterSpacing: "0.25em",
            color: done ? "#4ade80" : "#ef4444",
            marginBottom: "4px",
            fontWeight: 700,
          }}
        >
          {category}
        </p>
        <p
          style={{
            fontSize: "0.95rem",
            fontWeight: 800,
            color: done ? "rgba(255,255,255,0.5)" : "#fff",
            textDecoration: done ? "line-through" : "none",
            lineHeight: 1.3,
          }}
        >
          {title}
        </p>
        {description && (
          <p
            style={{
              fontSize: "0.8rem",
              color: done ? "rgba(161,161,170,0.4)" : "#71717a",
              marginTop: "4px",
              lineHeight: 1.4,
            }}
          >
            {description}
          </p>
        )}

        {/* XP badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            marginTop: "8px",
            padding: "3px 10px",
            borderRadius: "20px",
            background: done ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.08)",
            border: done ? "1px solid rgba(34,197,94,0.2)" : "1px solid rgba(239,68,68,0.15)",
          }}
        >
          <Star size={10} color={done ? "#4ade80" : "#f87171"} />
          <span
            style={{
              fontSize: "0.65rem",
              fontWeight: 700,
              fontFamily: "monospace",
              color: done ? "#4ade80" : "#f87171",
            }}
          >
            {done ? "COMPLETED" : `+${XP_PER_TASK} XP`}
          </span>
        </div>
      </div>

      {/* Check Button */}
      <motion.div
        whileHover={!done ? { scale: 1.15 } : {}}
        whileTap={!done ? { scale: 0.9 } : {}}
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          background: done
            ? "linear-gradient(135deg, #16a34a, #15803d)"
            : "rgba(39,39,42,0.6)",
          border: done
            ? "2px solid #22c55e"
            : "2px solid rgba(63,63,70,0.5)",
          boxShadow: done ? "0 0 15px rgba(34,197,94,0.3)" : "none",
          cursor: done ? "default" : "pointer",
          transition: "all 0.3s",
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (!done) onComplete();
        }}
      >
        {done ? (
          <motion.div initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
            <Check size={18} color="#fff" strokeWidth={3} />
          </motion.div>
        ) : (
          <div style={{ width: 12, height: 12, borderRadius: "50%", border: "2px solid rgba(113,113,122,0.4)" }} />
        )}
      </motion.div>
    </div>
  </motion.div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   STREAK BADGE
   ═══════════════════════════════════════════════════════════════════════════ */

const StreakBadge = ({ count }) => {
  if (count < 1) return null;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "6px 14px",
        borderRadius: "20px",
        background: "linear-gradient(135deg, rgba(249,115,22,0.15), rgba(234,179,8,0.1))",
        border: "1px solid rgba(249,115,22,0.3)",
      }}
    >
      <Flame size={14} color="#f97316" />
      <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#fb923c", fontFamily: "monospace" }}>
        {count} DAY STREAK
      </span>
    </motion.div>
  );
};

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
          const aiRes = await fetch("http://localhost:5000/api/ai/plan", {
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

        const profileRes = await fetch(`http://localhost:5000/api/user/rank`, {
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
          const savedRes = await fetch(`http://localhost:5000/api/user/profile`, {
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
      } catch (_err) {
        setError("Unable to load your daily goals plan right now.");
      } finally {
        setLoading(false);
      }
    };

    loadPlan();
  }, [type, userId]);

  const activeDay = days[activeDayIndex] || null;

  const resetDayProgress = async () => {
    if (!activeDay) return;

    // Normalize the day key
    const normalizedDay = String(activeDay.day || "").toLowerCase();

    // Get JWT token
    const token = localStorage.getItem("token");

    try {
      await fetch("http://localhost:5000/api/user/reset-day", {
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
    ? activeDay.workouts.length + activeDay.meals.length + activeDay.objectives.length
    : 0;

  const completedTasks = activeDay
    ? [
        ...activeDay.workouts.map((w) => Boolean(taskProgress[String(activeDay.day || "").toLowerCase()]?.[`workout|${w.name}`.toLowerCase()])),
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
        const res = await fetch("http://localhost:5000/api/user/task-complete", {
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
            {/* ── DAY SELECTOR PILLS ── */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "2rem" }}>
              {days.map((day, idx) => {
                const isActive = idx === activeDayIndex;
                const dayTasks =
                  (day.workouts?.length || 0) + (day.meals?.length || 0) + (day.objectives?.length || 0);
                const dayDone = dayTasks > 0
                  ? [
                      ...day.workouts.map((w) => Boolean(taskProgress[String(day.day || "").toLowerCase()]?.[`workout|${w.name}`.toLowerCase()])),
                      ...day.meals.map((m) => Boolean(taskProgress[String(day.day || "").toLowerCase()]?.[`meal|${m.label}: ${m.value}`.toLowerCase()])),
                      ...day.objectives.map((o) => Boolean(taskProgress[String(day.day || "").toLowerCase()]?.[`objective|${o}`.toLowerCase()])),
                    ].filter(Boolean).length
                  : 0;
                const allDone = dayTasks > 0 && dayDone === dayTasks;

                return (
                  <motion.button
                    key={day.day}
                    onClick={() => setActiveDayIndex(idx)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      padding: "8px 18px",
                      borderRadius: "12px",
                      fontSize: "0.7rem",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.15em",
                      cursor: "pointer",
                      border: isActive
                        ? "1px solid #ef4444"
                        : allDone
                        ? "1px solid rgba(34,197,94,0.3)"
                        : "1px solid rgba(63,63,70,0.3)",
                      background: isActive
                        ? "linear-gradient(135deg, #ef4444, #b91c1c)"
                        : allDone
                        ? "rgba(22,101,52,0.15)"
                        : "rgba(24,24,27,0.6)",
                      color: isActive ? "#000" : allDone ? "#4ade80" : "#a1a1aa",
                      transition: "all 0.2s",
                      position: "relative",
                    }}
                  >
                    {day.day}
                    {allDone && !isActive && (
                      <span style={{ marginLeft: "6px" }}>✓</span>
                    )}
                  </motion.button>
                );
              })}
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
                  {/* Section: Workouts */}
                  {activeDay.workouts.length > 0 && (
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
                          {activeDay.workouts.filter((w) => taskProgress[String(activeDay.day || "").toLowerCase()]?.[`workout|${w.name}`.toLowerCase()]).length}/
                          {activeDay.workouts.length}
                        </span>
                      </h3>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "12px" }}>
                        {activeDay.workouts.map((w, idx) => {
                          const dayKey = String(activeDay.day || "").toLowerCase().trim();
                          const taskKey = `workout|${w.name.toLowerCase().trim()}`;
                          const done = Boolean(taskProgress[dayKey]?.[taskKey]);
                          const desc = [w.sets && `${w.sets} sets`, w.reps && `${w.reps} reps`, w.duration]
                            .filter(Boolean)
                            .join(" • ") || "Custom session";
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
                  {activeDay.workouts.length === 0 && activeDay.meals.length === 0 && activeDay.objectives.length === 0 && (
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
      </div>
    </div>
  );
};

export default DailyGoals;
