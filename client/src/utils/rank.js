/* ═══════════════════════════════════════════════════════════════════════════
   AURA RANK SYSTEM — 5 Ranks × 3 Sub-tiers each
   ═══════════════════════════════════════════════════════════════════════════ */

export const rankTiers = [
  // ── Novice (0 – 999) ──
  { name: "Novice",    tier: "I",   min: 0,     max: 333,   color: "#71717a", glow: "rgba(113,113,122,0.3)", icon: "shield"  },
  { name: "Novice",    tier: "II",  min: 334,   max: 666,   color: "#71717a", glow: "rgba(113,113,122,0.4)", icon: "shield"  },
  { name: "Novice",    tier: "III", min: 667,   max: 999,   color: "#71717a", glow: "rgba(113,113,122,0.5)", icon: "shield"  },

  // ── Adept (1000 – 2999) ──
  { name: "Adept",     tier: "I",   min: 1000,  max: 1666,  color: "#3b82f6", glow: "rgba(59,130,246,0.3)",  icon: "swords"  },
  { name: "Adept",     tier: "II",  min: 1667,  max: 2333,  color: "#3b82f6", glow: "rgba(59,130,246,0.4)",  icon: "swords"  },
  { name: "Adept",     tier: "III", min: 2334,  max: 2999,  color: "#3b82f6", glow: "rgba(59,130,246,0.5)",  icon: "swords"  },

  // ── Ascendant (3000 – 4999) ──
  { name: "Ascendant", tier: "I",   min: 3000,  max: 3666,  color: "#a855f7", glow: "rgba(168,85,247,0.3)",  icon: "zap"     },
  { name: "Ascendant", tier: "II",  min: 3667,  max: 4333,  color: "#a855f7", glow: "rgba(168,85,247,0.4)",  icon: "zap"     },
  { name: "Ascendant", tier: "III", min: 4334,  max: 4999,  color: "#a855f7", glow: "rgba(168,85,247,0.5)",  icon: "zap"     },

  // ── Paragon (5000 – 9999) ──
  { name: "Paragon",   tier: "I",   min: 5000,  max: 6666,  color: "#f97316", glow: "rgba(249,115,22,0.3)",  icon: "crown"   },
  { name: "Paragon",   tier: "II",  min: 6667,  max: 8333,  color: "#f97316", glow: "rgba(249,115,22,0.4)",  icon: "crown"   },
  { name: "Paragon",   tier: "III", min: 8334,  max: 9999,  color: "#f97316", glow: "rgba(249,115,22,0.5)",  icon: "crown"   },

  // ── Aura God (10000+) ──
  { name: "Aura God",  tier: "I",   min: 10000, max: 13333, color: "#ef4444", glow: "rgba(239,68,68,0.3)",   icon: "sparkles"},
  { name: "Aura God",  tier: "II",  min: 13334, max: 16666, color: "#ef4444", glow: "rgba(239,68,68,0.5)",   icon: "sparkles"},
  { name: "Aura God",  tier: "III", min: 16667, max: Infinity, color: "#ef4444", glow: "rgba(239,68,68,0.7)", icon: "sparkles"},
];

/**
 * The 5 high-level rank groups used for the visual progression ladder.
 */
export const rankGroups = [
  { name: "Novice",    threshold: 0,     color: "#71717a", gradient: "linear-gradient(135deg, #3f3f46, #52525b)", icon: "shield"   },
  { name: "Adept",     threshold: 1000,  color: "#3b82f6", gradient: "linear-gradient(135deg, #1e40af, #3b82f6)", icon: "swords"   },
  { name: "Ascendant", threshold: 3000,  color: "#a855f7", gradient: "linear-gradient(135deg, #7e22ce, #a855f7)", icon: "zap"      },
  { name: "Paragon",   threshold: 5000,  color: "#f97316", gradient: "linear-gradient(135deg, #c2410c, #f97316)", icon: "crown"    },
  { name: "Aura God",  threshold: 10000, color: "#ef4444", gradient: "linear-gradient(135deg, #b91c1c, #ef4444)", icon: "sparkles" },
];

/**
 * Returns the full sub-tier object for a given point value.
 * E.g. 1800 → { name: "Adept", tier: "II", ... }
 */
export function getUserRank(points = 0) {
  const value = Number(points) || 0;
  // Walk backwards so the first match with min <= value wins the highest tier
  for (let i = rankTiers.length - 1; i >= 0; i--) {
    if (value >= rankTiers[i].min) return rankTiers[i];
  }
  return rankTiers[0];
}

/**
 * Returns the next sub-tier to aim for, or null if at max.
 */
export function getNextRank(points = 0) {
  const value = Number(points) || 0;
  const current = getUserRank(value);
  const idx = rankTiers.indexOf(current);
  if (idx < rankTiers.length - 1) {
    const next = rankTiers[idx + 1];
    return { name: `${next.name} ${next.tier}`, threshold: next.min };
  }
  return null; // already at max
}

/**
 * Formatted display string, e.g. "Adept II"
 */
export function getRankDisplay(points = 0) {
  const rank = getUserRank(points);
  return `${rank.name} ${rank.tier}`;
}

/**
 * Returns progression % within the current sub-tier.
 */
export function getSubTierProgress(points = 0) {
  const rank = getUserRank(points);
  const range = rank.max === Infinity ? 5000 : rank.max - rank.min + 1;
  const earned = points - rank.min;
  return Math.max(0, Math.min(100, (earned / range) * 100));
}
