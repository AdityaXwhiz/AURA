const validateDailyCheckin = (req, res, next) => {

    const {
        sleepHours,
        energyLevel,
        mood,
        availableTime,
        equipment,
        waterIntake,
        muscleSoreness,
        injury,
        injuryDescription,
        stressLevel,
        notes,
    } = req.body;

    if (
        sleepHours === undefined ||
        sleepHours < 0 ||
        sleepHours > 12
    ) {
        return res.status(400).json({
            success: false,
            message: "Sleep hours must be between 0 and 12.",
        });
    }

    if (
        energyLevel < 1 ||
        energyLevel > 5
    ) {
        return res.status(400).json({
            success: false,
            message: "Energy level must be between 1 and 5.",
        });
    }

    const moods = [
        "excellent",
        "good",
        "neutral",
        "low",
        "exhausted",
    ];

    if (!moods.includes(mood)) {
        return res.status(400).json({
            success: false,
            message: "Invalid mood.",
        });
    }

    const equipments = [
        "gym",
        "home",
        "bands",
        "bodyweight",
    ];

    if (!equipments.includes(equipment)) {
        return res.status(400).json({
            success: false,
            message: "Invalid equipment.",
        });
    }

    if (
        availableTime < 10 ||
        availableTime > 180
    ) {
        return res.status(400).json({
            success: false,
            message: "Available time must be between 10 and 180 minutes.",
        });
    }

    if (
        waterIntake < 0 ||
        waterIntake > 8
    ) {
        return res.status(400).json({
            success: false,
            message: "Water intake must be between 0 and 8 litres.",
        });
    }

    if (
        stressLevel < 1 ||
        stressLevel > 5
    ) {
        return res.status(400).json({
            success: false,
            message: "Stress level must be between 1 and 5.",
        });
    }

    if (
        muscleSoreness &&
        !Array.isArray(muscleSoreness)
    ) {
        return res.status(400).json({
            success: false,
            message: "Muscle soreness must be an array.",
        });
    }

    if (
        injury &&
        !injuryDescription?.trim()
    ) {
        return res.status(400).json({
            success: false,
            message:
                "Please describe your injury.",
        });
    }

    if (
        notes &&
        notes.length > 500
    ) {
        return res.status(400).json({
            success: false,
            message:
                "Notes cannot exceed 500 characters.",
        });
    }

    next();

};

module.exports = validateDailyCheckin;