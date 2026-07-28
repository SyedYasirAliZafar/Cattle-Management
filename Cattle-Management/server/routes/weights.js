import express from "express";
import WeightLog from "../models/WeightLog.js";
import Animal from "../models/Animal.js";

const router = express.Router({ mergeParams: true });

// GET /api/animals/:animalId/weights -> list for animal, chronological (for chart)
router.get("/", async (req, res) => {
  try {
    const { animalId } = req.params;
    const weights = await WeightLog.find({ animalId }).sort({ date: 1 });
    res.json(weights);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/animals/:animalId/weights -> add monthly weight (prevents duplicate month, use PUT-like upsert)
router.post("/", async (req, res) => {
  try {
    const { animalId } = req.params;
    const animal = await Animal.findOne({ animalId });
    if (!animal) return res.status(404).json({ error: "Animal not found" });

    const { date, weight } = req.body;
    if (!date || weight === undefined) {
      return res.status(400).json({ error: "date and weight are required" });
    }

    const d = new Date(date);
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

    const existing = await WeightLog.findOne({ animalId, month });
    if (existing) {
      return res.status(409).json({
        error: `A weight entry for ${month} already exists. Edit it instead of adding a new one.`,
        existing,
      });
    }

    const log = await WeightLog.create({ animalId, date: d, weight: Number(weight), month });
    res.status(201).json(log);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "A weight entry for this month already exists." });
    }
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/animals/:animalId/weights/:id -> edit an existing entry (e.g. correct a mistaken value)
router.put("/:id", async (req, res) => {
  try {
    const { date, weight } = req.body;
    const update = {};
    if (weight !== undefined) update.weight = Number(weight);
    if (date !== undefined) {
      const d = new Date(date);
      update.date = d;
      update.month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    }
    const log = await WeightLog.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!log) return res.status(404).json({ error: "Weight entry not found" });
    res.json(log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/animals/:animalId/weights/:id
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await WeightLog.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Weight entry not found" });
    res.json({ message: "Weight entry deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
