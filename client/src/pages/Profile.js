import { useEffect, useRef, useState, useCallback } from "react";
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

/* ════════════════════════════════════════════════════════════════
   AURA SYSTEM — Premium Profile v2
   Theme  : Deep crimson #b91c1c · Glass morphism · Precision glow
   Fonts  : Rajdhani (UI) · Orbitron (numbers) · Share Tech Mono
════════════════════════════════════════════════════════════════ */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Orbitron:wght@400;600;700;900&family=Share+Tech+Mono&display=swap');

/* ── DESIGN TOKENS ─────────────────────────────── */
.ap {
  --r:        #b91c1c;
  --r-hi:     #dc2626;
  --r-glow:   rgba(185,28,28,0.55);
  --r-soft:   rgba(185,28,28,0.13);
  --r-dim:    rgba(185,28,28,0.07);
  --r-border: rgba(185,28,28,0.28);
  --r-line:   rgba(185,28,28,0.18);

  --glass:    rgba(255,255,255,0.028);
  --glass2:   rgba(255,255,255,0.045);
  --border:   rgba(255,255,255,0.075);
  --border2:  rgba(255,255,255,0.05);

  --txt:      #f1f5f9;
  --txt2:     #b0bec5;
  --txt3:     #607d8b;
  --bg:       #060608;

  --radius:   10px;
  --shadow:   0 4px 24px rgba(0,0,0,0.55);
  --shadow-r: 0 4px 20px rgba(185,28,28,0.18);
}

/* ── RESET ─────────────────────────────────────── */
.ap *, .ap *::before, .ap *::after {
  box-sizing: border-box; margin: 0; padding: 0;
}
.ap button { font-family: 'Rajdhani', sans-serif; }

/* ── BASE PAGE ─────────────────────────────────── */
.ap {
  min-height: 100vh;
  background: var(--bg);
  color: var(--txt);
  font-family: 'Rajdhani', sans-serif;
  font-size: 15px;
  line-height: 1.5;
  position: relative;
  overflow-x: hidden;
}

/* dimmer grid — fixed so cards scroll over it */
.ap-grid-bg {
  position: fixed; inset: 0;
  background-image:
    linear-gradient(rgba(185,28,28,0.022) 1px, transparent 1px),
    linear-gradient(90deg, rgba(185,28,28,0.022) 1px, transparent 1px);
  background-size: 68px 68px;
  pointer-events: none;
  z-index: 0;
  will-change: transform;
  transition: transform 0.12s linear;
}
/* top vignette */
.ap-grid-bg::after {
  content: '';
  position: absolute; inset: 0;
  background: radial-gradient(ellipse 90% 35% at 50% 0%, rgba(185,28,28,0.06) 0%, transparent 100%);
}

/* ── SCROLL CONTAINER ──────────────────────────── */
.ap-inner {
  position: relative; z-index: 1;
  max-width: 1120px;
  margin: 0 auto;
  padding: 36px 24px 100px;
}

/* ── NAV ───────────────────────────────────────── */
.ap-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 48px;
}
/* AURA logo — Rajdhani to match landing page */
.ap-logo {
  font-family: 'Rajdhani', sans-serif;
  font-size: 26px;
  font-weight: 700;
  letter-spacing: 0.5em;
  text-transform: uppercase;
  color: var(--txt);
  position: relative;
  padding-bottom: 4px;
}
.ap-logo::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0;
  width: 60%; height: 1px;
  background: linear-gradient(90deg, var(--r), transparent);
}
.ap-logo em {
  font-style: normal;
  color: var(--r);
}
.ap-nav-right { display: flex; gap: 10px; }
.ap-btn {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--txt2);
  padding: 7px 18px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  border-radius: 5px;
  transition: all 0.22s ease;
}
.ap-btn:hover {
  border-color: var(--r-border);
  color: var(--txt);
  background: var(--r-dim);
}
.ap-btn.red {
  border-color: var(--r-border);
  color: var(--r);
}
.ap-btn.red:hover {
  background: var(--r-soft);
  border-color: var(--r);
  box-shadow: 0 0 14px rgba(185,28,28,0.22);
}

/* ── SECTION HEADER ────────────────────────────── */
.ap-sh {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}
.ap-sh-tag {
  font-family: 'Share Tech Mono', monospace;
  font-size: 10px;
  letter-spacing: 0.38em;
  text-transform: uppercase;
  color: var(--r);
  white-space: nowrap;
}
.ap-sh-line {
  flex: 1; height: 1px;
  background: linear-gradient(90deg, var(--r-line), transparent);
}
.ap-sh-idx {
  font-family: 'Share Tech Mono', monospace;
  font-size: 10px;
  color: var(--txt3);
}

