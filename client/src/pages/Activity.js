import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity as ActivityIcon, ChevronLeft, Crown, Flame, Footprints,
  Utensils, Zap, Target, Check, TrendingUp, Coffee, Sun, Moon, Cookie
} from "lucide-react";
import { getUserRank, getNextRank, getSubTierProgress } from "../utils/rank";

const API = "https://aura-backend-nxps.onrender.com";
const PROGRESS_KEY = "auraDailyGoalsProgress";
const CAL_PER_STEP = 0.04;
const EST_MEAL_CAL = { Breakfast: 400, Lunch: 550, Dinner: 500, Snacks: 200 };
const MEAL_ICONS = { Breakfast: Coffee, Lunch: Sun, Dinner: Moon, Snacks: Cookie };

const toArray = (v) => (Array.isArray(v) ? v : v ? [v] : []);

const getTodayDayIndex = () => {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
};

const getTodayDiet = (plan) => {
  if (!plan) return [];
  const diet = toArray(plan.diet);
  const idx = getTodayDayIndex();
  const day = diet[idx] || diet[0];
  if (!day) return [];
  return [
    { label: "Breakfast", value: day.breakfast },
    { label: "Lunch", value: day.lunch },
    { label: "Dinner", value: day.dinner },
    { label: "Snacks", value: day.snacks },
  ].filter((m) => Boolean(m.value));
};

const getTodayWorkouts = (plan) => {
  if (!plan) return [];
  const workouts = toArray(plan.weeklyWorkout);
  const idx = getTodayDayIndex();
  const day = workouts[idx] || workouts[0];
  if (!day) return [];
  return toArray(day.exercises).map((e) => ({
    name: e?.name || "Workout",
    sets: e?.sets || "",
    reps: e?.reps || "",
    duration: e?.duration || "",
  }));
};

/* ═══ Animated Number ═══ */
const AnimNum = ({ value }) => {
  const [d, setD] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    const from = prev.current, to = value;
    if (from === to) return;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / 600, 1);
      setD(Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(step);
      else prev.current = to;
    };
    requestAnimationFrame(step);
  }, [value]);
  return <>{d.toLocaleString()}</>;
};

/* ═══ Progress Ring ═══ */
const Ring = ({ progress, size = 90, sw = 7 }) => {
  const r = (size - sw) / 2, c = 2 * Math.PI * r, off = c - (progress / 100) * c;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(63,63,70,0.4)" strokeWidth={sw} />
        <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke="url(#rg)" strokeWidth={sw}
          strokeLinecap="round" strokeDasharray={c} initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: off }} transition={{ duration: 0.8 }} />
        <defs><linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#b91c1c"/><stop offset="100%" stopColor="#f97316"/>
        </linearGradient></defs>
      </svg>
      <div style={{ position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center" }}>
        <span style={{ fontSize:"1.3rem",fontWeight:900,color:"#fff",fontStyle:"italic" }}>{Math.round(progress)}%</span>
        <span style={{ fontSize:"0.5rem",color:"#71717a",fontFamily:"monospace",textTransform:"uppercase",letterSpacing:"0.15em" }}>Done</span>
      </div>
    </div>
  );
};

/* ═══ Glass Card ═══ */
const GlassCard = ({ children, style, hover = true, ...props }) => (
  <motion.div whileHover={hover ? { scale: 1.02, y: -2 } : {}} transition={{ duration: 0.2 }}
    style={{
      padding: "1.25rem", borderRadius: "16px",
      border: "1px solid rgba(63,63,70,0.35)",
      background: "linear-gradient(135deg, rgba(24,24,27,0.8), rgba(15,15,15,0.9))",
      backdropFilter: "blur(12px)", boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
      transition: "border-color 0.3s, box-shadow 0.3s", ...style,
    }} {...props}>{children}</motion.div>
);

