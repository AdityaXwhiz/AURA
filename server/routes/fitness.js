const Activity = require("../models/Activity");
const express = require("express");
const axios = require("axios");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/", auth, async (req, res) => {
  const { access_token } = req.body;

  try {
    const response = await axios.post(
      "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate",
      {
        aggregateBy: [
          {
            dataTypeName: "com.google.step_count.delta",
          },
        ],
        bucketByTime: { durationMillis: 3600000 },
        startTimeMillis: (() => {
          const d = new Date();
          d.setHours(0, 0, 0, 0);
          return d.getTime();
        })(),
        endTimeMillis: Date.now(),
      },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    let steps = 0;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const startMillis = startOfDay.getTime();

    response.data.bucket?.forEach((bucket) => {
      bucket.dataset?.forEach((ds) => {
        ds.point?.forEach((p) => {
          const pointTime = parseInt(p.startTimeNanos) / 1000000;

          if (pointTime >= startMillis) {
            if (p.value?.[0]?.intVal) {
              steps += p.value[0].intVal;
            }
          }
        });
      });
    });

    console.log("FILTERED TODAY STEPS:", steps);

    // save/update today's steps activity (avoid duplicates)
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const userId = req.userId;

      if (steps > 0) {
        await Activity.findOneAndUpdate(
          {
            userId: userId,
            type: "steps",
            date: { $gte: today }
          },
          {
            value: steps,
            label: "Daily Steps",
            date: new Date()
          },
          {
            upsert: true,
            new: true
          }
        );
      }
    } catch (e) {
      console.error("Activity save error:", e.message);
    }

    res.json({ steps });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch steps" });
  }
});

// 🔥 GET latest steps (used by frontend Profile page)
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.userId;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activity = await Activity.findOne({
      userId,
      type: "steps",
      date: { $gte: today }
    }).sort({ date: -1 });

    if (!activity) {
      return res.json({ steps: 0 });
    }

    return res.json({ steps: activity.value });
  } catch (err) {
    console.error("GET steps error:", err.message);
    res.status(500).json({ error: "Failed to get steps" });
  }
});

module.exports = router;