/* ── CARD ──────────────────────────────────────── */
.ap-card {
  background: var(--glass);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow);
  transition: transform 0.28s cubic-bezier(0.23,1,0.32,1),
              box-shadow 0.28s ease,
              border-color 0.28s ease;
  will-change: transform;
}
/* top accent line */
.ap-card::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent 0%, var(--r-border) 50%, transparent 100%);
}
/* hover scan sweep */
.ap-card::after {
  content: '';
  position: absolute; top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(185,28,28,0.5), transparent);
  transform: translateY(-2px);
  transition: transform 0.5s ease;
  pointer-events: none;
}
.ap-card:hover::after { transform: translateY(250px); }
.ap-card:hover {
  border-color: var(--r-border);
  box-shadow: var(--shadow), 0 0 0 1px rgba(185,28,28,0.08), var(--shadow-r);
}

/* ── HERO GRID ─────────────────────────────────── */
.ap-hero {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 20px;
  margin-bottom: 48px;
  align-items: start;
}
@media (max-width: 780px) { .ap-hero { grid-template-columns: 1fr; } }

/* ── IDENTITY CARD ─────────────────────────────── */
.ap-id { padding: 32px; }

.ap-id-top {
  display: flex;
  align-items: center;
  gap: 22px;
  margin-bottom: 30px;
}
.ap-avatar {
  width: 76px; height: 76px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--r), var(--r-hi));
  display: flex; align-items: center; justify-content: center;
  font-family: 'Orbitron', monospace;
  font-size: 28px; font-weight: 900;
  color: #fff;
  flex-shrink: 0;
  position: relative;
  box-shadow: 0 0 22px rgba(185,28,28,0.35);
}
.ap-avatar::after {
  content: '';
  position: absolute; inset: -4px;
  border-radius: 50%;
  border: 1px solid rgba(185,28,28,0.35);
  animation: ap-pulse 2.8s ease-in-out infinite;
}
@keyframes ap-pulse {
  0%,100% { transform: scale(1); opacity: 0.55; }
  50%      { transform: scale(1.14); opacity: 0.12; }
}
.ap-id-name {
  font-family: 'Rajdhani', sans-serif;
  font-size: 28px; font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--txt);
  line-height: 1.1;
}
.ap-id-email {
  font-family: 'Share Tech Mono', monospace;
  font-size: 12px;
  color: var(--txt3);
  margin-top: 4px;
}
.ap-rank-badge {
  display: inline-flex;
  align-items: center; gap: 8px;
  margin-top: 9px;
  background: var(--r-soft);
  border: 1px solid var(--r-border);
  border-radius: 100px;
  padding: 4px 14px;
  font-family: 'Share Tech Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--r);
}
.ap-rank-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--r);
  box-shadow: 0 0 5px var(--r);
  animation: ap-blink 1.6s ease-in-out infinite;
}
@keyframes ap-blink { 0%,100%{opacity:1} 50%{opacity:0.25} }

/* stat trio */
.ap-id-stats {
  display: flex; gap: 24px;
  flex-wrap: wrap;
  margin-bottom: 28px;
}
.ap-stat { display: flex; flex-direction: column; gap: 1px; }
.ap-stat-val {
  font-family: 'Orbitron', monospace;
  font-size: 24px; font-weight: 700;
  color: var(--r);
  text-shadow: 0 0 10px rgba(185,28,28,0.4);
}
.ap-stat-lbl {
  font-size: 11px; font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--txt2);
}

/* rank progress */
.ap-rp {
  padding-top: 22px;
  border-top: 1px solid var(--border2);
}
.ap-rp-hdr {
  display: flex; justify-content: space-between;
  margin-bottom: 10px;
  font-size: 12px; font-weight: 600;
  letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--txt2);
}
.ap-rp-hdr span:last-child {
  font-family: 'Orbitron', monospace;
  color: var(--r);
}
.ap-track {
  height: 5px;
  background: rgba(255,255,255,0.06);
  border-radius: 100px; overflow: visible;
  position: relative;
}
.ap-fill {
  height: 100%; border-radius: 100px;
  background: linear-gradient(90deg, var(--r), var(--r-hi));
  box-shadow: 0 0 8px rgba(185,28,28,0.45);
  transition: width 1.4s cubic-bezier(0.22,1,0.36,1);
  position: relative;
}
.ap-fill::after {
  content: '';
  position: absolute; right: -1px; top: -3px;
  width: 10px; height: 10px; border-radius: 50%;
  background: var(--r-hi);
  box-shadow: 0 0 6px var(--r);
}
.ap-xp-next {
  margin-top: 8px;
  font-family: 'Share Tech Mono', monospace;
  font-size: 11px; color: var(--txt3);
  text-align: right;
}

/* ── HOLOGRAM COLUMN ───────────────────────────── */
.ap-holo-col {
  display: flex; flex-direction: column; gap: 16px;
}
.ap-holo-card {
  height: 260px;
  display: flex; align-items: center; justify-content: center;
  position: relative;
  overflow: hidden;
}
.ap-holo-card canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
}
.ap-holo-tag {
  position: absolute; bottom: 14px; left: 0; right: 0;
  text-align: center;
  font-family: 'Share Tech Mono', monospace;
  font-size: 10px; letter-spacing: 0.35em;
  color: rgba(185,28,28,0.45);
  text-transform: uppercase;
}

