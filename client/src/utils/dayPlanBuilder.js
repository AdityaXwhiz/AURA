const toArray = (value) => {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  return [value];
};

const normalizeDay = (value, index) => {
  const clean = typeof value === "string" ? value.trim() : "";
  return clean || `Day ${index + 1}`;
};

export const buildDayWisePlan = (plan) => {
  if (!plan || typeof plan !== "object") return [];

  const dayMap = new Map();
  const sharedObjectives = toArray(plan.tips).filter(Boolean);

  // Build Workout Days
  toArray(plan.weeklyWorkout).forEach((entry, index) => {
    const day = normalizeDay(entry?.day, index);

    const existing = dayMap.get(day) || {
      day,
      workouts: [],
      meals: [],
      objectives: [],
    };

    const exercises = toArray(entry?.exercises).map((exercise) => ({
      name: exercise?.name || "Workout",
      sets: exercise?.sets || "",
      reps: exercise?.reps || "",
      duration: exercise?.duration || "",
    }));

    if (exercises.length) {
      existing.workouts.push(...exercises);
    } else if (entry?.focus) {
      existing.workouts.push({
        name: entry.focus,
        sets: "",
        reps: "",
        duration: "",
      });
    }

    dayMap.set(day, existing);
  });

  // Build Meals
  toArray(plan.diet).forEach((mealDay, index) => {
    const day = normalizeDay(mealDay?.day, index);

    const existing = dayMap.get(day) || {
      day,
      workouts: [],
      meals: [],
      objectives: [],
    };

    existing.meals = [
      {
        label: "Breakfast",
        value: mealDay?.breakfast,
      },
      {
        label: "Lunch",
        value: mealDay?.lunch,
      },
      {
        label: "Dinner",
        value: mealDay?.dinner,
      },
      {
        label: "Snacks",
        value: mealDay?.snacks,
      },
    ].filter((meal) => Boolean(meal.value));

    dayMap.set(day, existing);
  });

  const days = Array.from(dayMap.values());

  if (!days.length) {
    return [
      {
        day: "Day 1",
        workouts: [],
        meals: [],
        objectives: sharedObjectives,
      },
    ];
  }

  return days.map((dayPlan) => ({
    ...dayPlan,
    objectives:
      sharedObjectives.length > 0
        ? sharedObjectives
        : dayPlan.objectives,
  }));
};