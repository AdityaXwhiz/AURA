import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  Crown,
  Flame,
  Lock,
  Shield,
  Sparkles,
  Swords,
  Target,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";
import {
  getUserRank,
  getNextRank,
  getRankDisplay,
  getSubTierProgress,
  rankGroups,
  rankTiers,
} from "../utils/rank";

/* ═══════════════════════════════════════════════════════════════════════════
   ICON MAP
   ═══════════════════════════════════════════════════════════════════════════ */
const ICON_MAP = { shield: Shield, swords: Swords, zap: Zap, crown: Crown, sparkles: Sparkles };
const getIcon = (key) => ICON_MAP[key] || Shield;

/* ═══════════════════════════════════════════════════════════════════════════
   ANIMATED COUNTER — smooth XP number tick-up
   ═══════════════════════════════════════════════════════════════════════════ */
const AnimatedNumber = ({ value }) => {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    const from = prev.current, to = value;
    if (from === to) return;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / 700, 1);
      setDisplay(Math.round(from + (to - from) * (1 - Math.pow(1 - t, 3))));
      if (t < 1) requestAnimationFrame(step); else prev.current = to;
    };
    requestAnimationFrame(step);
  }, [value]);
  return <>{display.toLocaleString()}</>;
};

/* ═══════════════════════════════════════════════════════════════════════════
   SVG CIRCULAR PROGRESS — with red neon glow
   ═══════════════════════════════════════════════════════════════════════════ */
const GlowRing = ({ progress, size = 160, stroke = 10 }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(127,29,29,0.15)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="url(#redGlow)" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (progress / 100) * c }}
          transition={{ duration: 1.4, ease: "circOut" }}
          className="drop-shadow-[0_0_12px_rgba(220,38,38,0.6)]"
        />
        <defs>
          <linearGradient id="redGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7f1d1d" />
            <stop offset="50%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black italic text-white" style={{ fontFamily: "'Oswald', sans-serif" }}>
          {Math.round(progress)}%
        </span>
        <span className="text-[8px] text-zinc-600 font-mono uppercase tracking-[0.3em] mt-1">
          Tier_Progress
        </span>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   RANK PYRAMID CARD — single tier row
   ═══════════════════════════════════════════════════════════════════════════ */
