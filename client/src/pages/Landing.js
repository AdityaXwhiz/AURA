import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from "framer-motion";
import Lenis from "@studio-freight/lenis";
import { 
  Dumbbell, BrainCircuit, HeartPulse, Zap, Trophy, Target, 
  Rocket, ShieldCheck, Activity, Flame, Users, Timer, Terminal, Briefcase, BarChart3, Crown,
  Menu, X // Added for mobile hamburger menu
} from "lucide-react";
import LoginModal from "../components/common/LoginModal";
import useAuth from "../hooks/useAuth";
import { getNextRank, getUserRank, getRankDisplay, getSubTierProgress } from "../utils/rank";

// 1. SUB-COMPONENT: Intelligence Feed
const TypewriterFeed = ({ progress }) => {
  const [text, setText] = useState("");
  const [index, setIndex] = useState(0);
  const messages = useMemo(() => [
    "INITIALIZING NEURAL LINK...", "SCANNING BIOMETRICS...", "OPTIMIZING SYSTEMS...", "SYSTEM STATUS: PEAK."
  ], []);
  const activeIndex = useTransform(progress, [0, 0.5, 1], [0, 1, 2]);
  
  useEffect(() => { 
    return activeIndex.on("change", (latest) => setIndex(Math.min(messages.length - 1, Math.round(latest)))); 
  }, [activeIndex, messages]);

  useEffect(() => {
    let i = 0; const fullText = messages[index] || "";
    const interval = setInterval(() => {
      setText(fullText.slice(0, i + 1)); i++;
      if (i >= fullText.length) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, [index, messages]);

  return (
    <div className="flex items-center gap-3 font-mono text-[9px] tracking-[0.2em] text-red-600/80 uppercase">
      <Terminal size={14} className="animate-pulse" />
      <span>{text}_</span>
    </div>
  );
};

// 3. SUB-COMPONENT: Human Signature (Cinematic Fade)
const HumanSignature = ({ isLoaded }) => {
  const [startSig, setStartSig] = useState(false);
  useEffect(() => { if (isLoaded) { const t = setTimeout(() => setStartSig(true), 1400); return () => clearTimeout(t); } }, [isLoaded]);
  
  return (
    <div className="relative h-64 flex items-center justify-center w-full">
      <motion.div initial={{ opacity: 1, filter: "blur(0px)" }} animate={startSig ? { opacity: 0, filter: "blur(60px)" } : { opacity: 1 }} transition={{ duration: 4.5, ease: "easeInOut" }} className="absolute inset-0 flex items-center justify-center text-center pointer-events-none">
        <h2 className="text-4xl sm:text-5xl md:text-[9rem] font-black tracking-tighter uppercase italic text-white leading-none">Redefine <br/> <span className="text-red-700">Yourself.</span></h2>
      </motion.div>
      <AnimatePresence>
        {startSig && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex items-center justify-center z-10">
            <svg viewBox="0 0 400 150" className="w-[85vw] max-w-[550px] drop-shadow-[0_0_20px_rgba(220,38,38,0.3)]">
              <motion.path d="M60 85 C 80 25, 120 25, 140 85 C 160 145, 190 145, 210 85 C 230 25, 260 25, 280 85 C 300 145, 330 145, 360 85" fill="transparent" strokeWidth="1.2" stroke="#dc2626" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 3.5, ease: "easeInOut" }} />
              <foreignObject x="0" y="0" width="400" height="150">
                <div className="w-full h-full flex items-center justify-center text-5xl sm:text-6xl md:text-[9rem] text-white font-thin italic tracking-tighter" style={{ fontFamily: "'Dancing Script', cursive", fontWeight: 200 }}>Aura.</div>
              </foreignObject>
            </svg>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// 4. SUB-COMPONENT: Progress Milestone Logic
const TrackerMilestone = ({ Icon, threshold, progress }) => {
  const isActive = useTransform(progress, [threshold - 0.05, threshold], [0, 1]);
  const color = useTransform(isActive, [0, 1], ["rgba(127, 29, 29, 0.4)", "#dc2626"]);
  const shadow = useTransform(isActive, [0, 1], ["none", "0 0 20px #dc2626"]);

  return (
    <motion.div style={{ color, boxShadow: shadow, borderColor: color }} className="bg-black border p-2 rounded-full transition-all duration-300">
      <Icon size={12} />
    </motion.div>
  );
};

const RightTracker = ({ progress }) => {
  const pathLength = useSpring(progress, { stiffness: 100, damping: 30 });
  const milestones = [
    { icon: Flame, threshold: 0.15 }, { icon: BrainCircuit, threshold: 0.35 }, 
    { icon: Timer, threshold: 0.55 }, { icon: Users, threshold: 0.75 }, { icon: Trophy, threshold: 0.95 }
  ];
  
  return (
    <div className="fixed right-10 top-[10%] h-[80vh] w-6 z-[100] hidden lg:flex flex-col items-center justify-between pointer-events-none">
      <div className="h-full w-[2px] bg-red-950/20 relative">
        <motion.div style={{ scaleY: pathLength }} className="absolute inset-0 bg-red-600 origin-top shadow-[0_0_15px_#dc2626]" />
      </div>
      <div className="absolute inset-0 flex flex-col justify-between items-center py-2">
        {milestones.map((m, i) => (
          <TrackerMilestone key={i} Icon={m.icon} threshold={m.threshold} progress={progress} />
        ))}
      </div>
    </div>
  );
};

// 5. SUB-COMPONENT: Static Neural Node
const NeuralNode = ({ step, align }) => (
  <div className={`relative z-20 w-48 h-48 md:w-64 md:h-64 rounded-full bg-zinc-950/90 backdrop-blur-xl border-4 border-red-600 flex flex-col items-center justify-center text-center p-4 md:p-6 shadow-[0_0_50px_rgba(220,38,38,0.3)] transition-all duration-500 hover:scale-105 ${align === 'left' ? '-ml-8 md:-ml-12' : align === 'right' ? '-mr-8 md:-mr-12' : ''}`}>
    <div className="text-red-600 font-black text-[7px] mb-2 tracking-[0.4em] uppercase">STAGE_{step.p}</div>
    <h4 className="text-lg md:text-xl font-black text-white uppercase italic tracking-tighter" style={{ fontFamily: 'Oswald' }}>{step.t}</h4>
    <p className="text-[9px] text-zinc-500 italic mt-3 leading-relaxed max-w-[150px]">{step.d}</p>
    {step.icon && <step.icon className="text-red-600 mt-3" size={20} />}
  </div>
);

// API base constant for backend requests
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5001";

const Landing = () => {
  // --- Authentication & Navigation ---
  const [showLogin, setShowLogin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Mobile Menu State
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // --- Mission Control Rank Profile State ---
  const [rankProfile, setRankProfile] = useState({
    points: user?.points || 0,
    rank: user?.rank || getUserRank(user?.points || 0),
    nextRank: user?.nextRank || getNextRank(user?.points || 0),
    selectedPlan: user?.selectedPlan || "aesthetic",
  });
  const [rankLoading, setRankLoading] = useState(true);

  // --- Plan Generation Loading State ---
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  // --- Scroll Progress for Cinematic Effects ---
  const { scrollYProgress } = useScroll();
  const userId = user?._id || user?.id;

  // --- High-Performance Smooth Scrolling Setup ---
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.8,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      lerp: 0.08,
      wheelMultiplier: 1.1,
    });
    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Oswald:wght@700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => {
      lenis.destroy();
    };
  }, []);

  // --- Mission Control: Load Rank Profile (Optimized) ---
  useEffect(() => {
    const loadRankProfile = async () => {
      if (!userId) {
        setRankLoading(false);
        return;
      }
      if (
        typeof user?.points === "number" &&
        user?.rank &&
        user?.nextRank &&
        user?.selectedPlan
      ) {
        setRankProfile({
          points: user.points,
          rank: user.rank,
          nextRank: user.nextRank,
          selectedPlan: user.selectedPlan,
        });
        setRankLoading(false);
        return;
      }
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/api/user/rank`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) {
          setRankLoading(false);
          return;
        }
        setRankProfile({
          points: data?.points || 0,
          rank: data?.rank || getUserRank(data?.points || 0),
          nextRank: data?.nextRank || getNextRank(data?.points || 0),
          selectedPlan: data?.user?.selectedPlan || "aesthetic",
        });
      } catch (_error) {
      } finally {
        setRankLoading(false);
      }
    };
    loadRankProfile();
  }, [userId]);

  useEffect(() => {
    if (user && showLogin) {
      setShowLogin(false);
    }
  }, [user, showLogin]);

  const progressPercent = useMemo(
    () => getSubTierProgress(rankProfile.points),
    [rankProfile.points]
  );

  const handleGeneratePlan = useCallback(async () => {
    if (!userId) {
      setShowLogin(true);
      return;
    }
    setIsGeneratingPlan(true);
    const selectedPlan = rankProfile.selectedPlan || "aesthetic";
    const payload = {
      selectedPlan,
      user: {
        name: user?.name || "Athlete",
        weight: user?.onboarding?.weight,
        goal: user?.onboarding?.goal,
        target_weight: user?.onboarding?.target_weight,
      },
    };
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/ai/plan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.message || "Failed to generate plan.");
      }
      navigate(`/dailygoals/${selectedPlan}`);
    } catch (_error) {
      alert("Sorry, something went wrong while generating your AI plan. Please try again or check your connection.");
    } finally {
      setIsGeneratingPlan(false);
    }
  }, [userId, rankProfile.selectedPlan, user, navigate]);

  const handleLogout = useCallback(() => {
    logout();
    navigate("/");
  }, [logout, navigate]);

  const handleInitializeAscension = useCallback(() => {
    if (user) {
      navigate("/dailygoals");
    } else {
      setShowLogin(true);
    }
  }, [user, navigate]);

  return (
    <div className="bg-black text-zinc-400 font-sans selection:bg-red-600 overflow-x-hidden min-h-screen relative tracking-tight">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
      <RightTracker progress={scrollYProgress} />

      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      <div className="fixed bottom-8 left-8 z-[120] bg-black/60 backdrop-blur-xl border-l-2 border-red-600 p-4 hidden md:block"><TypewriterFeed progress={scrollYProgress} /></div>

      {/* NAVBAR (High-Performance Navigation, Mobile-Optimized) */}
      <nav className="fixed w-full z-[140] flex justify-between items-center px-4 md:px-12 py-3 md:py-6 bg-black/40 backdrop-blur-3xl border-b border-red-900/10">
        <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
          <h1
            className="text-2xl sm:text-3xl md:text-4xl font-bold italic text-red-600 tracking-tight select-none drop-shadow-[0_0_2px_rgba(220,38,38,0.2)] cursor-pointer shrink-0"
            style={{ fontFamily: "'Dancing Script', cursive" }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Aura
          </h1>
          
          {user && <div className="h-5 sm:h-6 w-[1px] bg-red-950 mx-2 md:mx-4 shrink-0 hidden lg:block" />}
          
          {/* Desktop Links (Hidden on Mobile) */}
          {user && (
            <div className="hidden lg:flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
              <button onClick={() => navigate('/dailygoals')} className="hover:text-red-600 transition-colors flex items-center gap-2 group">
                <Activity size={12} className="group-hover:scale-110 transition-transform" /> Daily_Objectives
              </button>
              <button onClick={() => navigate('/onboarding')} className="hover:text-red-600 transition-colors flex items-center gap-2 group">
                <ShieldCheck size={12} className="group-hover:scale-110 group-hover:text-red-500 transition-all" /> Onboarding
              </button>
              <button onClick={() => navigate('/rank')} className="hover:text-red-600 transition-colors flex items-center gap-2 group">
                <Crown size={12} className="group-hover:animate-pulse" /> Rank_Center
              </button>
              <button onClick={() => navigate('/activity')} className="hover:text-red-600 transition-colors flex items-center gap-2 group">
                <Activity size={12} className="group-hover:scale-110 transition-transform" /> Activity
              </button>
              <button onClick={() => navigate('/adaptive-center')} className="hover:text-red-600 transition-colors flex items-center gap-2 group">
                <BrainCircuit size={12} className="group-hover:scale-110 group-hover:text-red-500 transition-all" /> Adaptive_Center
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 sm:gap-6 shrink-0 pl-2">
          {user ? (
            <div className="flex items-center gap-2 sm:gap-6">
              {/* Subject Profile Trigger */}
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 sm:gap-3 group px-2 sm:px-4 py-1.5 sm:py-2 border border-red-900/20 bg-zinc-950/50 hover:border-red-600 transition-all max-w-[130px] sm:max-w-[200px]"
              >
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-600 rounded-sm flex items-center justify-center text-black shadow-[0_0_10px_rgba(220,38,38,0.3)] shrink-0">
                  <Users size={14} className="sm:w-4 sm:h-4" />
                </div>
                <div className="text-left flex flex-col justify-center min-w-0 overflow-hidden">
                  <p className="text-[7px] sm:text-[8px] text-zinc-600 font-bold uppercase leading-none mb-1 truncate">
                    {getRankDisplay(rankProfile.points)}
                  </p>
                  <p className="text-[9px] sm:text-[10px] text-white font-black uppercase tracking-widest leading-none flex items-center gap-1 sm:gap-1.5 truncate" style={{ fontFamily: 'Oswald' }}>
                    <Crown size={8} className="sm:w-[10px] sm:h-[10px] text-red-500 drop-shadow-[0_0_8px_rgba(220,38,38,0.8)] shrink-0" />
                    <span className="truncate">{user.name}</span>
                  </p>
                </div>
              </button>
              
              {/* Global Exit (Desktop only) */}
              <button onClick={handleLogout} className="hidden lg:block p-1.5 sm:p-2 text-zinc-600 hover:text-red-600 transition-colors" title="Terminate_Session">
                <Zap size={16} className="sm:w-[18px] sm:h-[18px]" />
              </button>

              {/* Hamburger Menu Toggle (Mobile only) */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                className="lg:hidden p-1.5 sm:p-2 text-zinc-600 hover:text-red-600 transition-colors shrink-0"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowLogin(true)}
              className="px-6 sm:px-10 py-2 sm:py-2.5 bg-red-600 text-black font-black text-[9px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.3em] uppercase shadow-[0_0_25px_rgba(220,38,38,0.3)] hover:bg-red-700 transition-all shrink-0"
            >
              LINK_START
            </button>
          )}
        </div>
      </nav>

      {/* MOBILE DROPDOWN MENU */}
      <AnimatePresence>
        {isMobileMenuOpen && user && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-[52px] sm:top-[68px] left-0 w-full bg-black/95 backdrop-blur-3xl border-b border-red-900/20 z-[135] lg:hidden flex flex-col p-6 gap-6 font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-400 shadow-2xl"
          >
            <button onClick={() => { navigate('/dailygoals'); setIsMobileMenuOpen(false); }} className="hover:text-red-600 transition-colors flex items-center gap-4 text-left w-full"><Activity size={16} /> Daily_Objectives</button>
            <button onClick={() => { navigate('/onboarding'); setIsMobileMenuOpen(false); }} className="hover:text-red-600 transition-colors flex items-center gap-4 text-left w-full"><ShieldCheck size={16} /> Onboarding</button>
            <button onClick={() => { navigate('/rank'); setIsMobileMenuOpen(false); }} className="hover:text-red-600 transition-colors flex items-center gap-4 text-left w-full"><Crown size={16} /> Rank_Center</button>
            <button onClick={() => { navigate('/activity'); setIsMobileMenuOpen(false); }} className="hover:text-red-600 transition-colors flex items-center gap-4 text-left w-full"><Activity size={16} /> Activity</button>
            <button onClick={() => { navigate('/adaptive-center'); setIsMobileMenuOpen(false); }} className="hover:text-red-600 transition-colors flex items-center gap-4 text-left w-full"><BrainCircuit size={16} /> Adaptive_Center</button>
            <div className="h-[1px] w-full bg-red-900/20 my-2" />
            <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="text-red-500 hover:text-red-400 transition-colors flex items-center gap-4 text-left w-full"><Zap size={16} /> Terminate_Session</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO */}
      <section className="relative min-h-screen flex flex-col justify-center items-center text-center px-4 overflow-hidden z-10">
        <HumanSignature isLoaded={true} />
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} transition={{ duration: 0.8 }} className="text-[10px] text-red-600 font-bold tracking-[0.8em] uppercase mt-12">Biological Engineering & Discipline</motion.p>
      </section>

      {/* Mission Control: Rank Status & Plan Generation */}
      {user && (
        <section className="py-16 px-4 sm:px-6 relative z-20">
          <div className="max-w-6xl mx-auto bg-zinc-950/80 border border-red-900/30 p-6 md:p-10">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 font-mono">Main Dashboard</p>
                <h3 className="text-3xl sm:text-4xl font-black italic text-white mt-3 tracking-tighter">Mission Control</h3>
                {/* Mission Control Rank Section: Loading Placeholder */}
                {rankLoading ? (
                  <div className="mt-5 space-y-2 text-sm animate-pulse">
                    <div className="h-4 w-32 bg-zinc-800 rounded" />
                    <div className="h-4 w-40 bg-zinc-800 rounded" />
                  </div>
                ) : (
                  <div className="mt-5 space-y-2 text-sm">
                    <p className="text-zinc-300">Points: <span className="font-black">{rankProfile.points}</span></p>
                    <p className="text-zinc-300">
                      Rank: <span className="font-black text-red-500">{getRankDisplay(rankProfile.points)}</span>
                    </p>
                  </div>
                )}
              </div>
              <div>
                <div className="p-5 border border-red-900/30 bg-black/40 rounded-sm shadow-[0_0_25px_rgba(220,38,38,0.15)]">
                  <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-500 font-mono">Rank Progress</p>
                  <div className="mt-3 h-2 bg-zinc-900 border border-zinc-800 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.7 }}
                      className="h-full bg-gradient-to-r from-red-900 via-red-600 to-red-400"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-3 uppercase tracking-widest font-mono">
                    {rankLoading
                      ? <span className="animate-pulse">Loading...</span>
                      : rankProfile.nextRank
                        ? `${rankProfile.nextRank.threshold - rankProfile.points} points to ${rankProfile.nextRank.name}`
                        : "Maximum rank reached"}
                  </p>
                </div>
                <div className="mt-5 grid sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => navigate("/dailygoals")}
                    className="px-4 py-3 bg-zinc-900 border border-zinc-800 text-xs uppercase tracking-widest hover:border-red-600 transition"
                  >
                    Daily Objectives
                  </button>
                  <button
                    onClick={handleGeneratePlan}
                    className="px-4 py-3 bg-red-600 text-black font-black text-xs uppercase tracking-widest hover:bg-red-700 transition"
                    disabled={isGeneratingPlan}
                  >
                    {isGeneratingPlan ? "Generating AI Plan..." : "Generate New Plan"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SYSTEM ARCHITECT */}
      <section className="py-24 flex items-center justify-center relative bg-zinc-950/20 z-10 px-4 md:px-12 overflow-hidden">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 md:gap-24 items-center">
          <motion.div whileInView={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} className="relative mx-auto w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] md:w-[480px] md:h-[480px] flex items-center justify-center border border-red-900/10 rounded-full shadow-2xl">
            <div className="p-10 md:p-16 bg-black border border-red-600 rounded-full shadow-2xl shadow-red-950/20"><Activity size={40} className="md:w-[50px] md:h-[50px] text-red-600 animate-pulse" /></div>
            <div className="absolute top-0 p-3 md:p-4 bg-zinc-900 border border-red-900 rounded-xl"><Rocket size={18} className="md:w-[20px] md:h-[20px] text-red-600" /></div>
            <div className="absolute bottom-0 p-3 md:p-4 bg-zinc-900 border border-red-900 rounded-xl"><HeartPulse size={18} className="md:w-[20px] md:h-[20px] text-red-600" /></div>
            <div className="absolute left-0 p-3 md:p-4 bg-zinc-900 border border-red-900 rounded-xl"><Target size={18} className="md:w-[20px] md:h-[20px] text-red-600" /></div>
            <div className="absolute right-0 p-3 md:p-4 bg-zinc-900 border border-red-900 rounded-xl"><Dumbbell size={18} className="md:w-[20px] md:h-[20px] text-red-600" /></div>
          </motion.div>
          <div className="space-y-6 md:space-y-10 text-center lg:text-left">
             <h3 className="text-5xl sm:text-6xl md:text-8xl font-black uppercase italic text-white tracking-tighter" style={{ fontFamily: 'Oswald' }}>SYSTEM <br className="hidden lg:block"/> <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-red-900">ARCHITECT.</span></h3>
             <p className="text-sm text-zinc-500 max-w-sm mx-auto lg:mx-0 italic">Optimizing biological logic for high-achievers like Aditya Singh.</p>
          </div>
        </div>
      </section>

      {/* PROTOCOLS (Left/Right Fly-ins) */}
      <section className="py-12 px-4 md:px-12 z-10 relative overflow-hidden space-y-12">
        {[
          { t: "Neural Coach", side: "left", img: "https://images.unsplash.com/photo-1675373022919-88c244814e7c?q=80&w=1200", icon: <ShieldCheck size={24} />, d: "Monitoring metabolic feedback for a 21-year-old baseline." },
          { t: "Executive Plans", side: "right", img: "https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?q=80&w=1200", icon: <Briefcase size={24} />, d: "Professional regimens tailored for the Indian market." },
          { t: "Tactical UI", side: "left", img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200", icon: <Zap size={24} />, d: "Zero-friction environments for React and SQL modules." },
          { t: "Biological Tracking", side: "right", icon: <BarChart3 size={24} />, img: "https://images.unsplash.com/photo-1530210124550-912dc1381cb8?q=80&w=1200", d: "Targeting 85kg from a 96kg baseline with macro precision." }
        ].map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: card.side === "left" ? -150 : 150 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 1, ease: "circOut" }} className={`flex flex-col ${card.side === "right" ? "md:flex-row-reverse" : "md:flex-row"} items-center gap-6 md:gap-8 w-full max-w-6xl mx-auto mb-16`}>
            <div className="relative w-full md:w-[480px] aspect-[16/9] md:aspect-[21/9] overflow-hidden border border-red-900/30 shrink-0">
                <img src={card.img} alt={card.t} className="w-full h-full object-cover grayscale brightness-[0.4]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60" />
            </div>
            <div className="flex-1 space-y-4 px-4 md:px-6 text-left w-full">
              <div className="flex items-center gap-4 text-red-600"><div className="p-3 bg-red-600/10 border border-red-600/30 rounded">{card.icon}</div><h4 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter text-white" style={{ fontFamily: 'Oswald' }}>{card.t}</h4></div>
              <p className="text-[11px] text-zinc-500 italic max-w-md">"{card.d}"</p>
            </div>
          </motion.div>
        ))}
      </section>

      {/* EVOLUTION */}
      <section className="py-24 md:py-32 bg-zinc-950/20 z-10 relative px-4 overflow-hidden min-h-screen flex flex-col items-center">
        <div className="relative mb-16 md:mb-24 w-fit px-8 sm:px-20 py-8 md:py-10 border border-red-900/10 bg-black/40 text-center">
            <div className="absolute inset-0 pointer-events-none opacity-[0.08] grayscale overflow-hidden"><img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1600" className="w-full h-full object-cover" alt="fitness" /></div>
            <h2 className="text-5xl sm:text-7xl md:text-[9rem] font-black uppercase italic text-center text-white tracking-tighter relative z-10" style={{ fontFamily: 'Oswald' }}>THE <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-red-900">EVOLUTION.</span></h2>
        </div>
        
        {/* Desktop Evolution Timeline */}
        <div className="hidden md:block max-w-5xl mx-auto relative w-full h-[500px]">
          <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none" viewBox="0 0 1000 500" fill="none">
            <path d="M150,100 L400,350 L650,100 L850,250" stroke="#dc2626" strokeWidth="2" opacity="0.2" strokeDasharray="10 10" />
          </svg>
          <div className="absolute top-[100px] left-[15%] transform -translate-x-1/2 -translate-y-1/2"><NeuralNode align="left" step={{ p: "01", t: "BIOMETRIC ACTIVATION", d: "Baseline sync for Aditya Singh." }} /></div>
          <div className="absolute top-[350px] left-[40%] transform -translate-x-1/2 -translate-y-1/2"><NeuralNode align="right" step={{ p: "30", t: "METABOLIC REWIRING", d: "Weight tracking from 96kg." }} /></div>
          <div className="absolute top-[100px] left-[65%] transform -translate-x-1/2 -translate-y-1/2"><NeuralNode align="left" step={{ p: "90", t: "ELITE COMMAND", d: "React & Python mastery." }} /></div>
          <div className="absolute top-[250px] left-[85%] transform -translate-x-1/2 -translate-y-1/2">
             <div className="relative z-20 w-72 h-72 rounded-full bg-red-600/10 border-4 border-red-600 flex flex-col items-center justify-center text-center p-8 backdrop-blur-xl shadow-[0_0_80px_rgba(220,38,38,0.4)] hover:scale-105 transition-transform duration-500">
               <Crown size={50} className="text-red-600 mx-auto animate-pulse" /><h4 className="text-3xl font-black text-white italic mt-4" style={{ fontFamily: 'Oswald' }}>AURA GOD</h4><p className="text-[9px] text-red-600 font-bold uppercase mt-3">Biological Peak</p>
             </div>
          </div>
        </div>

        {/* Mobile Evolution Timeline */}
        <div className="md:hidden relative space-y-12 w-full max-w-md mx-auto flex flex-col items-center py-10">
          {/* Vertical connection line for mobile */}
          <div className="absolute top-10 bottom-10 left-1/2 w-[2px] bg-red-900/30 -translate-x-1/2 z-0" />
          <div className="relative z-10">
            <NeuralNode align="center" step={{ p: "01", t: "BIOMETRIC ACTIVATION", d: "Baseline sync for Aditya Singh." }} />
          </div>
          <div className="relative z-10">
            <NeuralNode align="center" step={{ p: "30", t: "METABOLIC REWIRING", d: "Weight tracking from 96kg." }} />
          </div>
          <div className="relative z-10">
            <NeuralNode align="center" step={{ p: "90", t: "ELITE COMMAND", d: "React & Python mastery." }} />
          </div>
          <div className="relative z-10 w-48 h-48 sm:w-52 sm:h-52 rounded-full bg-red-600/10 border-4 border-red-600 flex flex-col items-center justify-center text-center p-6 backdrop-blur-xl shadow-[0_0_50px_rgba(220,38,38,0.4)]">
             <Crown size={32} className="text-red-600 mx-auto animate-pulse" />
             <h4 className="text-2xl sm:text-3xl font-black text-white italic mt-3" style={{ fontFamily: 'Oswald' }}>AURA GOD</h4>
             <p className="text-[7px] sm:text-[9px] text-red-600 font-bold uppercase mt-2">Biological Peak</p>
          </div>
        </div>
      </section>

      {/* MASTERY */}
      <section className="py-24 md:py-40 px-4 sm:px-12 z-10 relative">
        <h2 className="text-center text-5xl md:text-6xl font-black uppercase italic text-white mb-16 md:mb-32 tracking-tighter" style={{ fontFamily: 'Oswald' }}>HALL OF <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-red-900">MASTERY.</span></h2>
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 md:gap-20">
          {[
            { name: "Aryan K.", story: "Hit 85kg goal in Dec 2025." },
            { name: "Megha S.", story: "Focus refined through nutrition." }
          ].map((user, i) => (
            <motion.div key={i} initial={{ y: 80, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} className="relative p-8 md:p-16 bg-zinc-950/60 border-l-4 border-orange-600 shadow-2xl group overflow-hidden">
               <motion.div initial={{ y: "100%" }} whileInView={{ y: "0%" }} className="absolute inset-0 bg-gradient-to-t from-orange-600/10 to-transparent pointer-events-none" />
               <div className="relative z-10">
                 <p className="text-base md:text-lg italic mb-8 md:mb-10 text-zinc-400 leading-relaxed font-medium">"{user.story}"</p>
                 <div className="grid grid-cols-2 gap-4 h-24 md:h-32 mb-8 border border-orange-900/10 bg-black/40">
                    <div className="flex flex-col items-center justify-center border-r border-orange-900/10"><Users size={20} className="text-orange-900/30" /></div>
                    <div className="flex flex-col items-center justify-center text-orange-600"><Timer size={20} className="text-orange-500" /></div>
                 </div>
                 <div className="flex items-center gap-5">
                   <div className="w-8 h-8 md:w-10 md:h-10 bg-orange-600 rounded shrink-0" />
                   <div><div className="text-white font-black text-sm uppercase">{user.name}</div><div className="text-orange-600 text-[8px] md:text-[9px] font-bold uppercase tracking-widest mt-1">Elite Performance</div></div>
                 </div>
               </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CLIMAX */}
      <section className="min-h-screen flex flex-col justify-center items-center text-center px-4 sm:px-6 z-10 relative">
        <Trophy size={100} className="md:w-[140px] md:h-[140px] text-red-600 mb-8 md:mb-12 drop-shadow-[0_0_40px_#dc2626] animate-bounce" />
        <h2 className="text-5xl sm:text-7xl md:text-[14rem] font-black mb-12 md:mb-16 uppercase italic text-white tracking-tighter" style={{ fontFamily: 'Oswald' }}>FORGE A <br className="hidden md:block"/> <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-red-900">BETTER LIFE.</span></h2>
        <button
          onClick={handleInitializeAscension}
          className="px-8 sm:px-16 md:px-24 py-6 md:py-10 bg-red-600 text-black font-black text-2xl md:text-4xl uppercase hover:bg-red-700 transition-all shadow-2xl transform hover:scale-105 w-full sm:w-auto"
        >
          Initialize Ascension
        </button>
      </section>

      <footer className="py-16 md:py-24 text-center opacity-10 border-t border-red-900/10 z-10 relative"><p className="text-[8px] md:text-[10px] font-bold tracking-[2em] md:tracking-[3.5em] uppercase text-red-600">AURA Neural Systems // 2026</p></footer>
      <AnimatePresence>{showLogin && <LoginModal close={() => setShowLogin(false)} />}</AnimatePresence>
    </div>
  );
};

export default Landing;