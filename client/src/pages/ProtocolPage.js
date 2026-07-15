import React, { useState, useMemo, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, Sword, Activity, Clock, 
  Target, Zap, Cpu, Shield, ArrowRight,
  User, Trophy, BarChart3, Gauge, Flame
} from "lucide-react";

// --- Sub-Component: Cinematic AI Loading Sequence ---
const CinematicLoader = ({ onFinish }) => {
  const [step, setStep] = useState(0);
  const lines = useMemo(() => [
    "Initializing AURA Neural Link...",
    "Analyzing subject biometric profile...",
    "Mapping metabolic pathways...",
    "Calculating optimal hypertrophy response...",
    "Transformation protocol locked."
  ], []);

  useEffect(() => {
    if (step < lines.length) {
      const timer = setTimeout(() => setStep(s => s + 1), 700);
      return () => clearTimeout(timer);
    } else {
      const finishTimer = setTimeout(onFinish, 800);
      return () => clearTimeout(finishTimer);
    }
  }, [step, lines.length, onFinish]);

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4 font-mono bg-black">
      <div className="w-full max-w-md space-y-3 px-6 z-10">
        {lines.slice(0, step + 1).map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`text-xs tracking-[0.2em] ${i === step ? "text-red-600" : "text-zinc-600"}`}
          >
            {"> "} {line.toUpperCase()}
            {i === step && <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }}>_</motion.span>}
          </motion.div>
        ))}
      </div>
      <div className="absolute inset-0 bg-radial-gradient(circle_at_center,rgba(220,38,38,0.03)_0%,transparent_70%) pointer-events-none" />
    </div>
  );
};

const ProtocolPage = () => {
  const { type } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [loadState, setLoadState] = useState("loading"); // loading, ready, active
  const [aiPlan, setAiPlan] = useState(null);
  const [aiLoading, setAiLoading] = useState(true);
  const normalizedPlan = useMemo(() => {
    if (!aiPlan) return null;

    // if backend stored raw string
    if (aiPlan.raw) {
      try {
        const cleaned = aiPlan.raw
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();
        return JSON.parse(cleaned);
      } catch {
        // if JSON parsing fails, return raw string so we can at least display it
        return aiPlan.raw;
      }
    }

    return aiPlan;
  }, [aiPlan]);
  
  // Simulated User Data (In production, pull from Context/Backend)

  // 🔐 Logged-in user
  let storedUser = null;

try {
  storedUser = JSON.parse(localStorage.getItem("auraUser"));
} catch {
  storedUser = null;
}
  const userId = storedUser?._id || storedUser?.id;


  // basic user display data
  const userData = {
  name: storedUser?.name?.toUpperCase() || "USER",
  goal: storedUser?.onboarding?.goal || "TRANSFORMATION",
  xp: storedUser?.points || 0,
  level: Math.max(1, Math.floor((storedUser?.points || 0) / 100) + 1),
};
const goToDailyGoals = () => {
  navigate("/dailygoals");
};



  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found");
          setAiLoading(false);
          setLoadState("ready");
          return;
        }

        console.log("⚡ Calling AI for plan...");
        console.log("🔥 CALLING AI NOW");

        const API_BASE =

  process.env.REACT_APP_API_URL || "https://aura-backend-nxps.onrender.com";

