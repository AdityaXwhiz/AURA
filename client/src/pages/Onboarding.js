import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Send, Terminal, Activity, Target, Loader2, Flame, 
  BrainCircuit, Timer, Users, Trophy, Dumbbell, Atom, 
  Award, Fingerprint, HeartPulse, Coffee, ShieldCheck, Cpu
} from "lucide-react";

// 1. SUB-COMPONENT: Reactive Neural Feed (Bottom Left)
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

// 2. HUD COMPONENT: BMI Analytics (Right Mid)
const BMIProfileHUD = ({ data }) => {
  const heightM = data.height ? parseFloat(data.height) / 100 : 0;
  const bmi = (data.weight && heightM) ? (parseFloat(data.weight) / (heightM * heightM)).toFixed(1) : "0.0";
  const getBMIScore = () => {
    if (bmi === "0.0") return 0;
    const b = parseFloat(bmi);
    return (b >= 18.5 && b <= 24.9) ? 100 : 75; // Grounded in 96kg starting weight
  };

  return (
    <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="fixed right-10 top-1/2 -translate-y-1/2 w-72 hidden xl:block z-[120]">
      <div className="relative p-8 border-r-2 border-y-2 border-red-900/10 bg-zinc-950/80 backdrop-blur-3xl shadow-2xl">
        <div className="absolute top-0 right-0 w-10 h-10 border-r-2 border-t-2 border-red-600" />
        <h3 className="text-[10px] font-black text-red-600 uppercase tracking-[0.5em] mb-10 flex items-center gap-2">
          <Fingerprint size={12} /> Live_Profile_Data
        </h3>
        <div className="space-y-6 font-mono text-[10px] uppercase tracking-widest mb-10 text-white">
          <div className="border-b border-red-900/10 pb-2"><span className="text-zinc-600 block mb-1">Subject</span><span className="text-xs">{data.name || "Aditya Singh"}</span></div>
          <div className="border-b border-red-900/10 pb-2"><span className="text-zinc-600 block mb-1">Goal_Target</span><span className="text-xs">85.0 kg</span></div>
          <div className="border-b border-red-900/10 pb-2"><span className="text-zinc-600 block mb-1">Current_BMI</span><span className="text-xs">{bmi}</span></div>
        </div>
        <div className="text-[10px] font-bold text-red-600 mb-2 uppercase">Metabolic_Score: {getBMIScore()}%</div>
        <div className="h-1 w-full bg-zinc-900 overflow-hidden"><motion.div animate={{ width: `${getBMIScore()}%` }} className="h-full bg-red-600 shadow-[0_0_10px_#dc2626]" /></div>
      </div>
    </motion.div>
  );
};

