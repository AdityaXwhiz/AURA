function calculateRecovery(checkin) {
  let score = 0;
  const reasons = [];

  // ---------- Sleep ----------
  if (checkin.sleepHours >= 8) {
    score += 30;
    reasons.push("Excellent sleep recovery.");
  } else if (checkin.sleepHours >= 7) {
    score += 26;
  } else if (checkin.sleepHours >= 6) {
    score += 22;
    reasons.push("Sleep slightly below optimal.");
  } else if (checkin.sleepHours >= 5) {
    score += 16;
    reasons.push("Low sleep detected.");
  } else if (checkin.sleepHours >= 4) {
    score += 10;
    reasons.push("Poor sleep recovery.");
  } else {
    score += 5;
    reasons.push("Critical sleep deprivation.");
  }

  // ---------- Energy ----------
  const energyMap = {
    5: 25,
    4: 20,
    3: 15,
    2: 8,
    1: 3,
  };

  score += energyMap[checkin.energyLevel];

  if (checkin.energyLevel <= 2)
    reasons.push("Low energy reported.");

  // ---------- Water ----------
  if (checkin.waterIntake >= 3) {
    score += 15;
  } else if (checkin.waterIntake >= 2) {
    score += 12;
  } else if (checkin.waterIntake >= 1) {
    score += 8;
    reasons.push("Hydration below ideal.");
  } else {
    score += 4;
    reasons.push("Poor hydration.");
  }

  // ---------- Stress ----------
  const stressMap = {
    1: 15,
    2: 12,
    3: 8,
    4: 4,
    5: 1,
  };

  score += stressMap[checkin.stressLevel];

  if (checkin.stressLevel >= 4)
    reasons.push("High stress detected.");

  // ---------- Muscle soreness ----------
  const soreCount = checkin.muscleSoreness.length;

  if (soreCount === 0)
    score += 15;
  else if (soreCount === 1)
    score += 12;
  else if (soreCount === 2)
    score += 9;
  else if (soreCount === 3)
    score += 6;
  else
    score += 2;

  if (soreCount >= 2)
    reasons.push("Multiple sore muscle groups.");

  // ---------- Injury ----------
  if (checkin.injury) {
    score -= 15;
    reasons.push("Injury reported.");
  }

  score = Math.max(0, Math.min(score, 100));

  let level = "Critical";

  if (score >= 90)
    level = "Elite";
  else if (score >= 75)
    level = "Good";
  else if (score >= 60)
    level = "Moderate";
  else if (score >= 40)
    level = "Poor";

  return {
    score,
    level,
    reasons,
  };
}

module.exports = {
  calculateRecovery,
};