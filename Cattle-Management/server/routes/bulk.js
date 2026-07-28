import express from "express";
import Vaccination from "../models/Vaccination.js";
import WeightLog from "../models/WeightLog.js";

const router = express.Router();

// GET /api/bulk/weights?month=2026-07 -> every WeightLog entry already
// recorded for that month, across all animals (used to pre-fill the
// bulk weigh-in screen so re-visiting a month shows what's already logged).
router.get("/weights", async (req, res) => {
  try {
    const { month } = req.query;
    if (!month) return res.status(400).json({ error: "month is required" });
    const logs = await WeightLog.find({ month });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/bulk/vaccinations
// body: { vaccineName, dateGiven, animalIds: ["CTL-0001", ...] }
// Logs the same vaccine + date for every checked animal in one shot.
router.post("/vaccinations", async (req, res) => {
  try {
    const { vaccineName, dateGiven, animalIds } = req.body;
    if (!vaccineName || !dateGiven || !Array.isArray(animalIds) || animalIds.length === 0) {
      return res.status(400).json({ error: "vaccineName, dateGiven and at least one animal are required" });
    }

    const docs = animalIds.map((animalId) => ({
      animalId,
      vaccineName: vaccineName.trim(),
      dateGiven: new Date(dateGiven),
      notes: "",
    }));

    const created = await Vaccination.insertMany(docs);
    res.status(201).json({ count: created.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/bulk/weights
// body: { date, entries: [{ animalId, weight }, ...] }
// One month/date is chosen once, then a weight is upserted per animal —
// entries with an empty weight are skipped so the user can leave animals
// they haven't gotten to yet and come back later.
router.post("/weights", async (req, res) => {
  try {
    const { date, entries } = req.body;
    if (!date || !Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ error: "date and at least one weight entry are required" });
    }

    const d = new Date(date);
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

    let count = 0;
    for (const entry of entries) {
      if (entry.weight === undefined || entry.weight === null || entry.weight === "") continue;
      await WeightLog.findOneAndUpdate(
        { animalId: entry.animalId, month },
        { animalId: entry.animalId, month, date: d, weight: Number(entry.weight) },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      count++;
    }

    res.status(201).json({ count, month });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