// 3. SUB-COMPONENT: Refined Background
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
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [showPlan, setShowPlan] = useState(false);
  const [userData, setUserData] = useState({ name: "Aditya Singh", weight: 90, age: 21 }); //
  const [psychReport, setPsychReport] = useState("");
  const [currentSection, setCurrentSection] = useState("");
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
    { id: "target_weight", q: "DEFINE TARGET BODY MASS (KG):", type: "text", section: "SECTION B: PSYCHOLOGICAL MAP" }, // User goal is 85kg
    { id: "commitment", q: "WEEKLY TRAINING FREQUENCY?", type: "buttons", options: ["2-3 Days", "4-5 Days", "6 Days"], section: "SECTION B: PSYCHOLOGICAL MAP" },
    { id: "daily_role", q: "WHAT DEFINES YOUR DAILY LIFE?", type: "buttons", options: ["College Student", "Professional", "Home", "Athlete"], section: "SECTION C: LIFE INTEGRATION" },
    { id: "train_time", q: "WHEN CAN YOU TRAIN WITHOUT EXCUSES?", type: "buttons", options: ["Morning", "Evening", "Night", "Flexible"], section: "SECTION C: LIFE INTEGRATION" },
    { id: "train_access", q: "WHERE WILL YOU TRAIN?", type: "buttons", options: ["Full Gym", "Home", "Hostel Room", "No Equipment"], section: "SECTION C: LIFE INTEGRATION" },
  ], []);

  useEffect(() => {
    if (step < chatFlow.length) {
      if (chatFlow[step].section !== currentSection) {
        setCurrentSection(chatFlow[step].section);
      }
      setIsTyping(true);
      const timer = setTimeout(() => {
        setMessages(prev => [...prev, { sender: "ai", text: chatFlow[step].q }]);
        setIsTyping(false);
      }, 900);
      return () => clearTimeout(timer);
    } else {
      initiateBiometricScan();
    }
  }, [step, chatFlow]);

  const initiateBiometricScan = () => {
    setIsScanning(true);
    setTimeout(() => { setIsScanning(false); setShowPlan(true); }, 4000);
  };

  const handleUserAnswer = (answer) => {
    if (!answer.trim()) return;
    setMessages(prev => [...prev, { sender: "user", text: answer }]);
    setUserData(prev => ({ ...prev, [chatFlow[step].id]: answer }));
    if (chatFlow[step].id === "weight") setPsychReport(`Analyzing mass density for ${answer}kg profile. Target: 85kg transition.`);
    if (chatFlow[step].id === "daily_role") setPsychReport(`Student context recognized. Recalculating sedentary energy expenditure.`);
    setInputValue("");
    setStep(prev => prev + 1);
  };

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);

  return (
    <div className="min-h-screen bg-black text-zinc-400 font-sans selection:bg-red-600 relative overflow-hidden">
      <SaturatedBackground />
      <BMIProfileHUD data={userData} />
      <NeuralLogicFeed report={psychReport} />
      
      <nav className="fixed top-0 w-full z-[140] px-12 py-7 bg-black/40 backdrop-blur-3xl border-b border-red-900/10 flex justify-between items-center">
        <h1 className="text-3xl font-bold italic text-red-600" style={{ fontFamily: "'Dancing Script', cursive" }}>Aura</h1>
        <div className="flex gap-4 opacity-30 text-red-600"><Terminal size={18} /><ShieldCheck size={18} /></div>
      </nav>

      <div className="max-w-4xl mx-auto pt-36 flex flex-col h-[90vh] relative z-10 px-6">
        
        {isScanning ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
             <div className="relative mb-12">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="w-48 h-48 border-t-2 border-red-600 rounded-full" />
                <div className="absolute inset-0 flex items-center justify-center"><Fingerprint size={60} className="text-red-600 animate-pulse" /></div>
             </div>
             <motion.h3 animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-4xl font-black text-white italic uppercase" style={{ fontFamily: 'Oswald' }}>Neural Scan In Progress...</motion.h3>
          </div>
        ) : !showPlan ? (
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
                  <div className={`p-8 shadow-2xl ${msg.sender === 'ai' ? 'bg-red-950/20 border-l-8 border-red-600 clip-ai text-white uppercase font-black tracking-tighter font-sans' : 'bg-zinc-900 border-r-8 border-red-600 clip-user text-white italic font-serif'}`}>
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
                      <input autoFocus value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleUserAnswer(inputValue)} placeholder="Enter Command..." className="w-full bg-transparent border-b-2 border-red-900/30 p-4 text-white text-3xl focus:outline-none focus:border-red-600 transition-all italic font-bold" style={{ fontFamily: "'Playfair Display', serif" }} />
                      <Send size={28} onClick={() => handleUserAnswer(inputValue)} className="absolute right-4 top-1/2 -translate-y-1/2 text-red-900 cursor-pointer" />
                    </div>
                  )}
              </div>
            </div>
          </>
        ) : (
          /* FINAL MASTER PROTOCOL REVEAL */
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 py-10">
             <div className="text-center mb-16">
                <motion.h2 animate={{ textShadow: ["0 0 10px #dc2626", "0 0 40px #dc2626", "0 0 10px #dc2626"] }} transition={{ duration: 2, repeat: Infinity }} className="text-7xl md:text-[9rem] font-black text-white italic uppercase tracking-tighter leading-none mb-4" style={{ fontFamily: 'Oswald' }}>THE <span className="text-red-700">WARRIOR.</span></motion.h2>
                <p className="text-[10px] text-red-600 font-bold uppercase tracking-[0.6em]">Biometric Protocol for {userData.name}</p>
             </div>
             
             <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                <div className="p-10 bg-zinc-950/60 border-l-4 border-red-600 shadow-2xl space-y-8">
                   <div className="flex items-center gap-4 text-white"><Activity className="text-red-600" /> <h4 className="font-black italic uppercase tracking-widest">METABOLIC_GOAL</h4></div>
                   <div className="space-y-4">
                      <div className="flex justify-between border-b border-zinc-900 pb-2 text-[10px] uppercase font-bold text-zinc-500"><span>Target_Mass</span><span className="text-red-600">85.0 kg</span></div>
                      <div className="flex justify-between border-b border-zinc-900 pb-2 text-[10px] uppercase font-bold text-zinc-500"><span>Daily_Intake</span><span className="text-white">2,480 kcal</span></div>
                      <div className="flex justify-between border-b border-zinc-900 pb-2 text-[10px] uppercase font-bold text-zinc-500"><span>Protein_Synthesis</span><span className="text-white">180g</span></div>
                   </div>
                </div>
                <div className="p-10 bg-zinc-950/60 border-l-4 border-red-600 shadow-2xl space-y-8">
                   <div className="flex items-center gap-4 text-white"><Flame className="text-red-600" /> <h4 className="font-black italic uppercase tracking-widest">TRAINING_INTENSITY</h4></div>
                   <div className="space-y-4">
                      <div className="flex justify-between border-b border-zinc-900 pb-2 text-[10px] uppercase font-bold text-zinc-500"><span>Frequency</span><span className="text-white">{userData.commitment || "5-6 Days"}</span></div>
                      <div className="flex justify-between border-b border-zinc-900 pb-2 text-[10px] uppercase font-bold text-zinc-500"><span>Focus</span><span className="text-white">Compound Lifts</span></div>
                      <div className="flex justify-between border-b border-zinc-900 pb-2 text-[10px] uppercase font-bold text-zinc-500"><span>Velocity</span><span className="text-red-600">Max Intensity</span></div>
                   </div>
                </div>
             </div>
             <div className="mt-16 text-center">
                <p className="text-[10px] text-zinc-600 italic mb-10 max-w-sm mx-auto">“Initialization complete. The hardest part is starting — your evolution begins now. Let the war begin.”</p>
                <button onClick={() => navigate('/planner')} className="px-24 py-8 bg-red-600 text-black font-black text-2xl uppercase italic shadow-2xl hover:bg-white transition-all">Activate War Room</button>
             </div>
          </motion.div>
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