/* analytics mini-card inside holo col */
.ap-analytics { padding: 20px 22px; }
.ap-analytics-grid {
  display: grid; grid-template-columns: 1fr 1fr 1fr;
  gap: 12px; margin-top: 12px;
}
.ap-an-item { display: flex; flex-direction: column; gap: 3px; }
.ap-an-val {
  font-family: 'Orbitron', monospace;
  font-size: 18px; font-weight: 700;
  color: var(--txt);
}
.ap-an-lbl {
  font-size: 10px; font-weight: 600;
  letter-spacing: 0.16em; text-transform: uppercase;
  color: var(--txt2);
}
.ap-an-tag {
  font-size: 11px; font-weight: 700;
  letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--r);
  margin-top: 2px;
}

/* ── SECONDARY ROW ─────────────────────────────── */
.ap-secondary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}
@media (max-width: 640px) { .ap-secondary { grid-template-columns: 1fr; } }

/* XP Graph */
.ap-graph-card { padding: 22px; }
.ap-graph-area {
  position: relative;
  height: 90px; margin-top: 14px;
}
.ap-graph-area canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
}
.ap-graph-days {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
}
.ap-graph-days span {
  font-family: 'Share Tech Mono', monospace;
  font-size: 10px; color: var(--txt3);
  letter-spacing: 0.05em;
}

/* Goal Weight Progress */
.ap-goal-card { padding: 22px; }
.ap-goal-numbers {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 14px 0 10px;
}
.ap-goal-num {
  display: flex; flex-direction: column; gap: 2px;
}
.ap-goal-val {
  font-family: 'Orbitron', monospace;
  font-size: 22px; font-weight: 700;
}
.ap-goal-val.start { color: var(--txt2); }
.ap-goal-val.target { color: var(--r); }
.ap-goal-num-lbl {
  font-size: 10px; font-weight: 600;
  letter-spacing: 0.16em; text-transform: uppercase;
  color: var(--txt3);
}
.ap-goal-arrow {
  font-size: 20px; color: var(--txt3);
}
.ap-goal-track {
  height: 5px;
  background: rgba(255,255,255,0.06);
  border-radius: 100px; overflow: hidden;
}
.ap-goal-fill {
  height: 100%; border-radius: 100px;
  background: linear-gradient(90deg, var(--r-hi), var(--r));
  box-shadow: 0 0 7px rgba(185,28,28,0.4);
  transition: width 1.4s cubic-bezier(0.22,1,0.36,1);
}
.ap-goal-footer {
  display: flex; justify-content: space-between;
  margin-top: 8px;
}
.ap-goal-footer span {
  font-family: 'Share Tech Mono', monospace;
  font-size: 11px; color: var(--txt3);
}
.ap-goal-footer span:last-child { color: var(--r); }

/* ── NEXT ACTION / AI PANEL ────────────────────── */
.ap-action-card { padding: 22px; margin-bottom: 20px; }
.ap-action-header {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 16px;
}
.ap-action-icon {
  width: 28px; height: 28px;
  border-radius: 6px;
  background: var(--r-soft);
  border: 1px solid var(--r-border);
  display: flex; align-items: center; justify-content: center;
  font-size: 13px;
}
.ap-action-title {
  font-family: 'Share Tech Mono', monospace;
  font-size: 11px; letter-spacing: 0.22em;
  text-transform: uppercase; color: var(--r);
}
.ap-action-title span {
  display: inline-block;
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--r); margin-right: 8px;
  box-shadow: 0 0 5px var(--r);
  animation: ap-blink 1.6s infinite;
  vertical-align: middle;
}
.ap-suggestions {
  display: flex; flex-direction: column; gap: 10px;
}
.ap-suggestion {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 16px;
  background: var(--r-dim);
  border: 1px solid rgba(185,28,28,0.14);
  border-radius: 7px;
  transition: background 0.2s, border-color 0.2s;
}
.ap-suggestion:hover {
  background: var(--r-soft);
  border-color: var(--r-border);
}
.ap-suggestion-icon { font-size: 16px; flex-shrink: 0; }
.ap-suggestion-text {
  font-size: 14px; font-weight: 600;
  color: var(--txt2);
  letter-spacing: 0.02em;
}
.ap-suggestion-text strong { color: var(--txt); font-weight: 700; }

/* ── BODY METRICS ──────────────────────────────── */
.ap-metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(155px, 1fr));
  gap: 14px;
  margin-bottom: 48px;
}
.ap-metric-card {
  padding: 18px 20px;
}
.ap-metric-lbl {
  font-size: 10px; font-weight: 600;
  letter-spacing: 0.2em; text-transform: uppercase;
  color: var(--txt2);
  margin-bottom: 8px;
}
.ap-metric-val {
  font-family: 'Orbitron', monospace;
  font-size: 20px; font-weight: 700;
  color: var(--txt); line-height: 1;
}
.ap-metric-unit {
  font-family: 'Share Tech Mono', monospace;
  font-size: 11px; color: var(--r);
  margin-left: 3px;
}
.ap-metric-text {
  font-family: 'Rajdhani', sans-serif;
  font-size: 16px; font-weight: 600;
  color: var(--txt);
  text-transform: capitalize;
}

