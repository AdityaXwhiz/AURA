function generateConstraints(
    checkin,
    recovery,
    previousWorkout = {}
) {

    const constraints = {
        intensity: "High",
        duration: checkin.availableTime,
        equipment: checkin.equipment,
        avoid: [],
        instructions: [],
    };

    /*
    ------------------------
    RECOVERY RULES
    ------------------------
    */

    if (recovery.score < 40) {

        constraints.intensity = "Very Low";

        constraints.instructions.push(
            "Focus only on mobility and recovery."
        );

    }

    else if (recovery.score < 60) {

        constraints.intensity = "Low";

        constraints.instructions.push(
            "Reduce workout volume."
        );

    }

    else if (recovery.score < 80) {

        constraints.intensity = "Moderate";

    }

    /*
    ------------------------
    SLEEP
    ------------------------
    */

    if (checkin.sleepHours < 5) {

        constraints.instructions.push(
            "Avoid maximum effort exercises."
        );

    }

    /*
    ------------------------
    TIME
    ------------------------
    */

    if (checkin.availableTime <= 20) {

        constraints.duration = 20;

        constraints.instructions.push(
            "Generate a quick workout."
        );

    }

    else if (checkin.availableTime <= 30) {

        constraints.duration = 30;

    }

    /*
    ------------------------
    EQUIPMENT
    ------------------------
    */

    if (checkin.equipment === "bodyweight") {

        constraints.instructions.push(
            "Use only bodyweight exercises."
        );

    }

    if (checkin.equipment === "bands") {

        constraints.instructions.push(
            "Use resistance bands only."
        );

    }

    /*
    ------------------------
    SORE MUSCLES
    ------------------------
    */

    checkin.muscleSoreness.forEach(group => {

        constraints.avoid.push(group);

    });

    /*
    ------------------------
    INJURY
    ------------------------
    */

    if (checkin.injury) {

        constraints.instructions.push(
            `Avoid exercises affecting ${checkin.injuryDescription}`
        );

    }

    /*
    ------------------------
    PREVIOUS WORKOUT
    ------------------------
    */

    if (
        previousWorkout &&
        previousWorkout.primaryMuscleGroup
    ) {

        constraints.avoid.push(
            previousWorkout.primaryMuscleGroup
        );

        constraints.instructions.push(
            `Avoid training ${previousWorkout.primaryMuscleGroup} consecutively.`
        );

    }

    return constraints;

}

module.exports = {
    generateConstraints,
};