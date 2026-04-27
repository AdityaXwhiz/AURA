/* ═══════════════════════════════════════════════════════════════════════════
   AURA RANK SYSTEM (Server) — 5 Ranks × 3 Sub-tiers each
   Mirrors the client-side rank utility for consistency.
   ═══════════════════════════════════════════════════════════════════════════ */

const rankTiers = [
  // ── Novice (0 – 999) ──
  { name: "Novice",    tier: "I",   min: 0,     max: 333   },
  { name: "Novice",    tier: "II",  min: 334,   max: 666   },
  { name: "Novice",    tier: "III", min: 667,   max: 999   },

  // ── Adept (1000 – 2999) ──
  { name: "Adept",     tier: "I",   min: 1000,  max: 1666  },
  { name: "Adept",     tier: "II",  min: 1667,  max: 2333  },
  { name: "Adept",     tier: "III", min: 2334,  max: 2999  },

  // ── Ascendant (3000 – 4999) ──
  { name: "Ascendant", tier: "I",   min: 3000,  max: 3666  },
  { name: "Ascendant", tier: "II",  min: 3667,  max: 4333  },
  { name: "Ascendant", tier: "III", min: 4334,  max: 4999  },

  // ── Paragon (5000 – 9999) ──
  { name: "Paragon",   tier: "I",   min: 5000,  max: 6666  },
  { name: "Paragon",   tier: "II",  min: 6667,  max: 8333  },
  { name: "Paragon",   tier: "III", min: 8334,  max: 9999  },

  // ── Aura God (10000+) ──
  { name: "Aura God",  tier: "I",   min: 10000, max: 13333   },
  { name: "Aura God",  tier: "II",  min: 13334, max: 16666   },
  { name: "Aura God",  tier: "III", min: 16667, max: Infinity },
];

/**
 * Returns the full sub-tier object for a given point value.
 */
function getUserRank(points = 0) {
  const value = Number(points) || 0;
  for (let i = rankTiers.length - 1; i >= 0; i--) {
    if (value >= rankTiers[i].min) return rankTiers[i];
  }
  return rankTiers[0];
}

/**
 * Returns the next sub-tier to aim for, or null if at max.
 */
function getNextRank(points = 0) {
  const value = Number(points) || 0;
  const current = getUserRank(value);
  const idx = rankTiers.indexOf(current);
  if (idx < rankTiers.length - 1) {
    const next = rankTiers[idx + 1];
    return { name: `${next.name} ${next.tier}`, threshold: next.min };
  }
  return null;
}

/**
 * Formatted display string, e.g. "Adept II"
 */
function getRankDisplay(points = 0) {
  const rank = getUserRank(points);
  return `${rank.name} ${rank.tier}`;
}

module.exports = {
  getUserRank,
  getNextRank,
  getRankDisplay,
  rankTiers,
};