const res = await fetch(

  `${API_BASE}/api/ai/plan`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            selectedPlan: type,
            user: {
              name: storedUser?.name || "",
              weight: storedUser?.onboarding?.weight,
              goal: storedUser?.onboarding?.goal,
              target_weight: storedUser?.onboarding?.target_weight,
            }
          })
        });

        if (!res.ok) {
          console.error("API ERROR:", res.status);
          setAiLoading(false);
          return;
        }

        const data = await res.json();
        console.log("AI RESPONSE:", data);

        if (data.plan) {
  const planData = data.plan.plan ? data.plan.plan : data.plan;

  console.log("Normalized Plan:", planData);

  try {
    const verifyRes = await fetch(
  `${API_BASE}/api/ai/plan`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const savedPlan = await verifyRes.json();
    console.log("PLAN VERIFIED IN DB:", savedPlan);
  } catch (err) {
    console.error("Plan verification failed:", err);
  }

  setAiPlan(planData);
}

        setAiLoading(false);
      } catch (err) {
        console.log("AI error:", err);
        setAiLoading(false);
      }
    };

    fetchPlan();
  }, [type]);


  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-red-600 relative overflow-hidden">
      {/* Cinematic Background Glow */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(220,38,38,0.1)_0%,transparent_50%)] pointer-events-none" />
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] pointer-events-none" />

      <AnimatePresence mode="wait">
        {loadState === "loading" && (
          <motion.div key="loader" exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.8 }}>
            <CinematicLoader onFinish={() => setLoadState("ready")} />
          </motion.div>
        )}

        {loadState === "ready" && (
          <motion.div 
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-screen flex flex-col items-center justify-center text-center px-6 relative z-10"
          >
            {/* Subject Identity Header */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-12 left-12 text-left"
            >
              <p className="text-zinc-500 font-mono text-[9px] uppercase tracking-[0.6em] mb-1">Subject_Verified</p>
              <h3 className="text-xl font-black italic text-white tracking-tighter">{userData.name}</h3>
              <p className="text-red-600 font-mono text-[9px] uppercase tracking-widest mt-1">Goal // {userData.goal}</p>
            </motion.div>

            <motion.h1 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="text-7xl md:text-[9rem] font-black italic uppercase tracking-tighter leading-none mb-12"
            >
              YOUR PROTOCOL <br /> 
              <span className="text-red-600 drop-shadow-[0_0_30px_rgba(220,38,38,0.3)]">PROTOCOL</span> IS READY.
            </motion.h1>

            <motion.button
              whileHover={{ scale: 1.05, letterSpacing: "0.1em" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
  if (!aiPlan) {
    alert(
      "Your AURA protocol is still being generated. Please wait."
    );
    return;
  }

  setLoadState("active");
}}
              className="px-16 py-6 border border-white text-white font-black text-xl uppercase italic hover:bg-white hover:text-black transition-all duration-500"
            >
              Unlock My Protocol <ArrowRight className="inline ml-4" />
            </motion.button>
          </motion.div>
        )}

        {loadState === "active" && (
          <>
          
          {!aiLoading && typeof normalizedPlan === "string" && (
            <div className="mb-12 bg-black border border-red-600/30 p-8">
              <h3 className="text-red-600 font-black mb-6 uppercase tracking-widest">
                Raw AI Plan
              </h3>
              <pre className="text-sm text-zinc-400 whitespace-pre-wrap font-mono">
                {normalizedPlan}
              </pre>
            </div>
          )}
          {/* STRUCTURED AI PLAN OUTPUT */}
          {!aiLoading && normalizedPlan?.overview && (
            <div className="mb-12 bg-zinc-950 border border-zinc-900 p-8">
              <h3 className="text-red-600 font-black mb-6 uppercase tracking-widest">
                Transformation Overview
              </h3>

              <div className="grid md:grid-cols-2 gap-6 text-sm">
                <div>
                  <p className="text-zinc-500 uppercase text-xs">Goal</p>
                  <p className="text-xl font-black italic">{normalizedPlan.overview.goal}</p>
                </div>

                <div>
                  <p className="text-zinc-500 uppercase text-xs">Duration</p>
                  <p className="text-xl font-black italic">{normalizedPlan.overview.duration}</p>
                </div>

                <div>
                  <p className="text-zinc-500 uppercase text-xs">Training Days</p>
                  <p className="text-xl font-black italic">{normalizedPlan.overview.trainingDays}</p>
                </div>

                <div>
                  <p className="text-zinc-500 uppercase text-xs">Target Weight</p>
                  <p className="text-xl font-black italic text-red-600">
                    {normalizedPlan.overview.targetWeight}
                  </p>
                </div>
              </div>
            </div>
          )}

          {!aiLoading && normalizedPlan?.weeklyWorkout && (
            <div className="mb-12">
              <h3 className="text-white font-black uppercase tracking-widest mb-8">
                Weekly Deployment
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                {normalizedPlan.weeklyWorkout.map((day, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-zinc-950 border border-zinc-900 p-6 rounded-xl hover:border-red-600/40 transition"
                  >
                    <h4 className="text-lg font-black italic uppercase text-red-600 mb-2">
                      {day.day}
                    </h4>

                    <p className="text-zinc-400 mb-4">{day.focus}</p>

                    <div className="space-y-2">
                      {day.exercises.map((ex, j) => (
                        <div
                          key={j}
                          className="flex justify-between bg-black/40 p-2 rounded-lg text-sm"
                        >
                          <span>{ex.name}</span>
                          <span className="text-zinc-500">
                            {ex.sets} × {ex.reps}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {!aiLoading && normalizedPlan?.diet && (
            <div className="mb-12">
              <h3 className="text-white font-black uppercase tracking-widest mb-8">
                Nutritional Strategy
              </h3>

              {normalizedPlan.diet.map((d, i) => (
                <div key={i} className="mb-6 bg-zinc-950 border border-zinc-900 p-6">
                  <h4 className="text-red-600 font-black mb-4">{d.day}</h4>
                  <p>Breakfast: {d.breakfast}</p>
                  <p>Lunch: {d.lunch}</p>
                  <p>Dinner: {d.dinner}</p>
                  <p>Snacks: {d.snacks}</p>
                </div>
              ))}
            </div>
          )}

          {!aiLoading && normalizedPlan?.tips && (
            <div className="bg-zinc-950 border border-zinc-900 p-8 mb-12">
              <h3 className="text-red-600 font-black mb-6 uppercase tracking-widest">
                AURA Tactical Notes
              </h3>

              {normalizedPlan.tips.map((tip, i) => (
                <p key={i} className="text-zinc-400 mb-3">
                  • {tip}
                </p>
              ))}
            </div>
          )}
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto px-8 pt-32 pb-24 relative z-10"
          >
            {/* PREMIUM HEADER WITH XP SYSTEM */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-20 border-b border-zinc-900 pb-12">
               <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-zinc-900 border border-red-600 flex items-center justify-center rounded-sm rotate-45 shadow-[0_0_20px_rgba(220,38,38,0.2)]">
                     <Trophy size={28} className="text-red-600 -rotate-45" />
                  </div>
                  <div>
                     <p className="text-red-600 font-mono text-[10px] uppercase tracking-[0.5em] mb-1">Rank: LEVEL_{String(userData.level).padStart(2, "0")}</p>
                     <h2 className="text-5xl font-black italic uppercase tracking-tighter">Level {userData.level}</h2>
                  </div>
               </div>

               <button
                 onClick={goToDailyGoals}
                 className="px-6 py-3 border border-red-600 text-red-600 font-black uppercase tracking-wider hover:bg-red-600 hover:text-white transition-all"
               >
                 Open Daily Goals
               </button>
               <div className="w-full md:w-96">
                  <div className="flex justify-between text-[10px] uppercase font-bold mb-3 text-zinc-500 font-mono">
                    <span>Transformation XP</span>
                    <span className="text-white">{userData.xp} / 1000</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                     <motion.div 
                        initial={{ width: 0 }} 
                        animate={{
  width: `${Math.min(((userData.xp % 1000) / 1000) * 100, 100)}%`,
}}
                        transition={{ duration: 2, ease: "circOut" }}
                        className="h-full bg-gradient-to-r from-red-900 to-red-600 shadow-[0_0_10px_red]" 
                     />
                  </div>
               </div>
            </header>

            <div className="grid lg:grid-cols-12 gap-12">
               {/* LEFT: MISSION & PREDICTION */}
               <div className="lg:col-span-4 space-y-8">
                  <section className="bg-zinc-950 border border-zinc-900 p-8 relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-4 opacity-10"><BarChart3 size={60} /></div>
                     <h3 className="text-[11px] font-black text-red-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Gauge size={14} /> AI_Future_Simulation
                     </h3>
                     <div className="grid grid-cols-2 gap-6">
                        <div>
                           <p className="text-[9px] text-zinc-500 uppercase font-bold">Projected Weight</p>
                           <p className="text-2xl font-black italic text-red-600">
                             {normalizedPlan?.overview?.targetWeight || "-"}
                           </p>
                        </div>
                        <div>
                           <p className="text-[9px] text-zinc-500 uppercase font-bold">Estimated Loss</p>
                           <p className="text-2xl font-black italic text-red-600">-</p>
                        </div>
                        <div className="col-span-2 pt-4 border-t border-zinc-900">
                           <p className="text-[9px] text-zinc-500 uppercase font-bold">Physique Outcome</p>
                           <p className="text-xl font-black italic uppercase tracking-widest text-white">{normalizedPlan?.overview?.goal || "-"}</p>
                        </div>
                     </div>
                  </section>

                  <section className="p-8 bg-zinc-950 border border-zinc-900">
                    <h3 className="text-[11px] font-black text-white uppercase tracking-widest mb-6">Current_Objective</h3>
                    <p className="text-sm text-zinc-400 italic font-serif leading-relaxed">
                      "{normalizedPlan?.overview?.goal || "AI Generated Plan"} in progress."
                    </p>
                  </section>
               </div>

               {/* RIGHT: DAILY DEPLOYMENT */}
               <div className="lg:col-span-8 bg-zinc-950 border border-zinc-900 rounded-sm overflow-hidden">
                  <div className="bg-zinc-900/40 p-8 border-b border-zinc-800 flex justify-between items-center">
                     <h2 className="text-xs font-black uppercase tracking-[0.4em] flex items-center gap-3">
                        <Clock size={18} className="text-red-600" /> Operational_Timeline
                     </h2>
                     <Flame size={18} className="text-orange-600 animate-pulse" />
                  </div>
                  <div className="p-10 space-y-6">
                    {normalizedPlan?.weeklyWorkout.map((day, i) => (
                      <motion.div 
                        key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-10 p-8 bg-black border border-zinc-900 hover:border-red-900/40 transition-all group cursor-pointer"
                      >
                         <span className="text-zinc-600 font-mono text-sm">Day {i+1}</span>
                         <div className="flex-1">
                            <h4 className="text-xl font-black uppercase italic tracking-widest text-white group-hover:text-red-600 transition-colors">{day.focus}</h4>
                         </div>
                         <span className="text-xs font-black text-red-600 font-mono">{day.exercises.length} exercises</span>
                      </motion.div>
                    ))}
                  </div>
               </div>
            </div>
            <div className="flex justify-center mt-16">
              <button
                onClick={goToDailyGoals}
                className="px-10 py-4 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest rounded-lg transition-all"
              >
                Deploy To Daily Goals →
              </button>
            </div>
          </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProtocolPage;