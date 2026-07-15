import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Send, Terminal, Activity, Loader2, Flame, 
  BrainCircuit, Dumbbell, Atom, Fingerprint, 
  HeartPulse, Coffee, ShieldCheck
} from "lucide-react";

// SUB-COMPONENT: Reactive Neural Feed (Bottom Left)
const NeuralLogicFeed = ({ report }) => {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    if (!report) return;
    setDisplayed("");
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(report.slice(0, i + 1));
      i++;
      if (i >= report.length) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [report]);

  return (
    <div className="fixed bottom-12 left-12 z-[150] w-80 p-6 border-l-2 border-red-600 bg-black/90 backdrop-blur-2xl shadow-2xl hidden lg:block">
      <div className="flex items-center gap-2 mb-4">
        <BrainCircuit size={14} className="text-red-600 animate-pulse" />
        <p className="text-[9px] font-black text-red-600 uppercase tracking-[0.4em]">Neural_Logic_Stream</p>
      </div>
      <p className="text-[11px] text-white italic leading-relaxed font-serif min-h-[40px]">
        {displayed || "Waiting for biometric stream..."}<span className="animate-pulse text-red-600">|</span>
      </p>
    </div>
  );
};

// HUD COMPONENT: BMI Analytics (Right Mid)
const BMIProfileHUD = ({ data }) => {
  const heightM = data.height ? parseFloat(data.height) / 100 : 0;
  const bmi = (data.weight && heightM) ? (parseFloat(data.weight) / (heightM * heightM)).toFixed(1) : "0.0";
  const getBMIScore = () => {
    if (bmi === "0.0") return 0;
    const b = parseFloat(bmi);
    return (b >= 18.5 && b <= 24.9) ? 100 : 75;
  };

  return (
    <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="fixed right-10 top-1/2 -translate-y-1/2 w-72 hidden xl:block z-[120]">
      <div className="relative p-8 border-r-2 border-y-2 border-red-900/10 bg-zinc-950/80 backdrop-blur-3xl shadow-2xl">
        <div className="absolute top-0 right-0 w-10 h-10 border-r-2 border-t-2 border-red-600" />
        <h3 className="text-[10px] font-black text-red-600 uppercase tracking-[0.5em] mb-10 flex items-center gap-2">
          <Fingerprint size={12} /> Live_Profile_Data
        </h3>
        <div className="space-y-6 font-mono text-[10px] uppercase tracking-widest mb-10 text-white">
          <div className="border-b border-red-900/10 pb-2"><span className="text-zinc-600 block mb-1">Subject</span><span className="text-xs">{data.name || "Awaiting..."}</span></div>
          <div className="border-b border-red-900/10 pb-2"><span className="text-zinc-600 block mb-1">Target</span><span className="text-xs">85.0 kg</span></div>
          <div className="border-b border-red-900/10 pb-2"><span className="text-zinc-600 block mb-1">Current_BMI</span><span className="text-xs">{bmi}</span></div>
        </div>
        <div className="text-[10px] font-bold text-red-600 mb-2 uppercase">Metabolic_Score: {getBMIScore()}%</div>
        <div className="h-1 w-full bg-zinc-900 overflow-hidden"><motion.div animate={{ width: `${getBMIScore()}%` }} className="h-full bg-red-600 shadow-[0_0_10px_#dc2626]" /></div>
      </div>
    </motion.div>
  );
};

const SaturatedBackground = () => (
  <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_center,_rgba(69,10,10,0.1)_0%,_rgba(0,0,0,1)_90%)]">
    <div className="absolute inset-0 opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    {[...Array(12)].map((_, i) => (
      <motion.div key={i} animate={{ y: [0, -60, 0], opacity: [0.03, 0.08, 0.03], rotate: [0, 20, -20, 0] }} transition={{ duration: 6 + i, repeat: Infinity }} className="absolute text-red-950" style={{ left: `${(i * 9) % 100}%`, top: `${(i * 13) % 100}%` }}>
        {i % 4 === 0 ? <Dumbbell size={35} /> : i % 4 === 1 ? <Atom size={28} /> : i % 4 === 2 ? <Coffee size={24} /> : <HeartPulse size={30} />}
      </motion.div>
    ))}
  </div>
);

const Onboarding = () => {
  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5001";
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [userData, setUserData] = useState({
    name: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    goal: "",
    experience: "",
    diet: "",
    target_weight: "",
    commitment: "",
    daily_role: "",
    train_time: "",
    train_access: ""
  });
  const [psychReport, setPsychReport] = useState("");
  const [currentSection, setCurrentSection] = useState("");
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [alreadyOnboarded, setAlreadyOnboarded] = useState(false);
  const [profile, setProfile] = useState(null);
  const chatEndRef = useRef(null);

  const chatFlow = useMemo(() => [
    { id: "name", q: "ESTABLISHING NEURAL LINK. IDENTIFY YOURSELF:", type: "text", section: "SECTION A: IDENTITY SYNC" },
    { id: "age", q: "INPUT BIOLOGICAL AGE:", type: "text", section: "SECTION A: IDENTITY SYNC" }, 
    { id: "gender", q: "SPECIFY GENDER:", type: "buttons", options: ["Male", "Female", "Skip"], section: "SECTION A: IDENTITY SYNC" },
    { id: "height", q: "INPUT VERTICAL SCALE (CM):", type: "text", section: "SECTION A: IDENTITY SYNC" },
    { id: "weight", q: "INPUT CURRENT MASS (KG):", type: "text", section: "SECTION A: IDENTITY SYNC" },
    { id: "goal", q: "SELECT PRIMARY PERFORMANCE OBJECTIVE:", type: "buttons", options: ["Fat Loss", "Muscle Gain", "Strength", "Athlete Mode"], section: "SECTION B: PSYCHOLOGICAL MAP" },
    { id: "experience", q: "QUANTIFY FITNESS EXPERIENCE:", type: "buttons", options: ["Beginner", "Intermediate", "Advanced"], section: "SECTION B: PSYCHOLOGICAL MAP" },
    { id: "diet", q: "PRIMARY FUEL SOURCE:", type: "buttons", options: ["Veg", "Non-Veg", "Vegan", "Eggetarian"], section: "SECTION B: PSYCHOLOGICAL MAP" },
    { id: "target_weight", q: "DEFINE TARGET BODY MASS (KG):", type: "text", section: "SECTION B: PSYCHOLOGICAL MAP" },
    { id: "commitment", q: "WEEKLY TRAINING FREQUENCY?", type: "buttons", options: ["2-3 Days", "4-5 Days", "6 Days"], section: "SECTION B: PSYCHOLOGICAL MAP" },
    { id: "daily_role", q: "WHAT DEFINES YOUR DAILY LIFE?", type: "buttons", options: ["College Student", "Professional", "Home", "Athlete"], section: "SECTION C: LIFE INTEGRATION" },
    { id: "train_time", q: "WHEN CAN YOU TRAIN WITHOUT EXCUSES?", type: "buttons", options: ["Morning", "Evening", "Night", "Flexible"], section: "SECTION C: LIFE INTEGRATION" },
    { id: "train_access", q: "WHERE WILL YOU TRAIN?", type: "buttons", options: ["Full Gym", "Home", "Hostel Room", "No Equipment"], section: "SECTION C: LIFE INTEGRATION" },
  ], []);

  useEffect(() => {
    // Check onboarding status before chat flow starts
    const checkOnboardingStatus = async () => {
  try {
    const token = localStorage.getItem("token");

    console.log("TOKEN:", token);

    if (!token) {
      console.log("No token found");
      setCheckingStatus(false);
      return;
    }

    const res = await fetch(`${API_BASE}/api/user/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("STATUS:", res.status);

    const data = await res.json();

    console.log("PROFILE RESPONSE:", data);

    if (data?.user) {
      setProfile(data.user);
    }

    if (data?.onboardingCompleted) {
      console.log("Already onboarded");
      setAlreadyOnboarded(true);
    } else {
      console.log("Not onboarded");
    }
  } catch (err) {
    console.error("Onboarding check failed:", err);
  } finally {
    setCheckingStatus(false);
  }
};
    checkOnboardingStatus();
  }, [API_BASE]);

  useEffect(() => {
    if (checkingStatus || alreadyOnboarded) return;
    if (step < chatFlow.length) {
      if (chatFlow[step].section !== currentSection) {
        setCurrentSection(chatFlow[step].section);
      }
      setIsTyping(true);
      const timer = setTimeout(() => {
        setMessages(prev => [...prev, { sender: "ai", text: chatFlow[step].q }]);
        setIsTyping(false);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      initiateBiometricScan();
    }
  }, [step, chatFlow, checkingStatus, alreadyOnboarded, currentSection]);
const initiateBiometricScan = async () => {
  setIsScanning(true);
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("No authentication token found. Please log in again.");
      setIsScanning(false);
      navigate("/");
      return;
    }
    const res = await fetch(`${API_BASE}/api/user/onboarding`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        onboarding: userData
      })
    });
    const data = await res.json();
    if (!res.ok) {
      console.error(data);
      alert("Failed to save onboarding");
      setIsScanning(false);
      return;
    }
    setTimeout(() => {
      setIsScanning(false);
      navigate('/planselection');
    }, 2000);
  } catch (err) {
    setIsScanning(false);
    console.error(err);
    alert("Failed to save onboarding");
  }
};

  const handleUserAnswer = (answer) => {
    const val = answer.toString().trim();
    const id = chatFlow[step]?.id;
    if (!val) {
      alert("Please enter a value to proceed.");
      return;
    }
    // Validation per field
    if (id === "age") {
      const n = Number(val);
      if (!/^\d+$/.test(val) || n < 10 || n > 100) {
        alert("Please enter a valid age between 10 and 100.");
        return;
      }
    }
    if (id === "height") {
      const n = Number(val);
      if (!/^\d+$/.test(val) || n < 80 || n > 250) {
        alert("Please enter a valid height between 80 and 250 cm.");
        return;
      }
    }
    if (id === "weight" || id === "target_weight") {
      const n = Number(val);
      if (!/^\d+(\.\d+)?$/.test(val) || n < 20 || n > 400) {
        alert("Please enter a valid weight between 20 and 400 kg.");
        return;
      }
    }
    setMessages(prev => [...prev, { sender: "user", text: answer }]);
    setUserData(prev => ({ ...prev, [id]: answer }));
    if (id === "name") setPsychReport(`Neural link established for subject: ${answer}.`);
    if (id === "goal") setPsychReport(`Objective set to ${answer}. Calculating optimal path...`);
    setInputValue("");
    setStep(prev => prev + 1);
  };

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);

  // Early returns for onboarding status
  if (checkingStatus) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white text-xl">
        Checking onboarding status...
      </div>
    );
  }
  if (alreadyOnboarded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-zinc-950/90 border border-red-900/30 rounded-2xl overflow-hidden shadow-2xl">
          <div className="border-b border-red-900/20 p-8 text-center">
            <div className="flex justify-center mb-5">
              <div className="w-20 h-20 rounded-full border border-red-600/30 flex items-center justify-center bg-red-950/20">
                <ShieldCheck className="text-red-600" size={38} />
              </div>
            </div>

            <p className="text-[11px] tracking-[0.5em] uppercase text-red-600 mb-2">
              Neural Authentication
            </p>

            <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-wide">
              Identity Verified
            </h1>
          </div>

          <div className="p-8 space-y-8">
            <p className="text-zinc-400 text-center leading-8">
              Your biometric profile has already been registered and synchronized with Aura.
              Future fitness strategy changes will be managed through the Adaptive Center.
            </p>

            <div className="grid grid-cols-2 gap-5">
              <div className="border border-red-900/20 rounded-xl p-5 bg-black/30">
                <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-500 mb-2">
                  Current Strategy
                </p>
                <p className="text-xl font-bold text-white">
                  {profile?.onboarding?.goal || 'Unknown Strategy'}
                </p>
              </div>

              <div className="border border-red-900/20 rounded-xl p-5 bg-black/30">
                <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-500 mb-2">
                  Active Version
                </p>
                <p className="text-xl font-bold text-red-500">
                  Version {profile?.activeVersion || 1}
                </p>
              </div>
            </div>

            <div className="border-t border-red-900/20 pt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/adaptive-center')}
                className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all"
              >
                Open Adaptive Center
              </button>

              <button
                onClick={() => navigate('/')}
                className="px-8 py-3 border border-red-900/30 hover:border-red-600 text-zinc-300 rounded-xl font-semibold transition-all"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-black text-zinc-400 font-sans selection:bg-red-600 relative overflow-hidden">
      <SaturatedBackground />
      <BMIProfileHUD data={userData} />
      <NeuralLogicFeed report={psychReport} />
      
      <nav className="fixed top-0 w-full z-[140] px-12 py-7 bg-black/40 backdrop-blur-3xl border-b border-red-900/10 flex justify-between items-center">
        <h1 className="text-3xl font-bold italic text-red-600" style={{ fontFamily: "'Dancing Script', cursive" }}>Aura</h1>
        <div className="flex gap-4 opacity-30 text-red-600"><Terminal size={18} /><ShieldCheck size={18} /></div>
      </nav>

      <div className="max-w-4xl mx-auto pt-28 md:pt-36 flex flex-col h-[calc(100vh-5rem)] md:h-[90vh] relative z-10 px-4 sm:px-6">
        
        {isScanning ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
             <div className="relative mb-12 flex items-center justify-center">
                
                {/* 1. Animated HUD Circle */}
                <motion.div 
                    animate={{ rotate: 360, scale: [1, 1.05, 1] }} 
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }} 
                    className="w-72 h-72 border border-red-600/20 rounded-full absolute"
                />
                <motion.div 
                    animate={{ rotate: -360 }} 
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }} 
                    className="w-80 h-80 border-t border-b border-red-600/10 rounded-full absolute"
                />

                {/* 2. Neural Fingerprint Completion */}
                <div className="relative z-10">
                    <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-900">
                        <path d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10" opacity="0.1"/>
                        <path d="M5 15c0-3.866 3.134-7 7-7s7 3.134 7 7" opacity="0.1"/>
                        <path d="M8 18c0-2.209 1.791-4 4-4s4 1.791 4 4" opacity="0.1"/>
                        <path d="M12 12v.01" opacity="0.1"/>
                    </svg>

                    <motion.svg 
                        width="120" 
                        height="120" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="#dc2626" 
                        strokeWidth="1" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className="absolute top-0 left-0 drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]"
                    >
                        {/* Fingerprint ridges animating to completion */}
                        <motion.path 
                            d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10" 
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 2, delay: 0.5 }}
                        />
                        <motion.path 
                            d="M5 15c0-3.866 3.134-7 7-7s7 3.134 7 7" 
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 2, delay: 1.5 }}
                        />
                        <motion.path 
                            d="M8 18c0-2.209 1.791-4 4-4s4 1.791 4 4" 
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 2, delay: 2.5 }}
                        />
                        <motion.path 
                            d="M12 12v.01" 
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1, delay: 4 }}
                        />
                    </motion.svg>
                </div>

                {/* 3. Circular Scanner Scanning line */}
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute w-72 h-72 border-l-2 border-red-600 rounded-full z-20"
                />
             </div>
             
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="space-y-3">
                <h3 className="text-3xl font-black text-white italic uppercase tracking-[0.3em]">Neural Sync</h3>
                <div className="flex items-center justify-center gap-3">
                    <div className="h-[1px] w-12 bg-red-900/50" />
                    <p className="text-red-600 font-mono text-[9px] tracking-[0.5em] uppercase animate-pulse">Establishing Biometric Protocol</p>
                    <div className="h-[1px] w-12 bg-red-900/50" />
                </div>
             </motion.div>
          </div>
        ) : (
          <>
            <AnimatePresence mode="wait">
              <motion.div key={currentSection} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="w-full mb-12">
                <div className="text-red-600 font-black text-[10px] uppercase tracking-[0.5em] mb-4 italic flex items-center gap-2"><div className="w-1 h-1 bg-red-600 rounded-full animate-ping" />{currentSection}</div>
                <div className="h-[2px] w-full bg-zinc-950 overflow-hidden"><motion.div animate={{ width: `${(step / chatFlow.length) * 100}%` }} className="h-full bg-red-600 shadow-[0_0_15px_#dc2626]" /></div>
              </motion.div>
            </AnimatePresence>

            <div className="flex-1 overflow-y-auto space-y-12 pr-2 custom-scrollbar pb-32">
              {messages.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.sender === 'ai' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`p-5 md:p-8 shadow-2xl max-w-[90%] md:max-w-[75%] break-words ${msg.sender === 'ai' ? 'bg-red-950/20 border-l-8 border-red-600 clip-ai text-white uppercase font-black tracking-tighter' : 'bg-zinc-900 border-r-8 border-red-600 clip-user text-white italic font-serif'}`}>
                     {msg.text}
                  </div>
                </motion.div>
              ))}
              {isTyping && <div className="flex items-center gap-3 text-red-900 animate-pulse"><Loader2 size={16} className="animate-spin" /><span className="text-[10px] font-black uppercase tracking-widest">Aura_Thinking...</span></div>}
              <div ref={chatEndRef} />
              <div className="sticky bottom-0 bg-black/90 backdrop-blur-xl p-8 border border-red-900/20">
                  {chatFlow[step]?.type === "buttons" ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {chatFlow[step].options.map(opt => <button key={opt} onClick={() => handleUserAnswer(opt)} className="p-4 border border-zinc-900 bg-zinc-950 hover:border-red-600 hover:text-white text-[10px] uppercase font-black tracking-widest transition-all">{opt}</button>)}
                    </div>
                  ) : (
                    <div className="relative group">
                      <input autoFocus value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleUserAnswer(inputValue)} placeholder="Enter Command..." className="w-full bg-transparent border-b-2 border-red-900/30 p-4 text-white text-xl md:text-3xl focus:outline-none focus:border-red-600 transition-all italic font-bold" style={{ fontFamily: "'Playfair Display', serif" }} />
                      <Send size={28} onClick={() => handleUserAnswer(inputValue)} className="absolute right-4 top-1/2 -translate-y-1/2 text-red-900 cursor-pointer" />
                    </div>
                  )}
              </div>
            </div>
          </>
        )}
      </div>
      <style>{`
        .clip-ai { clip-path: polygon(0 0, 100% 0, 95% 100%, 0 100%); }
        .clip-user { clip-path: polygon(5% 0, 100% 0, 100% 100%, 0 100%); }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #450a0a; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default Onboarding;