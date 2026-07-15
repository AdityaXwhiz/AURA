import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  CheckCircle,
  ChevronLeft,
  Clock,
  Eye,
  Play,
  Plus,
  Server,
  Target,
  Trash2,
  X,
  Zap,
  Brain,
  Lightbulb,
  Calendar,
  Dumbbell
} from 'lucide-react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001';
const goalLabels = {
  aesthetic: 'Aesthetic Physique',
  fat_loss: 'Fat Loss',
  muscle_gain: 'Muscle Gain',
  lean_bulk: 'Lean Bulk',
  recomp: 'Body Recomposition',
};

/* ═══════════════════════════════════════════════════════════════════════════
   STYLES HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */
const cardStyle = {
  padding: '1.75rem',
  borderRadius: '20px',
  border: '1px solid rgba(63,63,70,0.3)',
  background: 'linear-gradient(135deg, rgba(24,24,27,0.7) 0%, rgba(15,15,15,0.85) 100%)',
  backdropFilter: 'blur(16px)',
  marginBottom: '1.5rem',
};

const smallCardStyle = {
  ...cardStyle,
  padding: '1.25rem',
  marginBottom: '0',
};

const activeCardStyle = {
  ...cardStyle,
  border: '1px solid rgba(239,68,68,0.4)',
  background: 'linear-gradient(135deg, rgba(127,29,29,0.15) 0%, rgba(15,15,15,0.85) 100%)',
};

const inputStyle = {
  width: '100%',
  padding: '14px 16px',
  borderRadius: '12px',
  border: '1px solid rgba(63,63,70,0.5)',
  background: 'rgba(9,9,11,0.8)',
  color: '#fff',
  fontSize: '0.95rem',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
};

const primaryButtonStyle = {
  padding: '12px 20px',
  borderRadius: '12px',
  border: 'none',
  background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
  color: '#fff',
  fontWeight: 700,
  fontSize: '0.85rem',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  transition: 'all 0.2s',
};

const secondaryButtonStyle = {
  ...primaryButtonStyle,
  background: 'rgba(39,39,42,0.8)',
  border: '1px solid rgba(63,63,70,0.5)',
  color: '#e4e4e7',
};

const dangerButtonStyle = {
  ...primaryButtonStyle,
  background: 'rgba(127,29,29,0.15)',
  border: '1px solid rgba(239,68,68,0.3)',
  color: '#f87171',
};

