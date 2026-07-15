import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Battery,
  ChevronLeft,
  Clock,
  Droplets,
  Dumbbell,
  Flame,
  Moon,
  Smile,
  AlertTriangle,
  FileText,
  Zap
} from 'lucide-react';

const initialState = {
  sleepHours: '',
  energyLevel: '3',
  mood: 'neutral',
  availableTime: '',
  equipment: 'gym',
  waterIntake: '',
  muscleSoreness: [],
  injury: false,
  injuryDescription: '',
  stressLevel: '3',
  notes: '',
};

const muscleGroups = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core'];

/* ═══════════════════════════════════════════════════════════════════════════
   STYLES HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */
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
  marginTop: '8px',
  fontFamily: 'inherit',
};

const labelStyle = {
  display: 'flex',
  flexDirection: 'column',
  fontSize: '0.8rem',
  fontWeight: 700,
  color: '#a1a1aa',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
};

const cardStyle = {
  padding: '1.75rem',
  borderRadius: '20px',
  border: '1px solid rgba(63,63,70,0.3)',
  background: 'linear-gradient(135deg, rgba(24,24,27,0.7) 0%, rgba(15,15,15,0.85) 100%)',
  backdropFilter: 'blur(16px)',
  marginBottom: '1.5rem',
};

const iconTitleStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '1rem',
  fontWeight: 900,
  textTransform: 'uppercase',
  letterSpacing: '0.15em',
  color: '#ef4444',
  marginBottom: '1.5rem',
};