/* ── WEEKLY STATS ──────────────────────────────── */
.ap-weekly-grid {
  display: grid;
  grid-template-columns: repeat(3,1fr);
  gap: 14px;
  margin-bottom: 48px;
}
@media (max-width: 480px) { .ap-weekly-grid { grid-template-columns: 1fr; } }
.ap-weekly-card { padding: 26px 20px; text-align: center; }
.ap-weekly-val {
  font-family: 'Orbitron', monospace;
  font-size: 30px; font-weight: 900;
  color: var(--r);
  text-shadow: 0 0 14px rgba(185,28,28,0.35);
  display: block; margin-bottom: 8px;
}
.ap-weekly-lbl {
  font-size: 11px; font-weight: 600;
  letter-spacing: 0.22em; text-transform: uppercase;
  color: var(--txt2);
}

/* ── ACHIEVEMENTS ──────────────────────────────── */
.ap-achieve-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px,1fr));
  gap: 14px;
  margin-bottom: 48px;
}
.ap-badge {
  padding: 18px 20px;
  display: flex; align-items: center; gap: 14px;
}
.ap-badge-icon {
  font-size: 22px; flex-shrink: 0;
  filter: drop-shadow(0 0 4px rgba(185,28,28,0.3));
}
.ap-badge-info {}
.ap-badge-name {
  font-size: 14px; font-weight: 700;
  color: var(--txt); line-height: 1.2;
  margin-bottom: 2px;
}
.ap-badge-desc {
  font-size: 11px;
  color: var(--txt3); letter-spacing: 0.04em;
}