const PyramidTier = ({ group, isCurrent, isUnlocked, index, total }) => {
  const Icon = getIcon(group.icon);
  // Pyramid widths: narrower at top (Aura God), widest at bottom (Novice)
  const widthPct = 50 + ((total - 1 - index) / (total - 1)) * 50;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: isCurrent ? 1.03 : 1 }}
      transition={{ duration: 0.5, delay: (total - index) * 0.08 }}
      whileHover={isUnlocked ? { scale: isCurrent ? 1.05 : 1.02, y: -4 } : {}}
      className="mx-auto relative group"
      style={{ width: `${widthPct}%`, maxWidth: "700px" }}
    >
      <div
        className={`
          relative overflow-hidden p-5 md:p-6 border transition-all duration-500 cursor-default
          ${isCurrent
            ? "bg-zinc-950/90 border-red-600 shadow-[0_0_50px_rgba(220,38,38,0.25)] backdrop-blur-xl"
            : isUnlocked
            ? "bg-zinc-950/60 border-red-900/20 hover:border-red-600/40 backdrop-blur-md"
            : "bg-zinc-950/40 border-zinc-800/30 opacity-80"
          }
        `}
      >
        {/* Current rank neon border pulse */}
        {isCurrent && (
          <motion.div
            className="absolute inset-0 border-2 border-red-600 pointer-events-none"
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
          />
        )}

        {/* Background radial glow for current */}
        {isCurrent && (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.08)_0%,transparent_70%)] pointer-events-none" />
        )}

        <div className="relative z-10 flex items-center justify-between gap-4">
          {/* Left: Icon + Name */}
          <div className="flex items-center gap-4">
            <div className={`
              w-12 h-12 flex items-center justify-center rounded-sm rotate-45
              ${isCurrent
                ? "bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.5)]"
                : isUnlocked
                ? "bg-zinc-900 border border-red-900/30"
                : "bg-zinc-900/50 border border-zinc-800/30"
              }
            `}>
              <Icon
                size={20}
                className={`-rotate-45 ${isCurrent ? "text-black" : isUnlocked ? "text-red-600" : "text-zinc-500"}`}
              />
            </div>

            <div>
              <h4
                className={`text-xl md:text-2xl font-black italic uppercase tracking-tighter ${
                  isCurrent ? "text-white" : isUnlocked ? "text-zinc-300" : "text-zinc-400"
                }`}
                style={{ fontFamily: "'Oswald', sans-serif" }}
              >
                {group.name}
              </h4>
              <p className="text-[9px] text-zinc-600 font-mono uppercase tracking-[0.3em] mt-0.5">
                {group.threshold.toLocaleString()} XP Required
              </p>
            </div>
          </div>

          {/* Right: Status */}
          <div className="flex items-center gap-3">
            {isCurrent && (
              <motion.span
                className="text-[9px] font-mono uppercase tracking-[0.4em] text-red-600 font-bold"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                Active_Rank
              </motion.span>
            )}
            {!isCurrent && isUnlocked && (
              <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-zinc-600">Unlocked</span>
            )}
            {!isUnlocked && (
              <Lock size={14} className="text-zinc-500" />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   SUB-TIER ROW — compact row in the tier breakdown
   ═══════════════════════════════════════════════════════════════════════════ */
const SubTierRow = ({ tier, isCurrent, isUnlocked, index }) => {
  const Icon = getIcon(tier.icon);
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className={`
        flex items-center gap-4 p-4 border transition-all duration-300
        ${isCurrent
          ? "bg-zinc-950/90 border-red-600/50 shadow-[0_0_25px_rgba(220,38,38,0.15)]"
          : isUnlocked
          ? "bg-zinc-950/40 border-zinc-900/30 hover:border-red-900/30"
          : "bg-zinc-950/30 border-zinc-800/20 opacity-70"
        }
      `}
    >
      <div className={`w-8 h-8 flex items-center justify-center rounded-sm ${
        isCurrent ? "bg-red-600" : isUnlocked ? "bg-zinc-900" : "bg-zinc-900/30"
      }`}>
        <Icon size={14} className={isCurrent ? "text-black" : isUnlocked ? "text-red-600/60" : "text-zinc-800"} />
      </div>

      <div className="flex-1">
        <p className={`text-sm font-black italic uppercase tracking-wider ${
          isCurrent ? "text-white" : isUnlocked ? "text-zinc-400" : "text-zinc-400"
        }`} style={{ fontFamily: "'Oswald', sans-serif" }}>
          {tier.name} <span className="text-red-600">{tier.tier}</span>
        </p>
      </div>

      <p className="text-[9px] text-zinc-600 font-mono uppercase tracking-widest">
        {tier.max === Infinity ? `${tier.min.toLocaleString()}+` : `${tier.min.toLocaleString()} – ${tier.max.toLocaleString()}`}
      </p>

      <div className="w-6 flex justify-center">
        {isCurrent ? (
          <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
            <Flame size={14} className="text-red-600" />
          </motion.div>
        ) : isUnlocked ? (
          <span className="text-green-600 text-[10px]">✓</span>
        ) : (
          <Lock size={10} className="text-zinc-800" />
        )}
      </div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════════════ */
const RankPage = () => {
  const navigate = useNavigate();

  const storedUser = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("auraUser")) || null; } catch { return null; }
  }, []);

  const userId = storedUser?._id || storedUser?.id;
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    selectedPlan: storedUser?.selectedPlan || "aesthetic",
    points: storedUser?.points || 0,
  });

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Oswald:wght@700&display=swap";
    link.rel = "stylesheet";
    if (!document.querySelector(`link[href="${link.href}"]`)) document.head.appendChild(link);
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!userId) { setLoading(false); return; }
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:5000/api/user/rank`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok) {
          setProfile({
            selectedPlan: data?.user?.selectedPlan || "aesthetic",
            points: data?.points || 0,
          });
        }
      } catch (_) { /* fallback to local */ }
      finally { setLoading(false); }
    };
    load();
  }, [userId]);

  const currentRank = getUserRank(profile.points);
  const nextRank = getNextRank(profile.points);
  const rankDisplay = getRankDisplay(profile.points);
  const tierProgress = getSubTierProgress(profile.points);


  const activeGroupIdx = rankGroups.findIndex((g, i) => {
    const next = rankGroups[i + 1]?.threshold ?? Infinity;
    return profile.points >= g.threshold && profile.points < next;
  });

  const generateNewPlan = async () => {
    if (!userId) { navigate("/"); return; }
    const plan = profile.selectedPlan || "aesthetic";
    try {
      const token = localStorage.getItem("token");
      await fetch("http://localhost:5000/api/ai/plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          selectedPlan: plan,
          user: {
            name: storedUser?.name || "Athlete",
            weight: storedUser?.onboarding?.weight,
            goal: storedUser?.onboarding?.goal,
            target_weight: storedUser?.onboarding?.target_weight,
          },
        }),
      });
    } catch (_) {}
    navigate("/onboarding");
  };

  /* ═════════════════════════════════════════════════════════════
     RENDER
     ═════════════════════════════════════════════════════════════ */
  return (
    <div className="bg-black text-zinc-400 font-sans selection:bg-red-600 min-h-screen relative overflow-hidden tracking-tight">
      {/* ── Background layers (matching Landing.js) ── */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(220,38,38,0.1)_0%,transparent_50%)] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(127,29,29,0.06)_0%,transparent_40%)] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 md:px-12 pt-28 pb-24 relative z-10">
        {/* ── Back Button ── */}
        <motion.button
          onClick={() => navigate(-1)}
          whileHover={{ x: -4 }}
          className="mb-10 inline-flex items-center gap-2 text-zinc-600 hover:text-red-600 transition-colors text-sm"
        >
          <ChevronLeft size={16} /> Back
        </motion.button>

        {/* ── Header (Oswald + monospace micro text) ── */}
        <div className="mb-14">
          <p className="text-red-600 text-[10px] uppercase tracking-[0.5em] font-mono font-bold">
            AURA Rank_Center
          </p>
          <h1
            className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter mt-3 text-white leading-none"
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            PROGRESS &<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-red-900 drop-shadow-[0_0_30px_rgba(220,38,38,0.3)]">
              RANK.
            </span>
          </h1>
          <p className="text-zinc-600 mt-4 max-w-lg text-sm italic">
            "Every rep, every meal, every objective — they all add up. Track your ascension from Novice to Aura God."
          </p>
        </div>

        {loading ? (
          <div className="bg-zinc-950/80 border border-red-900/20 p-12 text-center backdrop-blur-xl">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} className="inline-block mb-4">
              <Zap size={28} className="text-red-600" />
            </motion.div>
            <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-[0.4em]">Loading rank profile...</p>
          </div>
        ) : (
          <>
            {/* ════════════════════════════════════════════════
                HERO RANK CARD
                ════════════════════════════════════════════════ */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-950/80 border border-red-900/30 backdrop-blur-xl p-8 md:p-10 mb-14 shadow-[0_0_60px_rgba(220,38,38,0.1)] relative overflow-hidden"
            >
              {/* Background glow */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(220,38,38,0.06)_0%,transparent_60%)] pointer-events-none" />

              <div className="relative z-10 grid md:grid-cols-[1fr_auto] gap-8 items-center">
                <div>
                  {/* Plan badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-red-900/20 bg-black/40 mb-5">
                    <Target size={12} className="text-red-600" />
                    <span className="text-[9px] font-mono uppercase tracking-[0.35em] text-zinc-500 font-bold">
                      Plan: {profile.selectedPlan}
                    </span>
                  </div>

                  {/* Rank identity */}
                  <div className="flex items-center gap-5 mb-4">
                    <div className="w-16 h-16 bg-zinc-900 border border-red-600 flex items-center justify-center rounded-sm rotate-45 shadow-[0_0_20px_rgba(220,38,38,0.3)]">
                      {React.createElement(getIcon(currentRank.icon), {
                        size: 28,
                        className: "text-red-600 -rotate-45",
                      })}
                    </div>
                    <div>
                      <p className="text-[9px] text-zinc-600 font-mono uppercase tracking-[0.4em] mb-1">Current_Rank</p>
                      <h2
                        className="text-4xl md:text-5xl font-black italic text-red-600 uppercase tracking-tighter drop-shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                        style={{ fontFamily: "'Oswald', sans-serif" }}
                      >
                        {rankDisplay}
                      </h2>
                    </div>
                  </div>

                  {/* Points */}
                  <div className="flex items-baseline gap-3 mt-4">
                    <span className="text-5xl font-black italic text-white" style={{ fontFamily: "'Oswald', sans-serif" }}>
                      <AnimatedNumber value={profile.points} />
                    </span>
                    <span className="text-[9px] text-zinc-600 font-mono uppercase tracking-[0.3em]">Total_XP</span>
                  </div>

                  {/* XP progress bar */}
                  <div className="mt-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-[0.35em]">Tier_Progress</span>
                      <span className="text-[9px] text-red-600 font-mono font-bold">{Math.round(tierProgress)}%</span>
                    </div>
                    <div className="h-2 bg-zinc-900 border border-zinc-800 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${tierProgress}%` }}
                        transition={{ duration: 1, ease: "circOut" }}
                        className="h-full bg-gradient-to-r from-red-900 via-red-600 to-red-400 shadow-[0_0_10px_red]"
                      />
                    </div>
                    <p className="text-[9px] text-zinc-600 mt-2 font-mono uppercase tracking-widest">
                      {nextRank
                        ? `${(nextRank.threshold - profile.points).toLocaleString()} XP to ${nextRank.name}`
                        : "Maximum rank achieved"}
                    </p>
                  </div>
                </div>

                {/* Circular progress ring */}
                <div className="flex justify-center">
                  <GlowRing progress={tierProgress} size={170} stroke={12} />
                </div>
              </div>
            </motion.section>

            {/* ════════════════════════════════════════════════
                RANK PYRAMID — Vertical stacked progression
                ════════════════════════════════════════════════ */}
            <section className="mb-14">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-red-600/10 border border-red-600/30 rounded-sm">
                  <Trophy size={16} className="text-red-600" />
                </div>
                <div>
                  <h3
                    className="text-2xl font-black italic uppercase tracking-tighter text-white"
                    style={{ fontFamily: "'Oswald', sans-serif" }}
                  >
                    Rank Pyramid
                  </h3>
                  <p className="text-[9px] text-zinc-600 font-mono uppercase tracking-[0.35em] mt-0.5">
                    Ascension_Hierarchy
                  </p>
                </div>
              </div>

              {/* Pyramid: Aura God at top → Novice at bottom */}
              <div className="space-y-3">
                {[...rankGroups].reverse().map((group, revIdx) => {
                  const originalIdx = rankGroups.length - 1 - revIdx;
                  const isCurrent = originalIdx === activeGroupIdx;
                  const isUnlocked = profile.points >= group.threshold;
                  return (
                    <PyramidTier
                      key={group.name}
                      group={group}
                      isCurrent={isCurrent}
                      isUnlocked={isUnlocked}
                      index={revIdx}
                      total={rankGroups.length}
                    />
                  );
                })}
              </div>

              {/* Vertical connection line */}
              <div className="flex justify-center mt-4">
                <div className="h-8 w-[2px] bg-gradient-to-b from-red-600/30 to-transparent" />
              </div>
            </section>

            {/* ════════════════════════════════════════════════
                ALL SUB-TIERS — detailed breakdown
                ════════════════════════════════════════════════ */}
            <section className="mb-14">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-red-600/10 border border-red-600/30 rounded-sm">
                  <TrendingUp size={16} className="text-red-600" />
                </div>
                <div>
                  <h3
                    className="text-2xl font-black italic uppercase tracking-tighter text-white"
                    style={{ fontFamily: "'Oswald', sans-serif" }}
                  >
                    All Tiers
                  </h3>
                  <p className="text-[9px] text-zinc-600 font-mono uppercase tracking-[0.35em] mt-0.5">
                    Sub_Tier_Breakdown // {rankTiers.length} Levels
                  </p>
                </div>
              </div>

              <div className="bg-zinc-950/60 border border-red-900/10 backdrop-blur-md overflow-hidden">
                <div className="p-4 bg-zinc-900/40 border-b border-zinc-800 flex justify-between items-center">
                  <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-zinc-500 font-bold flex items-center gap-2">
                    <Flame size={12} className="text-red-600 animate-pulse" /> Progression_Map
                  </span>
                  <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-zinc-600">
                    {rankTiers.filter(t => profile.points >= t.min).length}/{rankTiers.length} Unlocked
                  </span>
                </div>
                <div className="divide-y divide-zinc-900/30">
                  {rankTiers.map((tier, i) => {
                    const isCurrent = tier.name === currentRank.name && tier.tier === currentRank.tier;
                    const isUnlocked = profile.points >= tier.min;
                    return (
                      <SubTierRow
                        key={`${tier.name}-${tier.tier}`}
                        tier={tier}
                        isCurrent={isCurrent}
                        isUnlocked={isUnlocked}
                        index={i}
                      />
                    );
                  })}
                </div>
              </div>
            </section>

            {/* ════════════════════════════════════════════════
                ACTION BUTTONS
                ════════════════════════════════════════════════ */}
            <section className="grid sm:grid-cols-3 gap-4 mb-10">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/dailygoals/${profile.selectedPlan || "aesthetic"}`)}
                className="p-5 bg-zinc-950/80 border border-zinc-800 hover:border-red-600 transition-all text-left backdrop-blur-md group"
              >
                <Target size={20} className="text-red-600 mb-3 group-hover:animate-pulse" />
                <p className="font-black text-white text-sm uppercase tracking-widest" style={{ fontFamily: "'Oswald', sans-serif" }}>
                  View Plan
                </p>
                <p className="text-[9px] text-zinc-600 font-mono uppercase tracking-widest mt-1">Current_Protocol</p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/dailygoals")}
                className="p-5 bg-zinc-950/80 border border-zinc-800 hover:border-red-600 transition-all text-left backdrop-blur-md group"
              >
                <TrendingUp size={20} className="text-red-600 mb-3 group-hover:animate-pulse" />
                <p className="font-black text-white text-sm uppercase tracking-widest" style={{ fontFamily: "'Oswald', sans-serif" }}>
                  Daily Objectives
                </p>
                <p className="text-[9px] text-zinc-600 font-mono uppercase tracking-widest mt-1">Earn_XP</p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={generateNewPlan}
                className="p-5 bg-red-600 text-black hover:bg-red-700 transition-all text-left shadow-[0_0_25px_rgba(220,38,38,0.3)]"
              >
                <Zap size={20} className="mb-3" />
                <p className="font-black text-sm uppercase tracking-widest" style={{ fontFamily: "'Oswald', sans-serif" }}>
                  Generate New Plan
                </p>
                <p className="text-[9px] uppercase tracking-widest mt-1 opacity-60">AI_Protocol</p>
              </motion.button>
            </section>

            {/* ── Footer nav ── */}
            <motion.button
              whileHover={{ x: -4 }}
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 text-zinc-600 hover:text-red-600 transition-colors text-sm"
            >
              <Sparkles size={14} /> Back_To_Landing
            </motion.button>
          </>
        )}
      </div>
    </div>
  );
};

export default RankPage;
