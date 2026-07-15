import React, { useEffect, useState } from "react";
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, Target, Flame, User, Watch, LogOut, Award, 
  Battery, Brain, Zap, Shield, Database, Droplet, 
  Dumbbell, Smartphone, CheckCircle2, AlertTriangle, Fingerprint,
  Menu, X
} from "lucide-react";

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001';

/* ═══════════════════════════════════════════════════════════════════════════
   STYLES & THEME TOKENS
   ═══════════════════════════════════════════════════════════════════════════ */
const theme = {
  bg: '#000',
  cardBg: 'linear-gradient(135deg, rgba(24,24,27,0.7) 0%, rgba(15,15,15,0.85) 100%)',
  cardBorder: '1px solid rgba(63,63,70,0.3)',
  primary: '#ef4444',
  primaryDim: 'rgba(239,68,68,0.15)',
  text: '#fff',
  textMuted: '#a1a1aa',
};

const cardStyle = {
  padding: '1.5rem',
  borderRadius: '20px',
  border: theme.cardBorder,
  background: theme.cardBg,
  backdropFilter: 'blur(16px)',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  overflow: 'hidden'
};

const buttonStyle = (variant = 'primary') => ({
  padding: '10px 16px',
  borderRadius: '12px',
  border: variant === 'primary' ? 'none' : '1px solid rgba(63,63,70,0.5)',
  background: variant === 'primary' ? 'linear-gradient(135deg, #ef4444, #b91c1c)' : 'rgba(39,39,42,0.8)',
  color: variant === 'primary' ? '#fff' : '#e4e4e7',
  fontWeight: 700,
  fontSize: '0.75rem',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  transition: 'transform 0.2s, filter 0.2s',
});

const SectionHeader = ({ icon: Icon, title, glow = false }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
    <Icon size={16} color={theme.primary} style={glow ? { filter: 'drop-shadow(0 0 8px rgba(239,68,68,0.8))' } : {}} />
    <h3 style={{ fontSize: '0.75rem', letterSpacing: '0.2em', color: theme.primary, textTransform: 'uppercase', fontWeight: 800, margin: 0 }}>
      {title}
    </h3>
  </div>
);

const RadialProgress = ({ value, label, subtext, color = "#ef4444", delay = 0 }) => {
  const radius = 35;
  const circ = 2 * Math.PI * radius;
  const strokePct = ((100 - value) * circ) / 100;
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width="90" height="90" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
        <motion.circle 
          cx="50" cy="50" r={radius} fill="none" stroke={color} strokeWidth="8" 
          strokeDasharray={circ} 
          initial={{ strokeDashoffset: circ }} 
          animate={{ strokeDashoffset: strokePct }} 
          transition={{ duration: 1.5, delay, ease: "easeOut" }} 
          strokeLinecap="round" 
          style={{ filter: `drop-shadow(0 0 6px ${color}80)` }}
        />
      </svg>
      <div style={{ marginTop: '-58px', textAlign: 'center', marginBottom: '28px' }}>
        <span style={{ display: 'block', fontSize: '1.2rem', fontWeight: 900, color: '#fff' }}>{value}<span style={{fontSize: '0.7rem'}}>%</span></span>
      </div>
      <span style={{ fontSize: '0.65rem', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, marginTop: '8px', textAlign: 'center' }}>{label}</span>
      {subtext && <span style={{ fontSize: '0.6rem', color: color, fontWeight: 700, marginTop: '2px', textTransform: 'uppercase' }}>{subtext}</span>}
    </div>
  );
};

const ProgressBar = ({ label, value, max, unit, color = "#ef4444" }) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: theme.textMuted, fontWeight: 700, letterSpacing: '0.1em' }}>{label}</span>
        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fff' }}>{value} <span style={{ color: theme.textMuted, fontSize: '0.65rem' }}>{unit}</span></span>
      </div>
      <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
        <motion.div 
          initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, ease: "easeOut" }}
          style={{ height: '100%', background: color, boxShadow: `0 0 10px ${color}80` }} 
        />
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [steps, setSteps] = useState(() => Number(localStorage.getItem("steps")) || 0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchSteps = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/api/fitness`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data?.steps) {
          setSteps(data.steps);
          localStorage.setItem("steps", data.steps);
        }
      } catch (err) {}
    };
    fetchSteps();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("auraUser");
    localStorage.removeItem("token");
    navigate("/");
  };

  // MOCK & DERIVED DATA FOR NEW SECTIONS
  const operatorName = user?.name || user?.username || "ADITYA SINGH";
  const initial = operatorName[0].toUpperCase();
  const points = user?.points || user?.xp || 4250;
  const level = user?.level || 12;
  const rankName = user?.rank?.name || user?.rank || "ELITE VANGUARD";
  
  const ob = user?.onboarding || {};
  const weight = parseFloat(ob.weight) || 78.5;
  const target = parseFloat(ob.target_weight) || 85.0;
  const height = parseFloat(ob.height) || 180;
  const bmi = (weight / Math.pow(height/100, 2)).toFixed(1);

  // Timeline Mocks
  const systemLogs = [
    { date: "July 14, 0800 HRS", event: "Upper Body protocol deployed based on localized recovery." },
    { date: "July 13, 2130 HRS", event: "Workout adapted due to high CNS fatigue and reported soreness." },
    { date: "July 12, 0615 HRS", event: "Recovery dropped to Moderate. Adjusted volume -15%." },
    { date: "July 10, 1200 HRS", event: "AURA generated Protocol v1: 90-Day Aesthetic." }
  ];

  return (
    <div style={{ minHeight: '100vh', background: theme.bg, color: theme.text, fontFamily: "'Inter', sans-serif", position: 'relative', overflow: 'hidden' }}>
      {/* Mobile Optimization Styles */}
      <style>{`
        .profile-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 1.5rem;
        }
        .col-12 { grid-column: span 12; }
        .col-8 { grid-column: span 8; }
        .col-6 { grid-column: span 6; }
        .col-4 { grid-column: span 4; }

        .nav-actions { display: flex; gap: 10px; }
        .hamburger-btn { display: none; background: none; border: none; color: #fff; cursor: pointer; padding: 0.5rem; }
        .mobile-menu { display: none; }

        @media (max-width: 900px) {
          .col-8, .col-6, .col-4 { grid-column: span 12; }
        }

        @media (max-width: 640px) {
          .nav-actions { display: none; }
          .hamburger-btn { display: flex; align-items: center; justify-content: center; }
          .mobile-menu.open {
            display: flex;
            flex-direction: column;
            gap: 12px;
            width: 100%;
            margin-top: 1rem;
            background: rgba(15, 15, 15, 0.95);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 16px;
            padding: 1.5rem;
            backdrop-filter: blur(16px);
          }
        }
      `}</style>

      {/* Background Effects */}
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(circle at 50% 0%, rgba(220,38,38,0.1) 0%, transparent 60%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', inset: 0, opacity: 0.03, backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none' }} />
      
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 1.5rem 5rem', position: 'relative', zIndex: 10 }}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ color: theme.primary, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.4em', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={12} /> AURA OS // V2.4.1
            </p>
            <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', fontWeight: 900, fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: '-0.02em', margin: 0 }}>OPERATOR PROFILE</h1>
          </div>
          
          <div className="nav-actions">
            {/* <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => {}} style={{ ...buttonStyle('secondary') }}>
              <Watch size={14} /> Sync Watch
            </motion.button> */}
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleLogout} style={{ ...buttonStyle('secondary'), border: '1px solid rgba(239,68,68,0.4)', color: '#f87171' }}>
              <LogOut size={14} /> Terminate Link
            </motion.button>
          </div>

          {/* Hamburger Menu Toggle (Mobile) */}
          <button className="hamburger-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Mobile Menu Dropdown */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="mobile-menu open"
              >
                {/* <motion.button whileTap={{ scale: 0.95 }} onClick={() => setIsMobileMenuOpen(false)} style={{ ...buttonStyle('secondary'), width: '100%', justifyContent: 'center' }}>
                  <Watch size={14} /> Sync Watch
                </motion.button> */}
                <motion.button whileTap={{ scale: 0.95 }} onClick={handleLogout} style={{ ...buttonStyle('secondary'), width: '100%', justifyContent: 'center', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171' }}>
                  <LogOut size={14} /> Terminate Link
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="profile-grid">
          
          {/* ================= SECTION 1: OPERATOR IDENTITY ================= */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="col-8" style={cardStyle}>
            <div style={{ position: 'absolute', top: 0, right: 0, padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', padding: '4px 10px', borderRadius: '100px' }}>
                <Battery size={12} color="#4ade80" />
                <span style={{ color: '#4ade80', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Recovery: Excellent</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ width: '85px', height: '85px', borderRadius: '16px', background: 'linear-gradient(135deg, #ef4444, #7f1d1d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 900, boxShadow: '0 0 30px rgba(239,68,68,0.3)', border: '1px solid rgba(255,255,255,0.2)' }}>
                  {initial}
                </div>
                <div style={{ position: 'absolute', bottom: -8, right: -8, background: '#000', borderRadius: '50%', padding: '4px' }}>
                  <Fingerprint size={18} color={theme.primary} />
                </div>
              </div>
              
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 900, margin: 0, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>{operatorName}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', flexWrap: 'wrap' }}>
                  <span style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Award size={14} color={theme.primary} /> {rankName}
                  </span>
                  <span style={{ color: theme.textMuted }}>|</span>
                  <span style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    LVL {level}
                  </span>
                  <span style={{ color: theme.textMuted }}>|</span>
                  <span style={{ color: theme.primary, fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    {points} XP
                  </span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(0,0,0,0.4)', borderRadius: '12px', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Brain size={20} color={theme.primary} className="animate-pulse" />
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#e4e4e7', fontStyle: 'italic', fontWeight: 500 }}>
                "AURA understands <strong style={{ color: theme.primary, fontWeight: 900 }}>92%</strong> of your fitness behavior. Protocol alignment is optimal."
              </p>
            </div>
          </motion.div>

          {/* ================= SECTION 7: CONNECTED SYSTEMS ================= */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="col-4" style={cardStyle}>
            <SectionHeader icon={Database} title="System Links" />
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, justifyContent: 'center' }}>
              {[
                { name: "Google Fit", icon: Smartphone, status: "Connected", color: "#4ade80" },
                { name: "Smart Watch", icon: Watch, status: "Connected", color: "#4ade80" },
                { name: "Apple Health", icon: Activity, status: "Offline", color: theme.textMuted }
              ].map((sys, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <sys.icon size={16} color={sys.color} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>{sys.name}</span>
                  </div>
                  <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, color: sys.color }}>
                    {sys.status}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ================= SECTION 2: ADAPTIVE INTELLIGENCE DASHBOARD ================= */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="col-12" style={cardStyle}>
            <SectionHeader icon={Activity} title="Adaptive Intelligence Telemetry" glow />
            
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around', gap: '1.5rem', marginTop: '1rem' }}>
              <RadialProgress value={88} label="Recovery" subtext="Optimal" color="#4ade80" delay={0.2} />
              <RadialProgress value={74} label="Sleep Quality" subtext="Moderate" color="#facc15" delay={0.4} />
              <RadialProgress value={95} label="Consistency" subtext="Elite" color="#3b82f6" delay={0.6} />
              <RadialProgress value={100} label="Completion" subtext="Flawless" color="#a855f7" delay={0.8} />
              <RadialProgress value={92} label="Adaptation" subtext="Phase 2" color="#ef4444" delay={1.0} />
            </div>
          </motion.div>

          {/* ================= SECTION 3: PROTOCOL CENTER ================= */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="col-6" style={cardStyle}>
            <SectionHeader icon={Target} title="Active Protocol" />
            
            <div style={{ textAlign: 'center', marginBottom: '2rem', marginTop: '1rem' }}>
              <p style={{ fontSize: '0.7rem', color: theme.primary, textTransform: 'uppercase', letterSpacing: '0.3em', fontWeight: 900, marginBottom: '4px' }}>Version 2.0</p>
              <h3 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 900, fontStyle: 'italic', textTransform: 'uppercase', margin: 0, color: '#fff', textShadow: '0 0 20px rgba(255,255,255,0.2)' }}>
                90-Day Aesthetic
              </h3>
              <p style={{ fontSize: '0.85rem', color: theme.textMuted, marginTop: '8px' }}>Duration: Day 41 of 90</p>
            </div>

            <ProgressBar label="Protocol Completion" value={45} max={100} unit="%" color="#ef4444" />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginTop: '1.5rem' }}>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => navigate('/dailygoals')} style={buttonStyle('primary')}>
                View Objectives
              </motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => navigate('/adaptive-center')} style={buttonStyle('secondary')}>
                Compare Versions
              </motion.button>
            </div>
          </motion.div>

          {/* ================= SECTION 6: BEHAVIORAL ANALYSIS ================= */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="col-6" style={cardStyle}>
            <SectionHeader icon={Shield} title="Behavioral Analysis" />
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(59,130,246,0.3)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                <CheckCircle2 size={24} color="#3b82f6" style={{ margin: '0 auto 8px' }} />
                <p style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff', margin: 0 }}>Elite Discipline</p>
                <p style={{ fontSize: '0.65rem', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>System Rating</p>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(234,179,8,0.3)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                <AlertTriangle size={24} color="#eab308" style={{ margin: '0 auto 8px' }} />
                <p style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff', margin: 0 }}>Sleep Deficit</p>
                <p style={{ fontSize: '0.65rem', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>Identified Risk</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: theme.textMuted, fontWeight: 600 }}>Consistency Rate</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff' }}>95%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: theme.textMuted, fontWeight: 600 }}>Workout Adherence</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff' }}>100%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: theme.textMuted, fontWeight: 600 }}>Recovery Trend</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#4ade80', textTransform: 'uppercase' }}>Optimized ↑</span>
              </div>
            </div>
          </motion.div>

          {/* ================= SECTION 4: BODY INTELLIGENCE ================= */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="col-12" style={cardStyle}>
            <SectionHeader icon={Fingerprint} title="Body Intelligence Diagnostics" />
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
              
              {/* Macros & Intake */}
              <div>
                <ProgressBar label="Daily Caloric Intake" value={2450} max={2800} unit="kcal" color="#f97316" />
                <ProgressBar label="Protein Synthesis Target" value={145} max={160} unit="g" color="#3b82f6" />
                <ProgressBar label="Hydration Levels" value={2.1} max={3.0} unit="L" color="#0ea5e9" />
              </div>

              {/* Physical Metrics Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <p style={{ fontSize: '0.65rem', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Current Mass</p>
                  <p style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', margin: '4px 0' }}>{weight} <span style={{ fontSize: '0.8rem', color: theme.textMuted }}>kg</span></p>
                  <p style={{ fontSize: '0.65rem', color: theme.primary, fontWeight: 700 }}>Target: {target} kg</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <p style={{ fontSize: '0.65rem', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Est. Body Fat</p>
                  <p style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', margin: '4px 0' }}>14.2 <span style={{ fontSize: '0.8rem', color: theme.textMuted }}>%</span></p>
                  <p style={{ fontSize: '0.65rem', color: '#4ade80', fontWeight: 700 }}>Trending Down ↓</p>
                </div>
                <div style={{ gridColumn: '1 / -1', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: '0.65rem', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>BMI Index</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', margin: 0 }}>{bmi}</p>
                  </div>
                  <Dumbbell size={32} color={theme.textMuted} style={{ opacity: 0.3 }} />
                </div>
              </div>

            </div>
          </motion.div>

          {/* ================= SECTION 5: AI MEMORY ================= */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="col-6" style={cardStyle}>
            <SectionHeader icon={Database} title="System Logs // AI Memory" />
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {systemLogs.map((log, i) => (
                <div key={i} style={{ display: 'flex', gap: '1rem', position: 'relative', paddingBottom: '1.5rem' }}>
                  {/* Timeline track */}
                  {i !== systemLogs.length - 1 && <div style={{ position: 'absolute', left: '3.5px', top: '12px', bottom: 0, width: '1px', background: 'rgba(239,68,68,0.3)' }} />}
                  
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: i === 0 ? theme.primary : 'transparent', border: `1px solid ${theme.primary}`, marginTop: '4px', zIndex: 2, boxShadow: i === 0 ? '0 0 8px rgba(239,68,68,0.8)' : 'none', flexShrink: 0 }} />
                  
                  <div style={{ flex: 1, marginTop: '-2px' }}>
                    <span style={{ display: 'block', fontSize: '0.65rem', fontFamily: 'monospace', color: theme.primary, letterSpacing: '0.1em', marginBottom: '4px' }}>
                      &gt; {log.date}
                    </span>
                    <p style={{ fontSize: '0.85rem', color: i === 0 ? '#fff' : theme.textMuted, lineHeight: 1.5, margin: 0, fontWeight: i === 0 ? 600 : 400 }}>
                      {log.event}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ================= SECTION 8: ADAPTIVE FITNESS DNA ================= */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="col-6" style={cardStyle}>
            <SectionHeader icon={Brain} title="Adaptive Fitness DNA" glow />
            
            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '120px' }}>
                <p style={{ fontSize: '0.7rem', color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, marginBottom: '8px' }}>Strengths [+]</p>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <li style={{ fontSize: '0.8rem', color: '#e4e4e7' }}>• High volume consistency</li>
                  <li style={{ fontSize: '0.8rem', color: '#e4e4e7' }}>• Strong CNS recovery</li>
                </ul>
              </div>
              <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }} className="hidden sm:block" />
              <div style={{ flex: 1, minWidth: '120px' }}>
                <p style={{ fontSize: '0.7rem', color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, marginBottom: '8px' }}>Weaknesses [-]</p>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <li style={{ fontSize: '0.8rem', color: theme.textMuted }}>• Weekend caloric deficit</li>
                  <li style={{ fontSize: '0.8rem', color: theme.textMuted }}>• REM sleep adherence</li>
                </ul>
              </div>
            </div>

            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '1rem', marginTop: 'auto' }}>
              <p style={{ fontSize: '0.65rem', color: theme.primary, textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 800, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={12} /> AI Directive
              </p>
              <p style={{ fontSize: '0.9rem', color: '#fff', fontStyle: 'italic', margin: 0, lineHeight: 1.5 }}>
                "Increase deep sleep by 1 hour on training days to unlock faster muscle hypertrophy and mitigate burnout risk."
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}