const dayTabStyle = (isSelected) => ({
  padding: '12px 20px',
  borderRadius: '12px',
  border: isSelected ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(63,63,70,0.5)',
  background: isSelected ? 'rgba(239,68,68,0.15)' : 'rgba(24,24,27,0.7)',
  color: isSelected ? '#ef4444' : '#a1a1aa',
  fontWeight: 700,
  fontSize: '0.9rem',
  cursor: 'pointer',
  transition: 'all 0.2s',
  whiteSpace: 'nowrap',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
export default function AdaptiveCenter() {
  const navigate = useNavigate();

  const [versions, setVersions] = useState([]);
  const [activeVersion, setActiveVersion] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [goal, setGoal] = useState('fat_loss');
  const [generating, setGenerating] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  
  // NEW STATE: Tracks which day is currently expanded in the modal
  const [selectedDayIndex, setSelectedDayIndex] = useState(null);

  useEffect(() => {
    fetchVersions();
  }, []);

  const fetchVersions = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/adaptive/versions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setVersions(data.versions || []);
        setActiveVersion(data.activeVersion || 1);
      }
    } catch (err) {
      console.error('Failed to load versions', err);
    } finally {
      setLoading(false);
    }
  };

  const activateVersion = async (version) => {
    try {
      setActivating(version);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/adaptive/activate/${version}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setActiveVersion(version);
        navigate('/dailygoals');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActivating(null);
    }
  };

  const deleteVersion = async (versionNumber) => {
    try {
      const confirmed = window.confirm(`Delete Version ${versionNumber}? This cannot be undone.`);
      if (!confirmed) return;
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/adaptive/version/${versionNumber}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        fetchVersions();
      } else {
        alert(data.message || 'Unable to delete version');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete version');
    }
  };

  const createVersion = async () => {
    try {
      setGenerating(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/adaptive/create-version`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ goal }),
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        navigate('/dailygoals');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  /* ── Generating State UI ── */
  if (generating) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', overflow: 'hidden', position: 'relative', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, rgba(127,29,29,0.2) 0%, #000 70%)' }} />
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} style={{ position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', border: '1px solid rgba(127,29,29,0.3)' }} />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2.5rem', zIndex: 10 }}>
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 8, ease: "linear" }} style={{ position: 'absolute', width: '176px', height: '176px', borderRadius: '50%', border: '2px solid rgba(153,27,27,0.8)' }} />
          <motion.div animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 12, ease: "linear" }} style={{ position: 'absolute', width: '224px', height: '224px', borderRadius: '50%', border: '1px dashed rgba(239,68,68,0.4)' }} />
          <div style={{ width: '112px', height: '112px', borderRadius: '50%', background: 'rgba(220,38,38,0.1)', border: '1px solid #ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#ef4444' }}>A</span>
          </div>
        </div>
        <h1 style={{ fontSize: '3.75rem', fontWeight: 900, letterSpacing: '0.4em', color: '#ef4444', marginBottom: '0.75rem', zIndex: 10 }}>AURA</h1>
        <p style={{ color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.25em', marginBottom: '2.5rem', fontSize: '0.875rem', zIndex: 10 }}>Adaptive Intelligence Engine</p>
        <div style={{ width: '420px', maxWidth: '90%', display: 'flex', flexDirection: 'column', gap: '1rem', zIndex: 10 }}>
          {['Analyzing Biometrics', 'Designing Workout Split', 'Optimizing Nutrition', 'Building Daily Objectives'].map((text, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.8 }} style={{ background: '#09090b', border: '1px solid rgba(127,29,29,0.4)', borderRadius: '12px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#e4e4e7' }}>{text}</span>
              <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ color: '#ef4444' }}>{i === 0 ? '✓' : '◉'}</motion.span>
            </motion.div>
          ))}
        </div>
        <motion.p animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }} style={{ marginTop: '3rem', color: '#71717a', fontSize: '0.875rem', letterSpacing: '0.15em', zIndex: 10 }}>GENERATING NEW PROTOCOL...</motion.p>
      </div>
    );
  }

  const active = versions.find((v) => v.version === activeVersion);

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif", position: 'relative', overflow: 'hidden' }}>
      {/* Background effects */}
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(circle at 50% -20%, rgba(220,38,38,0.08) 0%, transparent 50%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(circle at 80% 80%, rgba(139,92,246,0.04) 0%, transparent 40%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '7rem 1.5rem 5rem', position: 'relative', zIndex: 10 }}>
        {/* Back button */}
        <motion.button onClick={() => navigate(-1)} whileHover={{ x: -3 }} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#71717a', fontSize: '0.85rem', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', marginBottom: '2rem', transition: 'color 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')} onMouseLeave={(e) => (e.currentTarget.style.color = '#71717a')}>
          <ChevronLeft size={16} /> Back
        </motion.button>

        {/* ── HEADER ── */}
        <div style={{ marginBottom: '3rem' }}>
          <p style={{ color: '#ef4444', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.5em', fontFamily: 'monospace', fontWeight: 700 }}>AURA System Core</p>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 900, fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: '-0.03em', marginTop: '0.75rem', lineHeight: 1.1 }}>ADAPTIVE CENTER</h1>
          <p style={{ color: '#71717a', marginTop: '0.75rem', maxWidth: '600px', fontSize: '0.9rem', lineHeight: 1.5 }}>Manage and generate AI-optimized protocol versions tailored to your evolving biometrics and goals.</p>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#71717a', ...cardStyle }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} style={{ display: 'inline-block', marginBottom: '1rem' }}><Zap size={24} color="#ef4444" /></motion.div>
            <p>Loading AURA versions...</p>
          </div>
        ) : (
          <>
            {/* ── ACTIVE VERSION CARD ── */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={activeCardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                <CheckCircle size={18} color="#ef4444" />
                <p style={{ color: '#ef4444', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.15em' }}>Active Protocol</p>
              </div>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 900, fontStyle: 'italic', marginBottom: '0.5rem' }}>Version {activeVersion}</h2>
              <div style={{ display: 'flex', gap: '2rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                <div>
                  <p style={{ color: '#71717a', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Primary Goal</p>
                  <p style={{ color: '#e4e4e7', fontSize: '1.1rem', fontWeight: 600, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}><Target size={16} color="#a1a1aa" /> {goalLabels[active?.goal] || active?.goal || 'Not Available'}</p>
                </div>
                <div>
                  <p style={{ color: '#71717a', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Protocol Structure</p>
                  <p style={{ color: '#e4e4e7', fontSize: '1.1rem', fontWeight: 600, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}><Activity size={16} color="#a1a1aa" /> {active?.protocol || 'Not Available'}</p>
                </div>
              </div>
              <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px solid rgba(63,63,70,0.4)' }}>
                <p style={{ color: '#a1a1aa', fontSize: '0.85rem', fontStyle: 'italic', lineHeight: 1.6 }}>"{active?.aiReason || 'Initial AURA generated version based on foundational metrics.'}"</p>
              </div>
            </motion.div>

            {/* ── VERSION HISTORY HEADER ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', marginTop: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}><Server size={24} color="#ef4444" /> Version History</h3>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowModal(true)} style={primaryButtonStyle}><Plus size={16} /> Create New Version</motion.button>
            </div>

            {/* ── VERSION LIST ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <AnimatePresence>
                {versions.map((version, idx) => (
                  <motion.div key={version.version} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: idx * 0.1 }} style={{ ...cardStyle, marginBottom: 0, padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                        <h4 style={{ fontWeight: 800, fontSize: '1.25rem' }}>Version {version.version}</h4>
                        {version.version === activeVersion && <span style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)', padding: '2px 8px', borderRadius: '8px', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>ACTIVE</span>}
                      </div>
                      <p style={{ color: '#a1a1aa', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}><Target size={14} /> {goalLabels[version.goal] || version.goal} <span style={{ opacity: 0.3 }}>|</span> <Activity size={14} /> {version.protocol}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <motion.button
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setSelectedVersion(version);
                          setSelectedDayIndex(null); // Reset selected day on open
                          setShowPlanModal(true);
                        }}
                        style={secondaryButtonStyle}
                      >
                        <Eye size={16} /> View
                      </motion.button>
                      {version.version !== activeVersion && (
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => deleteVersion(version.version)} style={dangerButtonStyle}><Trash2 size={16} /></motion.button>
                      )}
                      {version.version !== activeVersion && (
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => activateVersion(version.version)} disabled={activating === version.version} style={{ ...primaryButtonStyle, opacity: activating === version.version ? 0.5 : 1, cursor: activating === version.version ? 'not-allowed' : 'pointer' }}>
                          {activating === version.version ? <><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}><Zap size={16} /></motion.div> Activating...</> : <><Play size={16} /> Activate</>}
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>

      {/* ── CREATE VERSION MODAL ── */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} style={{ width: '100%', maxWidth: '450px', background: '#0a0a0a', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '24px', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Initialize New Version</h2>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer' }}><X size={20} /></button>
              </div>
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Target Optimization Goal</label>
                <select value={goal} onChange={(e) => setGoal(e.target.value)} style={inputStyle}>
                  <option value="fat_loss">Fat Loss</option>
                  <option value="muscle_gain">Muscle Gain</option>
                  <option value="lean_bulk">Lean Bulk</option>
                  <option value="recomp">Body Recomposition</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowModal(false)} style={{ ...secondaryButtonStyle, flex: 1, padding: '16px' }}>Cancel</motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={createVersion} style={{ ...primaryButtonStyle, flex: 1, padding: '16px' }}><Zap size={18} /> Generate</motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── VIEW PLAN MODAL ── */}
      <AnimatePresence>
        {showPlanModal && selectedVersion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(12px)', overflowY: 'auto', padding: '4rem 1.5rem' }}
          >
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <p style={{ color: '#ef4444', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 700, marginBottom: '0.5rem' }}>Protocol Blueprint</p>
                  <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, fontStyle: 'italic', textTransform: 'uppercase', color: '#fff', lineHeight: 1 }}>VERSION {selectedVersion.version}</h2>
                  <p style={{ color: '#a1a1aa', marginTop: '1rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Target size={18} /> {goalLabels[selectedVersion.goal] || selectedVersion.goal}
                  </p>
                </div>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowPlanModal(false)} style={{ ...secondaryButtonStyle, padding: '12px 24px' }}>
                  <X size={18} /> Close Blueprint
                </motion.button>
              </div>

              {/* Top Section: AI Info & Tips (Shown first inherently by layout) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                {/* AI Reason Card */}
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ ...smallCardStyle, background: 'linear-gradient(135deg, rgba(127,29,29,0.15) 0%, rgba(15,15,15,0.85) 100%)', border: '1px solid rgba(239,68,68,0.3)' }}>
                  <p style={{ fontSize: '0.65rem', letterSpacing: '0.2em', color: '#ef4444', textTransform: 'uppercase', fontWeight: 800, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Brain size={14} /> AI Intelligence
                  </p>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '0.75rem', lineHeight: 1.2 }}>Why This Version Exists</h3>
                  <p style={{ color: '#d4d4d8', fontSize: '0.9rem', lineHeight: 1.6 }}>{selectedVersion.aiReason || 'Generated utilizing core AURA algorithms based on baseline configuration.'}</p>
                </motion.div>

                {/* Tips Card */}
                {selectedVersion.plan?.tips?.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={smallCardStyle}>
                    <p style={{ fontSize: '0.65rem', letterSpacing: '0.2em', color: '#ef4444', textTransform: 'uppercase', fontWeight: 800, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Lightbulb size={14} /> AURA Tips
                    </p>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '0.75rem', lineHeight: 1.2 }}>Optimization Notes</h3>
                    <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {selectedVersion.plan.tips.map((tip, i) => (
                        <li key={i} style={{ color: '#d4d4d8', fontSize: '0.85rem', lineHeight: 1.5, display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                          <span style={{ color: '#ef4444', marginTop: '2px', fontSize: '1.2rem', lineHeight: '1rem' }}>•</span> {tip}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </div>

              {/* Middle Section: Day Selector */}
              {selectedVersion.plan?.weeklyWorkout && selectedVersion.plan.weeklyWorkout.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ marginBottom: '1.5rem' }}>
                  <p style={{ color: '#a1a1aa', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} /> Select a day to view details
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'none' }}>
                    {selectedVersion.plan.weeklyWorkout.map((day, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setSelectedDayIndex(index)}
                        style={dayTabStyle(selectedDayIndex === index)}
                      >
                        {day.day || `Day ${index + 1}`}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Bottom Section: Expanded Selected Day */}
              <AnimatePresence mode="wait">
                {selectedDayIndex !== null && selectedVersion.plan?.weeklyWorkout?.[selectedDayIndex] && (
                  <motion.div
                    key={selectedDayIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    style={{ ...cardStyle, marginTop: '1rem' }}
                  >
                    <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Clock size={20} color="#ef4444" />
                      <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', textTransform: 'uppercase' }}>
                        {selectedVersion.plan.weeklyWorkout[selectedDayIndex].day || `Day ${selectedDayIndex + 1}`} Breakdown
                      </h3>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                      {Object.entries(selectedVersion.plan.weeklyWorkout[selectedDayIndex])
                        .filter(([key]) => key !== 'day')
                        .map(([key, value]) => (
                          <div key={key} style={{ background: 'rgba(9,9,11,0.6)', border: '1px solid rgba(63,63,70,0.5)', borderRadius: '12px', padding: '16px' }}>
                            <p style={{ color: '#ef4444', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 800, marginBottom: '12px', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {key === 'exercises' ? <Dumbbell size={14} /> : <Activity size={14} />} {key}
                            </p>
                            
                            {/* Format structured exercises beautifully instead of raw JSON */}
                            {key === 'exercises' && Array.isArray(value) ? (
                              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {value.map((ex, idx) => (
                                  <li key={idx} style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: '8px', borderLeft: '3px solid #ef4444' }}>
                                    <span style={{ display: 'block', color: '#fff', fontWeight: 700, fontSize: '0.9rem', marginBottom: '4px' }}>{ex.name}</span>
                                    <span style={{ color: '#a1a1aa', fontSize: '0.8rem', fontWeight: 600 }}>{ex.sets} Sets × {ex.reps} Reps</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p style={{ color: '#e4e4e7', fontSize: '0.95rem', wordBreak: 'break-word', lineHeight: 1.5, fontWeight: 500 }}>
                                {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                              </p>
                            )}
                          </div>
                        ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}