function DailyCheckin() {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  useAuth();

  useEffect(() => {
    const checkTodayWorkout = async () => {
      try {
        const token = localStorage.getItem('token');
        await axios.get('https://aura-backend-nxps.onrender.com/api/adaptive/today', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        navigate('/dailygoals', { replace: true });
      } catch (err) {
        // No workout for today yet, stay on the check-in page.
      }
    };
    checkTodayWorkout();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox' && name === 'injury') {
      setForm((prev) => ({
        ...prev,
        [name]: checked,
        injuryDescription: checked ? prev.injuryDescription : '',
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleCheckboxChange = (muscle, checked) => {
    setForm((prev) => {
      if (checked) {
        return {
          ...prev,
          muscleSoreness: [...prev.muscleSoreness, muscle],
        };
      } else {
        return {
          ...prev,
          muscleSoreness: prev.muscleSoreness.filter((m) => m !== muscle),
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      await axios.post(
        'https://aura-backend-nxps.onrender.com/api/adaptive/checkin',
        {
          sleepHours: Number(form.sleepHours),
          energyLevel: Number(form.energyLevel),
          mood: form.mood,
          availableTime: Number(form.availableTime),
          equipment: form.equipment,
          waterIntake: Number(form.waterIntake),
          muscleSoreness: form.muscleSoreness,
          injury: form.injury,
          injuryDescription: form.injury ? form.injuryDescription : '',
          stressLevel: Number(form.stressLevel),
          notes: form.notes,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setLoading(false);
      navigate('/dailygoals', { replace: true });
    } catch (err) {
      setLoading(false);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Something went wrong. Please try again.');
      }
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#000',
        color: '#fff',
        fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background effects */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'radial-gradient(circle at 50% -20%, rgba(220,38,38,0.08) 0%, transparent 50%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'radial-gradient(circle at 80% 80%, rgba(139,92,246,0.04) 0%, transparent 40%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '7rem 1.5rem 5rem',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Back button */}
        <motion.button
          onClick={() => navigate(-1)}
          whileHover={{ x: -3 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: '#71717a',
            fontSize: '0.85rem',
            fontWeight: 600,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            marginBottom: '2rem',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#71717a')}
        >
          <ChevronLeft size={16} /> Back
        </motion.button>

        {/* ── HEADER ── */}
        <div style={{ marginBottom: '2.5rem' }}>
          <p
            style={{
              color: '#ef4444',
              fontSize: '0.6rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5em',
              fontFamily: 'monospace',
              fontWeight: 700,
            }}
          >
            AURA System
          </p>
          <h1
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.2rem)',
              fontWeight: 900,
              fontStyle: 'italic',
              textTransform: 'uppercase',
              letterSpacing: '-0.03em',
              marginTop: '0.75rem',
              lineHeight: 1.1,
            }}
          >
            DAILY CALIBRATION
          </h1>
          <p
            style={{
              color: '#71717a',
              marginTop: '0.75rem',
              maxWidth: '600px',
              fontSize: '0.9rem',
              lineHeight: 1.5,
            }}
          >
            Log your current physical and mental state. AURA will instantly analyze your biometrics and adapt today’s protocol for maximum efficiency.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Section 1: Vitals */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={cardStyle}
          >
            <h2 style={iconTitleStyle}>
              <Battery size={20} /> Vitals
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              <label style={labelStyle}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Moon size={14} color="#a1a1aa" /> Sleep (Hours)</span>
                <input
                  type="number"
                  name="sleepHours"
                  min="0"
                  max="24"
                  value={form.sleepHours}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                  placeholder="e.g. 7.5"
                />
              </label>

              <label style={labelStyle}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Battery size={14} color="#a1a1aa" /> Energy Level</span>
                <select
                  name="energyLevel"
                  value={form.energyLevel}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                >
                  <option value="1">1 - Depleted</option>
                  <option value="2">2 - Low</option>
                  <option value="3">3 - Operational</option>
                  <option value="4">4 - High</option>
                  <option value="5">5 - Overcharged</option>
                </select>
              </label>

              <label style={labelStyle}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Smile size={14} color="#a1a1aa" /> Mood</span>
                <select
                  name="mood"
                  value={form.mood}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                >
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="neutral">Neutral</option>
                  <option value="low">Low</option>
                  <option value="exhausted">Exhausted</option>
                </select>
              </label>
            </div>
          </motion.div>

          {/* Section 2: Parameters */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            style={cardStyle}
          >
            <h2 style={iconTitleStyle}>
              <Clock size={20} /> Parameters
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              <label style={labelStyle}>
                Time Available (Mins)
                <input
                  type="number"
                  name="availableTime"
                  min="0"
                  value={form.availableTime}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                  placeholder="e.g. 45"
                />
              </label>

              <label style={labelStyle}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Dumbbell size={14} color="#a1a1aa" /> Equipment</span>
                <select
                  name="equipment"
                  value={form.equipment}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                >
                  <option value="gym">Full Gym</option>
                  <option value="home">Home Setup</option>
                  <option value="bands">Resistance Bands</option>
                  <option value="bodyweight">Bodyweight Only</option>
                </select>
              </label>

              <label style={labelStyle}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Droplets size={14} color="#a1a1aa" /> Water Intake (oz)</span>
                <input
                  type="number"
                  name="waterIntake"
                  min="0"
                  value={form.waterIntake}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                  placeholder="e.g. 64"
                />
              </label>
            </div>
          </motion.div>

          {/* Section 3: Body Status */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            style={cardStyle}
          >
            <h2 style={iconTitleStyle}>
              <Activity size={20} /> Body Status
            </h2>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Muscle Soreness (Select all that apply)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '12px' }}>
                {muscleGroups.map((muscle) => {
                  const isChecked = form.muscleSoreness.includes(muscle);
                  return (
                    <label
                      key={muscle}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '10px 16px',
                        borderRadius: '12px',
                        border: isChecked ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(63,63,70,0.5)',
                        background: isChecked ? 'rgba(239,68,68,0.1)' : 'rgba(9,9,11,0.8)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        color: isChecked ? '#ef4444' : '#a1a1aa',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      <input
                        type="checkbox"
                        name="muscleSoreness"
                        value={muscle}
                        checked={isChecked}
                        onChange={(e) => handleCheckboxChange(muscle, e.target.checked)}
                        style={{ display: 'none' }}
                      />
                      {muscle}
                    </label>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={labelStyle}>Condition</label>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: form.injury ? '1px solid rgba(245,158,11,0.5)' : '1px solid rgba(63,63,70,0.5)',
                    background: form.injury ? 'rgba(245,158,11,0.1)' : 'rgba(9,9,11,0.8)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    marginTop: '8px',
                    color: form.injury ? '#fbbf24' : '#a1a1aa',
                    fontWeight: 700,
                  }}
                >
                  <input
                    type="checkbox"
                    name="injury"
                    checked={form.injury}
                    onChange={handleChange}
                    style={{ width: '18px', height: '18px', accentColor: '#f59e0b', cursor: 'pointer' }}
                  />
                  <AlertTriangle size={16} /> I have a physical injury
                </label>
              </div>

              <label style={labelStyle}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Flame size={14} color="#a1a1aa" /> Stress Level</span>
                <select
                  name="stressLevel"
                  value={form.stressLevel}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                >
                  <option value="1">1 - Minimal</option>
                  <option value="2">2 - Low</option>
                  <option value="3">3 - Moderate</option>
                  <option value="4">4 - High</option>
                  <option value="5">5 - Extreme</option>
                </select>
              </label>
            </div>

            <AnimatePresence>
              {form.injury && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ overflow: 'hidden' }}
                >
                  <label style={labelStyle}>
                    Injury Description
                    <textarea
                      name="injuryDescription"
                      value={form.injuryDescription}
                      onChange={handleChange}
                      required={form.injury}
                      style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                      placeholder="Briefly describe the affected area..."
                    />
                  </label>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Section 4: Notes */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            style={cardStyle}
          >
            <h2 style={iconTitleStyle}>
              <FileText size={20} /> Log Notes
            </h2>
            <label style={labelStyle}>
              Additional Context
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={3}
                style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                placeholder="Any additional details affecting today's readiness..."
              />
            </label>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                padding: '1.25rem',
                borderRadius: '16px',
                border: '1px solid rgba(127,29,29,0.4)',
                background: 'rgba(127,29,29,0.1)',
                color: '#fca5a5',
                marginBottom: '1.5rem',
                textAlign: 'center',
                fontWeight: 600,
                fontSize: '0.9rem',
              }}
            >
              {error}
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: loading ? 1 : 1.01 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '18px',
              borderRadius: '16px',
              border: 'none',
              background: loading ? 'rgba(63,63,70,0.5)' : 'linear-gradient(135deg, #ef4444, #b91c1c)',
              color: loading ? '#a1a1aa' : '#fff',
              fontWeight: 800,
              fontSize: '1rem',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: loading ? 'none' : '0 10px 25px -5px rgba(220, 38, 38, 0.4)',
              transition: 'all 0.3s',
            }}
          >
            {loading ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}>
                  <Zap size={18} />
                </motion.div>
                Analyzing Biometrics...
              </>
            ) : (
              <>
                <Zap size={18} /> Initialize Daily Protocol
              </>
            )}
          </motion.button>
        </form>
      </div>
    </div>
  );
}

export default DailyCheckin;