/* ═══ Stat Card ═══ */
const StatCard = ({ icon: Icon, label, value, unit, color = "#ef4444", delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    whileHover={{ scale: 1.04, boxShadow: `0 0 25px ${color}22` }}
    style={{
      padding: "1.25rem", borderRadius: "16px",
      border: `1px solid ${color}25`,
      background: "linear-gradient(135deg, rgba(24,24,27,0.85), rgba(15,15,15,0.95))",
      backdropFilter: "blur(12px)", textAlign: "center", cursor: "default",
    }}>
    <div style={{ width:36,height:36,borderRadius:"10px",margin:"0 auto 10px",
      background:`linear-gradient(135deg, ${color}30, ${color}15)`,
      display:"flex",alignItems:"center",justifyContent:"center",
      border:`1px solid ${color}30` }}>
      <Icon size={16} color={color} />
    </div>
    <p style={{ fontSize:"0.6rem",fontFamily:"monospace",textTransform:"uppercase",
      letterSpacing:"0.25em",color:"#71717a",marginBottom:4 }}>{label}</p>
    <p style={{ fontSize:"1.4rem",fontWeight:900,color:"#fff",fontStyle:"italic" }}>
      {typeof value === "number" ? <AnimNum value={value} /> : value}
      {unit && <span style={{ fontSize:"0.7rem",color:"#71717a",marginLeft:3 }}>{unit}</span>}
    </p>
  </motion.div>
);

/* ═══ Meal Card ═══ */
const MealCard = ({ label, value, completed, delay = 0 }) => {
  const Icon = MEAL_ICONS[label] || Utensils;
  return (
    <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
      transition={{ delay, duration:0.4 }} whileHover={{ scale:1.03 }}
      style={{
        padding:"1.25rem", borderRadius:"16px",
        border: completed ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(63,63,70,0.35)",
        background: completed
          ? "linear-gradient(135deg, rgba(22,101,52,0.12), rgba(5,46,22,0.08))"
          : "linear-gradient(135deg, rgba(24,24,27,0.8), rgba(15,15,15,0.9))",
        backdropFilter:"blur(12px)", position:"relative", overflow:"hidden",
      }}>
      <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:10 }}>
        <div style={{ width:32,height:32,borderRadius:"8px",display:"flex",alignItems:"center",justifyContent:"center",
          background: completed ? "linear-gradient(135deg,#166534,#15803d)" : "rgba(39,39,42,0.6)",
          border: completed ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(63,63,70,0.3)" }}>
          <Icon size={14} color={completed ? "#4ade80" : "#a1a1aa"} />
        </div>
        <span style={{ fontSize:"0.6rem",fontFamily:"monospace",textTransform:"uppercase",
          letterSpacing:"0.25em", color: completed ? "#4ade80" : "#ef4444", fontWeight:700 }}>{label}</span>
        {completed && <Check size={14} color="#4ade80" style={{ marginLeft:"auto" }} />}
      </div>
      <p style={{ fontSize:"0.85rem",fontWeight:600,color: completed ? "rgba(255,255,255,0.5)" : "#fff",
        lineHeight:1.4, textDecoration: completed ? "line-through" : "none" }}>{value}</p>
      <p style={{ fontSize:"0.6rem",color:"#52525b",marginTop:6,fontFamily:"monospace" }}>
        ~{EST_MEAL_CAL[label] || 300} kcal
      </p>
    </motion.div>
  );
};

/* ═══ Completed Task Card ═══ */
const TaskDoneCard = ({ task, category, delay = 0 }) => {
  const isWorkout = category === "workout";
  return (
    <motion.div initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }}
      transition={{ delay, duration:0.3 }}
      style={{
        padding:"1rem 1.25rem", borderRadius:"14px",
        border:"1px solid rgba(34,197,94,0.2)",
        background:"linear-gradient(135deg, rgba(22,101,52,0.1), rgba(5,46,22,0.06))",
        display:"flex", alignItems:"center", gap:"12px",
      }}>
      <div style={{ width:32,height:32,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",
        background:"linear-gradient(135deg,#16a34a,#15803d)", border:"2px solid #22c55e", flexShrink:0,
        boxShadow:"0 0 12px rgba(34,197,94,0.25)" }}>
        <Check size={14} color="#fff" strokeWidth={3} />
      </div>
      <div style={{ flex:1,minWidth:0 }}>
        <p style={{ fontSize:"0.55rem",fontFamily:"monospace",textTransform:"uppercase",
          letterSpacing:"0.2em",color:"#4ade80",fontWeight:700 }}>
          {isWorkout ? "WORKOUT" : "NUTRITION"}
        </p>
        <p style={{ fontSize:"0.85rem",fontWeight:700,color:"rgba(255,255,255,0.6)",
          textDecoration:"line-through" }}>{task}</p>
      </div>
      <span style={{ fontSize:"0.6rem",fontFamily:"monospace",color:"#4ade80",fontWeight:700 }}>✓ DONE</span>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN ACTIVITY COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */

function Activity() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(true);
  const [activityLog, setActivityLog] = useState([]);
  const [steps, setSteps] = useState(() => Number(localStorage.getItem("steps")) || 0);
  const [meals, setMeals] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [points, setPoints] = useState(0);
  const [taskProgress, setTaskProgress] = useState({});
  const [user, setUser] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!token) { setLoading(false); return; }
      const headers = { Authorization: `Bearer ${token}` };

      try {
        // Parallel fetch
        const [profileRes, fitnessRes, activityRes] = await Promise.allSettled([
          fetch(`${API}/api/user/profile`, { headers }),
          fetch(`${API}/api/fitness`, { headers }),
          fetch(`${API}/api/activity/daily`, { headers }),
        ]);

        // Profile + Plan
        if (profileRes.status === "fulfilled" && profileRes.value.ok) {
          const data = await profileRes.value.json();
          setPoints(data.points || 0);
          setUser(data.user);

          const plan = data.currentPlan || data.plans?.aesthetic || null;
          setMeals(getTodayDiet(plan));
          setWorkouts(getTodayWorkouts(plan));

          // Build task progress from ledger
          if (Array.isArray(data.taskLedger)) {
            const prog = {};
            data.taskLedger.forEach((entry) => {
              const day = entry?.day || "";
              const task = entry?.task || "";
              if (!prog[day]) prog[day] = {};
              prog[day][task] = true;
            });
            setTaskProgress(prog);
          }
        }

        // Steps
        if (fitnessRes.status === "fulfilled" && fitnessRes.value.ok) {
          const data = await fitnessRes.value.json();
          const s = data?.steps || 0;
          if (s > 0) { setSteps(s); localStorage.setItem("steps", s); }
        }

        // Activity log
        if (activityRes.status === "fulfilled" && activityRes.value.ok) {
          const data = await activityRes.value.json();
          setActivityLog(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Activity load error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  // Derive computed values
  const caloriesBurnt = Math.round(steps * CAL_PER_STEP);
  const todayKey = (() => {
    const idx = getTodayDayIndex();
    const plan = meals.length > 0 ? true : false;
    return `day ${idx + 1}`;
  })();

  const completedMeals = meals.filter((m) => {
    const key = `meal|${m.label}: ${m.value}`.toLowerCase();
    return Object.values(taskProgress).some((day) => day[key]);
  });

  const completedWorkouts = workouts.filter((w) => {
    const key = `workout|${w.name}`.toLowerCase();
    return Object.values(taskProgress).some((day) => day[key]);
  });

  const caloriesEaten = completedMeals.reduce((sum, m) => sum + (EST_MEAL_CAL[m.label] || 300), 0);

  const totalTasks = meals.length + workouts.length;
  const completedCount = completedMeals.length + completedWorkouts.length;
  const progress = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;

  const rank = getUserRank(points);
  const nextRank = getNextRank(points);
  const rankProgress = getSubTierProgress(points);

  const allCompleted = [];
  Object.entries(taskProgress).forEach(([, tasks]) => {
    Object.keys(tasks).forEach((key) => {
      const [cat, ...rest] = key.split("|");
      allCompleted.push({ category: cat, task: rest.join("|") });
    });
  });

  // ══════════ RENDER ══════════
  return (
    <div style={{
      minHeight:"100vh", background:"#000", color:"#fff",
      fontFamily:"'Inter','Segoe UI',system-ui,-apple-system,sans-serif",
      position:"relative", overflow:"hidden",
    }}>
      {/* BG Effects */}
      <div style={{ position:"fixed",inset:0,background:"radial-gradient(circle at 50% -20%, rgba(220,38,38,0.08) 0%, transparent 50%)",pointerEvents:"none" }} />
      <div style={{ position:"fixed",inset:0,background:"radial-gradient(circle at 80% 80%, rgba(139,92,246,0.04) 0%, transparent 40%)",pointerEvents:"none" }} />

      <div style={{ maxWidth:1280,margin:"0 auto",padding:"7rem 1.5rem 5rem",position:"relative",zIndex:10 }}>
        {/* Back */}
        <motion.button onClick={() => navigate(-1)} whileHover={{ x:-3 }}
          style={{ display:"inline-flex",alignItems:"center",gap:6,color:"#71717a",fontSize:"0.85rem",
            fontWeight:600,background:"none",border:"none",cursor:"pointer",marginBottom:"2rem" }}
          onMouseEnter={e => e.currentTarget.style.color="#ef4444"}
          onMouseLeave={e => e.currentTarget.style.color="#71717a"}>
          <ChevronLeft size={16} /> Back
        </motion.button>

        {/* Header */}
        <div style={{ marginBottom:"2rem" }}>
          <p style={{ color:"#ef4444",fontSize:"0.6rem",textTransform:"uppercase",letterSpacing:"0.5em",fontFamily:"monospace",fontWeight:700 }}>
            AURA Activity Dashboard
          </p>
          <h1 style={{ fontSize:"clamp(2rem,5vw,3.2rem)",fontWeight:900,fontStyle:"italic",textTransform:"uppercase",letterSpacing:"-0.03em",marginTop:"0.75rem",lineHeight:1.1 }}>
            YOUR PROGRESS
          </h1>
          <p style={{ color:"#71717a",marginTop:"0.75rem",maxWidth:600,fontSize:"0.9rem",lineHeight:1.5 }}>
            Real-time overview of your fitness journey. Every step, every meal, every rep.
          </p>
        </div>

        {loading ? (
          <div style={{ padding:"3rem",borderRadius:16,border:"1px solid rgba(63,63,70,0.3)",background:"rgba(24,24,27,0.5)",textAlign:"center",color:"#71717a" }}>
            <motion.div animate={{ rotate:360 }} transition={{ repeat:Infinity,duration:1.5,ease:"linear" }} style={{ display:"inline-block",marginBottom:"1rem" }}>
              <Zap size={24} color="#ef4444" />
            </motion.div>
            <p>Loading your activity data...</p>
          </div>
        ) : (
          <>
            {/* ═══ RANK BAR ═══ */}
            <GlassCard hover={false} style={{ marginBottom:"1.5rem",display:"grid",gridTemplateColumns:"1fr auto",gap:"1.5rem",alignItems:"center" }}>
              <div>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"1rem" }}>
                  <div>
                    <p style={{ fontSize:"0.6rem",fontFamily:"monospace",textTransform:"uppercase",letterSpacing:"0.35em",color:"#71717a",marginBottom:4 }}>Current Rank</p>
                    <p style={{ fontSize:"1.4rem",fontWeight:900,fontStyle:"italic",color:"#ef4444",display:"flex",alignItems:"center",gap:8 }}>
                      <Crown size={18} /> {rank.name} {rank.tier}
                    </p>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <p style={{ fontSize:"0.6rem",fontFamily:"monospace",textTransform:"uppercase",letterSpacing:"0.35em",color:"#71717a",marginBottom:4 }}>Total XP</p>
                    <p style={{ fontSize:"1.6rem",fontWeight:900,fontStyle:"italic",color:"#fff" }}><AnimNum value={points} /></p>
                  </div>
                </div>
                <div style={{ marginTop:"1rem" }}>
                  <div style={{ height:8,background:"rgba(39,39,42,0.6)",borderRadius:99,overflow:"hidden",border:"1px solid rgba(63,63,70,0.3)" }}>
                    <motion.div initial={{ width:0 }} animate={{ width:`${rankProgress}%` }}
                      transition={{ duration:0.8 }}
                      style={{ height:"100%",background:"linear-gradient(90deg,#7f1d1d,#ef4444,#f97316)",borderRadius:99,boxShadow:"0 0 12px rgba(239,68,68,0.4)" }} />
                  </div>
                  <p style={{ fontSize:"0.6rem",color:"#52525b",marginTop:6,fontFamily:"monospace",textTransform:"uppercase",letterSpacing:"0.15em" }}>
                    {nextRank ? `${nextRank.threshold - points} XP to ${nextRank.name}` : "Maximum rank ✨"}
                  </p>
                </div>
              </div>
              <Ring progress={progress} />
            </GlassCard>

            {/* ═══ STATS ROW ═══ */}
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:"12px",marginBottom:"2rem" }}>
              <StatCard icon={Footprints} label="Steps" value={steps} color="#3b82f6" delay={0.05} />
              <StatCard icon={Flame} label="Calories Burnt" value={caloriesBurnt} unit="kcal" color="#f97316" delay={0.1} />
              <StatCard icon={Utensils} label="Calories Eaten" value={caloriesEaten} unit="kcal" color="#22c55e" delay={0.15} />
              <StatCard icon={Zap} label="XP Today" value={completedCount * 15} unit="xp" color="#a855f7" delay={0.2} />
            </div>

            {/* ═══ MEALS SECTION ═══ */}
            {meals.length > 0 && (
              <div style={{ marginBottom:"2rem" }}>
                <h3 style={{ display:"flex",alignItems:"center",gap:8,fontSize:"0.75rem",fontWeight:900,
                  textTransform:"uppercase",letterSpacing:"0.2em",color:"#ef4444",marginBottom:"1rem" }}>
                  <Utensils size={16} /> Today's Nutrition
                  <span style={{ marginLeft:"auto",fontSize:"0.65rem",color:"#52525b",fontWeight:600 }}>
                    {completedMeals.length}/{meals.length}
                  </span>
                </h3>
                <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:"12px" }}>
                  {meals.map((m, i) => {
                    const done = completedMeals.some(c => c.label === m.label);
                    return <MealCard key={m.label} label={m.label} value={m.value} completed={done} delay={i * 0.08} />;
                  })}
                </div>
              </div>
            )}

            {/* ═══ TODAY'S COMPLETED GOALS ═══ */}
            <div style={{ marginBottom:"2rem" }}>
              <h3 style={{ display:"flex",alignItems:"center",gap:8,fontSize:"0.75rem",fontWeight:900,
                textTransform:"uppercase",letterSpacing:"0.2em",color:"#ef4444",marginBottom:"1rem" }}>
                <Target size={16} /> Completed Goals
                <span style={{ marginLeft:"auto",fontSize:"0.65rem",color:"#52525b",fontWeight:600 }}>
                  {allCompleted.length} total
                </span>
              </h3>
              {allCompleted.length > 0 ? (
                <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:"10px" }}>
                  {allCompleted.slice(0, 12).map((t, i) => (
                    <TaskDoneCard key={`${t.category}-${t.task}-${i}`} task={t.task} category={t.category} delay={i * 0.05} />
                  ))}
                </div>
              ) : (
                <GlassCard hover={false} style={{ textAlign:"center",padding:"2rem" }}>
                  <Target size={28} color="#52525b" style={{ margin:"0 auto 12px" }} />
                  <p style={{ color:"#71717a",fontSize:"0.85rem" }}>No goals completed yet today. Head to Daily Goals to start! 🚀</p>
                </GlassCard>
              )}
            </div>

            {/* ═══ ACTIVITY LOG ═══ */}
            <div>
              <h3 style={{ display:"flex",alignItems:"center",gap:8,fontSize:"0.75rem",fontWeight:900,
                textTransform:"uppercase",letterSpacing:"0.2em",color:"#ef4444",marginBottom:"1rem" }}>
                <TrendingUp size={16} /> Activity Log
              </h3>
              {activityLog.length === 0 ? (
                <GlassCard hover={false} style={{ textAlign:"center",padding:"2rem" }}>
                  <ActivityIcon size={28} color="#52525b" style={{ margin:"0 auto 12px" }} />
                  <p style={{ color:"#71717a",fontSize:"0.85rem" }}>No activity logged today</p>
                </GlassCard>
              ) : (
                <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:"12px" }}>
                  {activityLog.map((item, i) => (
                    <motion.div key={item._id || i}
                      initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }}
                      transition={{ delay: i*0.06, duration:0.3 }}
                      whileHover={{ scale:1.02, boxShadow:"0 0 20px rgba(239,68,68,0.08)" }}
                      style={{
                        padding:"1.25rem",borderRadius:"16px",
                        border:"1px solid rgba(239,68,68,0.15)",
                        background:"linear-gradient(135deg,rgba(24,24,27,0.85),rgba(15,15,15,0.95))",
                        backdropFilter:"blur(12px)",
                      }}>
                      <p style={{ fontSize:"0.55rem",fontFamily:"monospace",textTransform:"uppercase",
                        letterSpacing:"0.25em",color:"#ef4444",fontWeight:700,marginBottom:6 }}>
                        {item.type || item.category || "activity"}
                      </p>
                      <p style={{ fontSize:"0.95rem",fontWeight:700,color:"#fff" }}>
                        {item.label || item.task}
                      </p>
                      {item.value && (
                        <p style={{ fontSize:"0.8rem",color:"#f87171",fontWeight:700,marginTop:4,fontFamily:"monospace" }}>
                          {item.type === "steps" ? `${item.value} steps` : `+${item.value}`}
                        </p>
                      )}
                      <p style={{ fontSize:"0.6rem",color:"#52525b",marginTop:8,fontFamily:"monospace" }}>
                        {new Date(item.date || item.createdAt).toLocaleString()}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Activity;