/* ── ANIMATIONS ────────────────────────────────── */
.ap-fu {
  opacity: 0;
  transform: translateY(18px);
  animation: ap-fade-up 0.55s forwards ease-out;
}
@keyframes ap-fade-up { to { opacity:1; transform:translateY(0); } }
.ap-d1{animation-delay:0.05s} .ap-d2{animation-delay:0.12s}
.ap-d3{animation-delay:0.2s}  .ap-d4{animation-delay:0.28s}
.ap-d5{animation-delay:0.36s} .ap-d6{animation-delay:0.44s}
.ap-d7{animation-delay:0.52s} .ap-d8{animation-delay:0.6s}
`;

/* ════════════════════════════════════════════════
   HOLOGRAM CANVAS — deep crimson palette
════════════════════════════════════════════════ */
function HologramCanvas() {
  const canvasRef = useRef(null);
  const mouseRef  = useRef({ x: 0, y: 0 });
  const animRef   = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let t = 0;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const parent = canvas.parentElement;
    const onMouse = (e) => {
      const r = parent.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - r.left  - parent.offsetWidth  / 2) / parent.offsetWidth,
        y: (e.clientY - r.top   - parent.offsetHeight / 2) / parent.offsetHeight,
      };
    };
    parent.addEventListener("mousemove", onMouse);

    const proj = (x, y, z, cx, cy, ry, rx) => {
      const x1 = x * Math.cos(ry) - z * Math.sin(ry);
      const z1 = x * Math.sin(ry) + z * Math.cos(ry);
      const y1 = y * Math.cos(rx) - z1 * Math.sin(rx);
      const z2 = y * Math.sin(rx) + z1 * Math.cos(rx);
      const p  = 480 / (480 + z2);
      return [cx + x1 * p, cy + y1 * p, z2];
    };

    const loop = () => {
      t++;
      const w = canvas.width, h = canvas.height;
      const cx = w / 2, cy = h / 2;
      const R  = Math.min(w, h) * 0.36;

      ctx.clearRect(0, 0, w, h);

      // soft radial ambient
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.5);
      g.addColorStop(0, "rgba(185,28,28,0.06)");
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);

      const rotY = t * 0.006 + mouseRef.current.x * 0.45;
      const rotX = mouseRef.current.y * 0.3 + 0.12;

      const LATS = 8, LONS = 12;

      // latitude
      for (let i = 1; i < LATS; i++) {
        const phi = (Math.PI * i) / LATS;
        const ry  = R * Math.cos(phi);
        const r   = R * Math.sin(phi);
        const isMid = i === Math.floor(LATS / 2);
        ctx.beginPath();
        for (let j = 0; j <= 60; j++) {
          const th = (2 * Math.PI * j) / 60;
          const [px, py, pz] = proj(r * Math.cos(th), ry, r * Math.sin(th), cx, cy, rotY, rotX);
          const a = Math.max(0, (pz / R + 1) / 2);
          ctx.strokeStyle = `rgba(185,28,28,${isMid ? 0.2 + a * 0.55 : 0.1 + a * 0.35})`;
          ctx.lineWidth   = isMid ? 1.3 : 0.65;
          ctx.shadowColor = "#b91c1c";
          ctx.shadowBlur  = isMid ? 8 : 3;
          j === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      // longitude
      for (let i = 0; i < LONS; i++) {
        const th = (2 * Math.PI * i) / LONS;
        ctx.beginPath();
        for (let j = 0; j <= 44; j++) {
          const phi = (Math.PI * j) / 44;
          const x = R * Math.sin(phi) * Math.cos(th);
          const y = R * Math.cos(phi);
          const z = R * Math.sin(phi) * Math.sin(th);
          const [px, py, pz] = proj(x, y, z, cx, cy, rotY, rotX);
          const a = Math.max(0, (pz / R + 1) / 2);
          ctx.strokeStyle = `rgba(185,28,28,${0.07 + a * 0.3})`;
          ctx.lineWidth   = 0.6;
          ctx.shadowBlur  = 3;
          j === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      // scan beam
      const sy = cy - R + ((t * 1.2) % (R * 2));
      const sg = ctx.createLinearGradient(cx - R, sy, cx + R, sy);
      sg.addColorStop(0, "transparent");
      sg.addColorStop(0.5, "rgba(185,28,28,0.38)");
      sg.addColorStop(1, "transparent");
      ctx.fillStyle = sg; ctx.shadowBlur = 0;
      ctx.fillRect(cx - R, sy - 1, R * 2, 2);

      animRef.current = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      parent.removeEventListener("mousemove", onMouse);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ display:"block", width:"100%", height:"100%" }} />;
}

/* ════════════════════════════════════════════════
   XP GRAPH CANVAS
════════════════════════════════════════════════ */
function XpGraph({ data }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const pts = data;
      const maxV = Math.max(...pts, 1);
      const pad  = { l: 6, r: 6, t: 10, b: 6 };
      const iw   = w - pad.l - pad.r;
      const ih   = h - pad.t - pad.b;

      const px = (i) => pad.l + (i / (pts.length - 1)) * iw;
      const py = (v) => pad.t + ih - (v / maxV) * ih;

      // fill
      ctx.beginPath();
      ctx.moveTo(px(0), py(pts[0]));
      for (let i = 1; i < pts.length; i++) ctx.lineTo(px(i), py(pts[i]));
      ctx.lineTo(px(pts.length - 1), h);
      ctx.lineTo(px(0), h);
      ctx.closePath();
      const fill = ctx.createLinearGradient(0, 0, 0, h);
      fill.addColorStop(0, "rgba(185,28,28,0.22)");
      fill.addColorStop(1, "rgba(185,28,28,0)");
      ctx.fillStyle = fill; ctx.fill();

      // line
      ctx.beginPath();
      ctx.moveTo(px(0), py(pts[0]));
      for (let i = 1; i < pts.length; i++) ctx.lineTo(px(i), py(pts[i]));
      ctx.strokeStyle = "#b91c1c";
      ctx.lineWidth   = 1.8;
      ctx.shadowColor = "#b91c1c";
      ctx.shadowBlur  = 7;
      ctx.stroke();

      // dots
      ctx.shadowBlur = 6;
      pts.forEach((v, i) => {
        ctx.beginPath();
        ctx.arc(px(i), py(v), 3, 0, Math.PI * 2);
        ctx.fillStyle = "#b91c1c";
        ctx.fill();
      });
    };
    draw();

    return () => window.removeEventListener("resize", resize);
  }, [data]);

  return <canvas ref={canvasRef} style={{ display:"block", width:"100%", height:"100%" }} />;
}

/* ════════════════════════════════════════════════
   TILT CARD  — cursor-reactive micro-tilt
════════════════════════════════════════════════ */
function TiltCard({ children, className = "", style = {} }) {
  const ref = useRef(null);

  const onMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const r  = el.getBoundingClientRect();
    const mx = (e.clientX - r.left  - r.width  / 2) / (r.width  / 2);
    const my = (e.clientY - r.top   - r.height / 2) / (r.height / 2);
    el.style.transform = `perspective(900px) rotateY(${mx * 3}deg) rotateX(${-my * 2.5}deg) translateY(-2px)`;
  }, []);

  const onLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = "";
  }, []);

  return (
    <div
      ref={ref}
      className={`ap-card ${className}`}
      style={{ ...style, transition:"transform 0.28s cubic-bezier(0.23,1,0.32,1), box-shadow 0.28s ease, border-color 0.28s ease" }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </div>
  );
}

/* ════════════════════════════════════════════════
   SECTION HEADER
════════════════════════════════════════════════ */
function SH({ tag, idx }) {
  return (
    <div className="ap-sh">
      <span className="ap-sh-tag">{tag}</span>
      <span className="ap-sh-line" />
      <span className="ap-sh-idx">{idx}</span>
    </div>
  );
}

/* ════════════════════════════════════════════════
   HELPERS
════════════════════════════════════════════════ */
function calcBMI(weight, height) {
  if (!weight || !height) return null;
  const bmi = weight / ((height / 100) ** 2);
  return bmi.toFixed(1);
}

function calcCalories(weight, height, age, goal) {
  if (!weight || !height || !age) return null;
  // Mifflin-St Jeor (neutral gender)
  const bmr = 10 * weight + 6.25 * height - 5 * age;
  const tdee = Math.round(bmr * 1.45); // moderate activity
  if (!goal) return tdee;
  const g = goal.toLowerCase();
  if (g.includes("loss") || g.includes("cut")) return tdee - 400;
  if (g.includes("muscle") || g.includes("gain") || g.includes("bulk")) return tdee + 300;
  return tdee;
}

function goalType(goal) {
  if (!goal) return "Maintenance";
  const g = goal.toLowerCase();
  if (g.includes("loss") || g.includes("cut") || g.includes("lean")) return "Fat Loss";
  if (g.includes("muscle") || g.includes("gain") || g.includes("bulk")) return "Muscle Gain";
  return "Maintenance";
}

// Generate plausible 7-day XP mock from total XP (deterministic from seed)
function mockXpHistory(totalXp) {
  const seed = totalXp || 200;
  return Array.from({ length: 7 }, (_, i) => {
    const base = Math.max(10, Math.round((seed / 7) * (0.5 + ((seed * (i + 3)) % 13) / 13)));
    return base;
  });
}

const DAYS = ["MON","TUE","WED","THU","FRI","SAT","SUN"];

/* ════════════════════════════════════════════════
   MAIN PROFILE
════════════════════════════════════════════════ */
const Profile = () => {
  const { user }  = useAuth();
  const navigate  = useNavigate();

  const [rankFill,     setRankFill]     = useState(0);
  const [goalFill,     setGoalFill]     = useState(0);
  const [bgOffset,     setBgOffset]     = useState({ x: 0, y: 0 });
  const [steps, setSteps] = useState(() => {
    return Number(localStorage.getItem("steps")) || 0;
  });
  useEffect(() => {
    const fetchSteps = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("https://aura-backend-nxps.onrender.com/api/fitness", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();

        // FIX: handle multiple possible response formats
        const stepsValue = data?.steps || data?.data?.steps || 0;

        if (stepsValue) {
          setSteps(stepsValue);
          localStorage.setItem("steps", stepsValue);
        }
      } catch (err) {
        console.error("Failed to load steps:", err);
      }
    };

    fetchSteps();

    // FIX: auto refresh every 10 seconds
    const interval = setInterval(fetchSteps, 10000);

    return () => clearInterval(interval);
  }, []);
  const bgRef = useRef(null);
  const connectFit = useGoogleLogin({
    scope: "https://www.googleapis.com/auth/fitness.activity.read",
    onSuccess: async (tokenResponse) => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("https://aura-backend-nxps.onrender.com/api/fitness", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            access_token: tokenResponse.access_token,
          }),
        });

        const data = await res.json();
        const stepsValue = data?.steps || data?.data?.steps || 0;

        setSteps(stepsValue);
        localStorage.setItem("steps", stepsValue);
      } catch (err) {
        console.error("Fit fetch error:", err);
      }
    },
    onError: () => console.log("Login Failed"),
  });

  /* ── derive data ── */
  const rankName = user?.rank
    ? typeof user.rank === "object" ? (user.rank.name ?? "RECRUIT") : user.rank
    : "RECRUIT";
  const rankMin  = user?.rank?.min  ?? 0;
  const rankMax  = user?.rank?.max  ?? 1000;
  const points   = user?.points ?? user?.xp ?? 0;

  const rawRank  = rankMax > rankMin ? (points - rankMin) / (rankMax - rankMin) : 0;
  const rankPct  = Math.min(1, Math.max(0, rawRank));
  const xpToNext = Math.max(0, rankMax - points);

  const ob     = user?.onboarding ?? {};
  const weight = parseFloat(ob.weight)        || null;
  const target = parseFloat(ob.target_weight) || null;
  const height = parseFloat(ob.height)        || null;
  const age    = parseFloat(ob.age)           || null;
  const goal   = ob.goal ?? null;
  const exp    = ob.experience ?? null;

  /* goal weight progress */
  let goalPct = 0;
  if (weight && target && weight !== target) {
    // assume starting from 10% above target (we only know current + target)
    const assumed_start = target + Math.abs(weight - target) * 1.5;
    const total_journey  = Math.abs(assumed_start - target);
    const done           = Math.abs(assumed_start - weight);
    goalPct = Math.min(1, Math.max(0, done / total_journey));
  }

  const bmi      = calcBMI(weight, height);
  const calories = calcCalories(weight, height, age, goal);
  const gType    = goalType(goal);

  const initial  = (user?.name || user?.username || "A")[0].toUpperCase();
  const xpData   = mockXpHistory(points);

  /* tasksToLevel rough calc */
  const tasksToLvl = Math.max(1, Math.ceil(xpToNext / Math.max(1, (user?.weeklyXP || 50) / Math.max(1, user?.weeklyTasks || 5))));

  /* achievements */
  const streak     = user?.streak ?? 0;
  const weeklyXP   = user?.weeklyXP ?? 0;
  const consistency= user?.consistency ?? 0;
  const achievements = [
    streak >= 3  ? { icon:"🔥", name:`${streak} Day Streak`, desc:"Consecutive active days" } : null,
    points >= 100? { icon:"⚡", name:"First 100 XP",          desc:"XP milestone unlocked"  } : null,
    consistency >= 60 ? { icon:"💪", name:"Consistency Starter", desc:`${consistency}% weekly rate` } : null,
    weeklyXP >= 200   ? { icon:"🏆", name:"Weekly Warrior",       desc:"200+ XP this week"         } : null,
    points >= 500     ? { icon:"🎯", name:"Goal Seeker",           desc:"500 total XP reached"      } : null,
  ].filter(Boolean);

  /* animations */
  useEffect(() => {
    const t1 = setTimeout(() => setRankFill(rankPct * 100), 600);
    const t2 = setTimeout(() => setGoalFill(goalPct * 100), 800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [rankPct, goalPct]);

  /* parallax */
  useEffect(() => {
    const onMove = (e) => {
      setBgOffset({
        x: (e.clientX / window.innerWidth  - 0.5) * 14,
        y: (e.clientY / window.innerHeight - 0.5) * 14,
      });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("auraUser");
    navigate("/");
  };

  return (
    <div className="ap">
      <style>{CSS}</style>

      {/* parallax grid bg */}
      <div
        className="ap-grid-bg"
        ref={bgRef}
        style={{ transform: `translate(${bgOffset.x}px, ${bgOffset.y}px)` }}
      />

      <div className="ap-inner">

        {/* ══ NAV ══════════════════════════════════════ */}
        <nav className="ap-nav ap-fu">
          <div className="ap-logo">
            <em>A</em>URA
          </div>
          <div className="ap-nav-right">
            <button className="ap-btn" onClick={() => navigate("/dailygoals")}>Goals</button>
            <button className="ap-btn" onClick={() => connectFit()}>
              Connect Watch
            </button>
            <button className="ap-btn red" onClick={handleLogout}>Logout</button>
          </div>
        </nav>

        {/* ══ HERO ROW ═════════════════════════════════ */}
        <div className="ap-hero ap-fu ap-d1">

          {/* Identity Card */}
          <TiltCard className="ap-id ap-fu ap-d2">
            {/* avatar + name */}
            <div className="ap-id-top">
              <div className="ap-avatar">{initial}</div>
              <div>
                <div className="ap-id-name">{user?.name || user?.username || "Operator"}</div>
                <div className="ap-id-email">{user?.email || "—"}</div>
                <div className="ap-rank-badge">
                  <span className="ap-rank-dot" />
                  {rankName}
                </div>
              </div>
            </div>

            {/* stat trio */}
            <div className="ap-id-stats">
              <div className="ap-stat">
                <span className="ap-stat-val">{points}</span>
                <span className="ap-stat-lbl">Total XP</span>
              </div>
              <div className="ap-stat">
                <span className="ap-stat-val">{streak}</span>
                <span className="ap-stat-lbl">Day Streak</span>
              </div>
              <div className="ap-stat">
                <span className="ap-stat-val">{user?.level ?? 1}</span>
                <span className="ap-stat-lbl">Level</span>
              </div>
              <div className="ap-stat">
                <span className="ap-stat-val">{steps}</span>
                <span className="ap-stat-lbl">Steps</span>
              </div>
            </div>

            {/* rank progress */}
            <div className="ap-rp">
              <div className="ap-rp-hdr">
                <span>Rank Progression</span>
                <span>{Math.round(rankPct * 100)}%</span>
              </div>
              <div className="ap-track">
                <div className="ap-fill" style={{ width:`${rankFill}%` }} />
              </div>
              <p className="ap-xp-next">{xpToNext} XP to next rank</p>
            </div>
          </TiltCard>

          {/* Hologram + Analytics */}
          <div className="ap-holo-col ap-fu ap-d3">
            <TiltCard className="ap-holo-card">
              <HologramCanvas />
              <div className="ap-holo-tag">// bio-sync active //</div>
            </TiltCard>

            {/* Body Analytics */}
            <TiltCard className="ap-analytics">
              <SH tag="Body Analytics" idx="01" />
              <div className="ap-analytics-grid">
                <div className="ap-an-item">
                  <span className="ap-an-val">{bmi ?? "—"}</span>
                  <span className="ap-an-lbl">BMI</span>
                </div>
                <div className="ap-an-item">
                  <span className="ap-an-val">{calories ? `${calories}` : "—"}</span>
                  <span className="ap-an-lbl">kcal/day</span>
                </div>
                <div className="ap-an-item">
                  <span className="ap-an-tag">{gType}</span>
                  <span className="ap-an-lbl">Mode</span>
                </div>
              </div>
            </TiltCard>
          </div>
        </div>

        {/* ══ NEXT ACTION PANEL ════════════════════════ */}
        <div className="ap-fu ap-d4">
          <TiltCard className="ap-action-card">
            <div className="ap-action-header">
              <div className="ap-action-icon">⚡</div>
              <div className="ap-action-title">
                <span />
                System Recommendations
              </div>
            </div>
            <div className="ap-suggestions">
              <div className="ap-suggestion">
                <span className="ap-suggestion-icon">🎯</span>
                <span className="ap-suggestion-text">
                  Complete <strong>{tasksToLvl} task{tasksToLvl !== 1 ? "s" : ""}</strong> to reach next rank
                </span>
              </div>
              <div className="ap-suggestion">
                <span className="ap-suggestion-icon">⚡</span>
                <span className="ap-suggestion-text">
                  <strong>{xpToNext} XP</strong> needed to unlock <strong>{rankName} → Next Rank</strong>
                </span>
              </div>
              {streak > 0 && (
                <div className="ap-suggestion">
                  <span className="ap-suggestion-icon">🔥</span>
                  <span className="ap-suggestion-text">
                    Maintain your <strong>{streak}-day streak</strong> — log a task today to keep it alive
                  </span>
                </div>
              )}
            </div>
          </TiltCard>
        </div>

        {/* ══ XP GRAPH + GOAL TRACKER ══════════════════ */}
        <div className="ap-secondary ap-fu ap-d4">

          {/* XP Activity Graph */}
          <TiltCard className="ap-graph-card">
            <SH tag="XP Activity" idx="02" />
            <div className="ap-graph-area">
              <XpGraph data={xpData} />
            </div>
            <div className="ap-graph-days">
              {DAYS.map(d => <span key={d}>{d}</span>)}
            </div>
          </TiltCard>

          {/* Goal Weight Tracker */}
          <TiltCard className="ap-goal-card">
            <SH tag="Weight Goal" idx="03" />
            <div className="ap-goal-numbers">
              <div className="ap-goal-num">
                <span className="ap-goal-val start">{weight ?? "—"}<small style={{fontSize:11,marginLeft:2,color:"var(--txt3)"}}>kg</small></span>
                <span className="ap-goal-num-lbl">Current</span>
              </div>
              <span className="ap-goal-arrow">→</span>
              <div className="ap-goal-num">
                <span className="ap-goal-val target">{target ?? "—"}<small style={{fontSize:11,marginLeft:2,color:"var(--txt3)"}}>kg</small></span>
                <span className="ap-goal-num-lbl">Target</span>
              </div>
            </div>
            <div className="ap-goal-track">
              <div className="ap-goal-fill" style={{ width:`${goalFill}%` }} />
            </div>
            <div className="ap-goal-footer">
              <span>
                {weight && target
                  ? `${Math.abs(weight - target).toFixed(1)} kg remaining`
                  : "Set target in onboarding"}
              </span>
              <span>{Math.round(goalFill)}% complete</span>
            </div>
          </TiltCard>
        </div>

        {/* ══ BODY METRICS ══════════════════════════════ */}
        <div className="ap-fu ap-d5">
          <SH tag="Body Metrics" idx="04" />
          <div className="ap-metrics-grid">
            {[
              { label:"Age",           value:age,    unit:"yr"  },
              { label:"Height",        value:height, unit:"cm"  },
              { label:"Weight",        value:weight, unit:"kg"  },
              { label:"Target Weight", value:target, unit:"kg"  },
            ].map(({ label, value, unit }) => (
              <TiltCard key={label} className="ap-metric-card">
                <div className="ap-metric-lbl">{label}</div>
                <div className="ap-metric-val">
                  {value ?? "—"}
                  {value && unit && <span className="ap-metric-unit">{unit}</span>}
                </div>
              </TiltCard>
            ))}
            {[
              { label:"Goal",       value:goal },
              { label:"Experience", value:exp  },
            ].map(({ label, value }) => (
              <TiltCard key={label} className="ap-metric-card">
                <div className="ap-metric-lbl">{label}</div>
                <div className="ap-metric-text">{value ?? "—"}</div>
              </TiltCard>
            ))}
          </div>
        </div>

        {/* ══ WEEKLY STATS ══════════════════════════════ */}
        <div className="ap-fu ap-d6">
          <SH tag="Weekly Stats" idx="05" />
          <div className="ap-weekly-grid">
            {[
              { label:"Weekly XP",   value: weeklyXP },
              { label:"Tasks Done",  value: user?.weeklyTasks ?? 0 },
              { label:"Consistency", value: `${consistency}%` },
            ].map(({ label, value }) => (
              <TiltCard key={label} className="ap-weekly-card">
                <span className="ap-weekly-val">{value}</span>
                <span className="ap-weekly-lbl">{label}</span>
              </TiltCard>
            ))}
          </div>
        </div>

        {/* ══ ACHIEVEMENTS ══════════════════════════════ */}
        {achievements.length > 0 && (
          <div className="ap-fu ap-d7">
            <SH tag="Achievements" idx="06" />
            <div className="ap-achieve-grid">
              {achievements.map((a) => (
                <TiltCard key={a.name} className="ap-badge">
                  <span className="ap-badge-icon">{a.icon}</span>
                  <div className="ap-badge-info">
                    <div className="ap-badge-name">{a.name}</div>
                    <div className="ap-badge-desc">{a.desc}</div>
                  </div>
                </TiltCard>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Profile;