import React, { useState, useEffect, useMemo } from "react";
import { motion, useScroll, useSpring, useTransform, AnimatePresence } from "framer-motion";
import Lenis from "@studio-freight/lenis";
import { 
  Dumbbell, BrainCircuit, HeartPulse, Zap, Trophy, Target, 
  Rocket, ShieldCheck, Activity, Flame, Users, Timer, Terminal, Briefcase, BarChart3, Mail, Info, Crown
} from "lucide-react";
import LoginModal from "../components/LoginModal";

// 1. SUB-COMPONENT: Intelligence Feed
const TypewriterFeed = ({ progress }) => {
  const [text, setText] = useState("");
  const [index, setIndex] = useState(0);
  const messages = useMemo(() => [
    "INITIALIZING NEURAL LINK...", "SCANNING BIOMETRICS...", "OPTIMIZING PROTOCOLS...", "SYSTEM STATUS: PEAK."
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

// 2. SUB-COMPONENT: Gate-Style Loading Screen
const LoadingScreen = () => (
  <motion.div className="fixed inset-0 z-[500] flex pointer-events-none overflow-hidden">
    <motion.div initial={{ x: 0 }} exit={{ x: "-100%" }} transition={{ duration: 1.2, ease: [0.85, 0, 0.15, 1] }} className="w-1/2 h-full bg-black border-r border-red-900/20 pointer-events-auto shadow-[10px_0_40px_rgba(0,0,0,1)]" />
    <motion.div initial={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 1.2, ease: [0.85, 0, 0.15, 1] }} className="w-1/2 h-full bg-black border-l border-red-900/20 pointer-events-auto shadow-[-10px_0_40px_rgba(0,0,0,1)]" />
    <motion.div exit={{ opacity: 0, scale: 0.9 }} className="absolute inset-0 z-[510] flex flex-col items-center justify-center pointer-events-none">
      <h1 className="text-2xl font-black italic text-red-900 tracking-tighter" style={{ fontFamily: "'Dancing Script', cursive" }}>Aura</h1>
      <div className="w-24 h-[1px] bg-red-900/30 mt-4 relative overflow-hidden">
        <motion.div animate={{ x: ["-100%", "100%"] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} className="absolute inset-0 bg-red-600" />
      </div>
      <p className="mt-4 font-mono text-[7px] tracking-[0.6em] text-white uppercase">Establishing Baseline...</p>
    </motion.div>
  </motion.div>
);

// 3. SUB-COMPONENT: Human Signature (Cinematic Fade)
const HumanSignature = ({ isLoaded }) => {
  const [startSig, setStartSig] = useState(false);
  useEffect(() => { if (isLoaded) { const t = setTimeout(() => setStartSig(true), 1400); return () => clearTimeout(t); } }, [isLoaded]);
  
  return (
    <div className="relative h-64 flex items-center justify-center w-full">
      <motion.div initial={{ opacity: 1, filter: "blur(0px)" }} animate={startSig ? { opacity: 0, filter: "blur(60px)" } : { opacity: 1 }} transition={{ duration: 4.5, ease: "easeInOut" }} className="absolute inset-0 flex items-center justify-center text-center pointer-events-none">
        <h2 className="text-6xl md:text-[9rem] font-black tracking-tighter uppercase italic text-white leading-none">Redefine <br/> <span className="text-red-700">Yourself.</span></h2>
      </motion.div>
      <AnimatePresence>
        {startSig && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex items-center justify-center z-10">
            <svg viewBox="0 0 400 150" className="w-[85vw] max-w-[550px] drop-shadow-[0_0_20px_rgba(220,38,38,0.3)]">
              <motion.path d="M60 85 C 80 25, 120 25, 140 85 C 160 145, 190 145, 210 85 C 230 25, 260 25, 280 85 C 300 145, 330 145, 360 85" fill="transparent" strokeWidth="1.2" stroke="#dc2626" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 3.5, ease: "easeInOut" }} />
              <foreignObject x="0" y="0" width="400" height="150">
                <div className="w-full h-full flex items-center justify-center text-7xl md:text-[9rem] text-white font-thin italic tracking-tighter" style={{ fontFamily: "'Dancing Script', cursive", fontWeight: 200 }}>Aura.</div>
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
  <div className={`relative z-20 w-52 h-52 md:w-64 md:h-64 rounded-full bg-zinc-950/90 backdrop-blur-xl border-4 border-red-600 flex flex-col items-center justify-center text-center p-6 shadow-[0_0_50px_rgba(220,38,38,0.3)] transition-all duration-500 hover:scale-105 ${align === 'left' ? '-ml-8 md:-ml-12' : align === 'right' ? '-mr-8 md:-mr-12' : ''}`}>
    <div className="text-red-600 font-black text-[7px] mb-2 tracking-[0.4em] uppercase">STAGE_{step.p}</div>
    <h4 className="text-lg md:text-xl font-black text-white uppercase italic tracking-tighter" style={{ fontFamily: 'Oswald' }}>{step.t}</h4>
    <p className="text-[9px] text-zinc-500 italic mt-3 leading-relaxed max-w-[150px]">{step.d}</p>
    {step.icon && <step.icon className="text-red-600 mt-3" size={20} />}
  </div>
);

const Landing = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    // RESOLVED SCROLLING LAG: HIGH-PERFORMANCE LENIS SETUP
    const lenis = new Lenis({ 
      duration: 1.8, 
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
      smoothWheel: true,
      lerp: 0.08, // Increased smoothness
      wheelMultiplier: 1.1
    });

    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    const timer = setTimeout(() => setLoading(false), 2000); 
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Oswald:wght@700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => {
      clearTimeout(timer);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="bg-black text-zinc-400 font-sans selection:bg-red-600 overflow-x-hidden min-h-screen relative tracking-tight">
      <AnimatePresence>{loading && <LoadingScreen key="loader" />}</AnimatePresence>
      <RightTracker progress={scrollYProgress} />

      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      <div className="fixed bottom-8 left-8 z-[120] bg-black/60 backdrop-blur-xl border-l-2 border-red-600 p-4 hidden md:block"><TypewriterFeed progress={scrollYProgress} /></div>

      {/* NAVBAR (Matched Color & Refined Design) */}
      <nav className="fixed w-full z-[110] flex justify-between items-center px-12 py-5 bg-black/40 backdrop-blur-3xl border-b border-red-900/10">
        <div className="flex items-center gap-4">
           <h1 className="text-4xl font-bold italic text-red-600 tracking-tight select-none drop-shadow-[0_0_2px_rgba(220,38,38,0.2)]" style={{ fontFamily: "'Dancing Script', cursive" }}>
             Aura
           </h1>
           <div className="h-5 w-[1px] bg-red-950 mx-2 hidden md:block" />
        </div>
        <button onClick={() => setShowLogin(true)} className="px-10 py-2.5 bg-red-600 text-black font-black text-[10px] tracking-[0.3em] uppercase shadow-[0_0_25px_rgba(220,38,38,0.3)] hover:bg-red-700 transition-all">LINK_START</button>
      </nav>

      {/* HERO */}
      <section className="relative h-screen flex flex-col justify-center items-center text-center px-4 overflow-hidden z-10">
        <HumanSignature isLoaded={!loading} />
        <motion.p initial={{ opacity: 0 }} animate={!loading ? { opacity: 0.6 } : {}} transition={{ delay: 2.2 }} className="text-[10px] text-red-600 font-bold tracking-[0.8em] uppercase mt-12">Biological Engineering & Discipline</motion.p>
      </section>

      {/* SYSTEM ARCHITECT */}
      <section className="py-24 flex items-center justify-center relative bg-zinc-950/20 z-10 px-12">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
          <motion.div whileInView={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} className="relative w-[320px] h-[320px] md:w-[480px] md:h-[480px] flex items-center justify-center border border-red-900/10 rounded-full shadow-2xl">
            <div className="p-16 bg-black border border-red-600 rounded-full shadow-2xl shadow-red-950/20"><Activity size={50} className="text-red-600 animate-pulse" /></div>
            <div className="absolute top-0 p-4 bg-zinc-900 border border-red-900 rounded-xl"><Rocket size={20} className="text-red-600" /></div>
            <div className="absolute bottom-0 p-4 bg-zinc-900 border border-red-900 rounded-xl"><HeartPulse size={20} className="text-red-600" /></div>
            <div className="absolute left-0 p-4 bg-zinc-900 border border-red-900 rounded-xl"><Target size={20} className="text-red-600" /></div>
            <div className="absolute right-0 p-4 bg-zinc-900 border border-red-900 rounded-xl"><Dumbbell size={20} className="text-red-600" /></div>
          </motion.div>
          <div className="space-y-10">
             <h3 className="text-5xl md:text-8xl font-black uppercase italic text-white tracking-tighter" style={{ fontFamily: 'Oswald' }}>SYSTEM <br/> <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-red-900">ARCHITECT.</span></h3>
             <p className="text-sm text-zinc-500 max-w-sm italic">Optimizing biological logic for high-achievers like Aditya Singh.</p>
          </div>
        </div>
      </section>

      {/* PROTOCOLS (Left/Right Fly-ins) */}
      <section className="py-12 px-12 z-10 relative overflow-hidden space-y-12">
        {[
          { t: "Neural Coach", side: "left", img: "https://images.unsplash.com/photo-1675373022919-88c244814e7c?q=80&w=1200", icon: <ShieldCheck size={24} />, d: "Monitoring metabolic feedback for a 21-year-old baseline." },
          { t: "Executive Plans", side: "right", img: "https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?q=80&w=1200", icon: <Briefcase size={24} />, d: "Professional regimens tailored for the Indian market." },
          { t: "Tactical UI", side: "left", img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200", icon: <Zap size={24} />, d: "Zero-friction environments for React and SQL modules." },
          { t: "Biological Tracking", side: "right", icon: <BarChart3 size={24} />, img: "https://images.unsplash.com/photo-1530210124550-912dc1381cb8?q=80&w=1200", d: "Targeting 85kg from a 96kg baseline with macro precision." }
        ].map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: card.side === "left" ? -150 : 150 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 1, ease: "circOut" }} className={`flex flex-col ${card.side === "right" ? "md:flex-row-reverse" : "md:flex-row"} items-center gap-8 w-full max-w-6xl mx-auto mb-16`}>
            <div className="relative w-full md:w-[480px] aspect-[21/9] overflow-hidden border border-red-900/30 shrink-0">
                <img src={card.img} alt={card.t} className="w-full h-full object-cover grayscale brightness-[0.4]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60" />
            </div>
            <div className="flex-1 space-y-4 px-6 text-left">
              <div className="flex items-center gap-4 text-red-600"><div className="p-3 bg-red-600/10 border border-red-600/30 rounded">{card.icon}</div><h4 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter text-white" style={{ fontFamily: 'Oswald' }}>{card.t}</h4></div>
              <p className="text-[11px] text-zinc-500 italic max-w-md">"{card.d}"</p>
            </div>
          </motion.div>
        ))}
      </section>

      {/* EVOLUTION */}
      <section className="py-32 bg-zinc-950/20 z-10 relative px-4 overflow-hidden min-h-screen flex flex-col items-center">
        <div className="relative mb-24 w-fit px-20 py-10 border border-red-900/10 bg-black/40">
            <div className="absolute inset-0 pointer-events-none opacity-[0.08] grayscale overflow-hidden"><img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1600" className="w-full h-full object-cover" alt="fitness" /></div>
            <h2 className="text-7xl md:text-[9rem] font-black uppercase italic text-center text-white tracking-tighter relative z-10" style={{ fontFamily: 'Oswald' }}>THE <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-red-900">EVOLUTION.</span></h2>
        </div>
        <div className="max-w-5xl mx-auto relative w-full h-[500px]">
          <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none" viewBox="0 0 1000 500" fill="none">
            <path d="M150,100 L400,350 L650,100 L850,250" stroke="#dc2626" strokeWidth="2" opacity="0.2" strokeDasharray="10 10" />
          </svg>
          <div className="absolute top-[100px] left-[15%] transform -translate-x-1/2 -translate-y-1/2"><NeuralNode align="left" index={0} step={{ p: "01", t: "BIOMETRIC ACTIVATION", d: "Baseline sync for Aditya Singh." }} /></div>
          <div className="absolute top-[350px] left-[40%] transform -translate-x-1/2 -translate-y-1/2"><NeuralNode align="right" index={1} step={{ p: "30", t: "METABOLIC REWIRING", d: "Weight tracking from 96kg." }} /></div>
          <div className="absolute top-[100px] left-[65%] transform -translate-x-1/2 -translate-y-1/2"><NeuralNode align="left" index={2} step={{ p: "90", t: "ELITE COMMAND", d: "React & Python mastery." }} /></div>
          <div className="absolute top-[250px] left-[85%] transform -translate-x-1/2 -translate-y-1/2">
             <div className="relative z-20 w-72 h-72 rounded-full bg-red-600/10 border-4 border-red-600 flex flex-col items-center justify-center text-center p-8 backdrop-blur-xl shadow-[0_0_80px_rgba(220,38,38,0.4)]">
               <Crown size={50} className="text-red-600 mx-auto animate-pulse" /><h4 className="text-3xl font-black text-white italic mt-4" style={{ fontFamily: 'Oswald' }}>AURA GOD</h4><p className="text-[9px] text-red-600 font-bold uppercase mt-3">Biological Peak</p>
             </div>
          </div>
        </div>
      </section>

      {/* MASTERY */}
      <section className="py-40 px-12 z-10 relative">
        <h2 className="text-center text-6xl font-black uppercase italic text-white mb-32 tracking-tighter" style={{ fontFamily: 'Oswald' }}>HALL OF <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-red-900">MASTERY.</span></h2>
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-20">
          {[
            { name: "Aryan K.", story: "Hit 85kg goal in Dec 2025." },
            { name: "Megha S.", story: "Focus refined through nutrition." }
          ].map((user, i) => (
            <motion.div key={i} initial={{ y: 80, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} className="relative p-16 bg-zinc-950/60 border-l-4 border-orange-600 shadow-2xl group overflow-hidden">
               <motion.div initial={{ y: "100%" }} whileInView={{ y: "0%" }} className="absolute inset-0 bg-gradient-to-t from-orange-600/10 to-transparent pointer-events-none" />
               <div className="relative z-10">
                 <p className="text-lg italic mb-10 text-zinc-400 leading-relaxed font-medium">"{user.story}"</p>
                 <div className="grid grid-cols-2 gap-4 h-32 mb-8 border border-orange-900/10 bg-black/40">
                    <div className="flex flex-col items-center justify-center border-r border-orange-900/10"><Users size={20} className="text-orange-900/30" /></div>
                    <div className="flex flex-col items-center justify-center text-orange-600"><Timer size={20} className="text-orange-500" /></div>
                 </div>
                 <div className="flex items-center gap-5">
                   <div className="w-10 h-10 bg-orange-600 rounded" />
                   <div><div className="text-white font-black text-sm uppercase">{user.name}</div><div className="text-orange-600 text-[9px] font-bold uppercase tracking-widest mt-1">Elite Performance</div></div>
                 </div>
               </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CLIMAX */}
      <section className="h-screen flex flex-col justify-center items-center text-center px-6 z-10 relative">
        <Trophy size={140} className="text-red-600 mb-12 drop-shadow-[0_0_40px_#dc2626] animate-bounce" />
        <h2 className="text-8xl md:text-[14rem] font-black mb-16 uppercase italic text-white tracking-tighter" style={{ fontFamily: 'Oswald' }}>FORGE A <br/> <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-red-900">BETTER LIFE.</span></h2>
        <button onClick={() => setShowLogin(true)} className="px-24 py-10 bg-red-600 text-black font-black text-4xl uppercase hover:bg-red-700 transition-all shadow-2xl transform hover:scale-105">Activate Protocol</button>
      </section>

      <footer className="py-24 text-center opacity-10 border-t border-red-900/10 z-10 relative"><p className="text-[10px] font-bold tracking-[3.5em] uppercase text-red-600">AURA Neural Systems // 2026</p></footer>
      <AnimatePresence>{showLogin && <LoginModal close={() => setShowLogin(false)} />}</AnimatePresence>
    </div>
  );
};

export default Landing;