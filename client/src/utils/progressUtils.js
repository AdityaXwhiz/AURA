

const PROGRESS_KEY = "auraDailyGoalsProgress";
const STREAK_KEY = "auraDailyStreak";

export const readProgress = () => {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const getStreak = () => {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) {
      return {
        count: 0,
        lastDate: null,
      };
    }

    return JSON.parse(raw);
  } catch {
    return {
      count: 0,
      lastDate: null,
    };
  }
};

export const updateStreak = () => {
  const today = new Date().toDateString();
  const streak = getStreak();

  if (streak.lastDate === today) {
    return streak.count;
  }

  const yesterday = new Date(Date.now() - 86400000).toDateString();

  const newCount =
    streak.lastDate === yesterday
      ? streak.count + 1
      : 1;

  const updated = {
    count: newCount,
    lastDate: today,
  };

  localStorage.setItem(
    STREAK_KEY,
    JSON.stringify(updated)
  );

  return newCount;
};

export { PROGRESS_KEY, STREAK_KEY };