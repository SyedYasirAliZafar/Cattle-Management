import express from "express";
import Vaccination from "../models/Vaccination.js";
import Animal from "../models/Animal.js";

const router = express.Router({ mergeParams: true });

// GET /api/animals/:animalId/vaccinations -> list for animal (most recent first)
router.get("/", async (req, res) => {
  try {
    const { animalId } = req.params;
    const vaccinations = await Vaccination.find({ animalId }).sort({ dateGiven: -1 });
    res.json(vaccinations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/animals/:animalId/vaccinations/last/:vaccineName -> latest entry for a vaccine name
router.get("/last/:vaccineName", async (req, res) => {
  try {
    const { animalId, vaccineName } = req.params;
    const last = await Vaccination.findOne({ animalId, vaccineName }).sort({ dateGiven: -1 });
    res.json(last || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/animals/:animalId/vaccinations -> add vaccination
router.post("/", async (req, res) => {
  try {
    const { animalId } = req.params;
    const animal = await Animal.findOne({ animalId });
    if (!animal) return res.status(404).json({ error: "Animal not found" });

    const { vaccineName, dateGiven, notes } = req.body;
    if (!vaccineName || !dateGiven) {
      return res.status(400).json({ error: "vaccineName and dateGiven are required" });
    }

    const vaccination = await Vaccination.create({
      animalId,
      vaccineName: vaccineName.trim(),
      dateGiven: new Date(dateGiven),
      notes: notes || "",
    });

    res.status(201).json(vaccination);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/animals/:animalId/vaccinations/:id -> edit a vaccination record
router.put("/:id", async (req, res) => {
  try {
    const { vaccineName, dateGiven, notes } = req.body;
    const update = {};
    if (vaccineName !== undefined) update.vaccineName = vaccineName;
    if (dateGiven !== undefined) update.dateGiven = new Date(dateGiven);
    if (notes !== undefined) update.notes = notes;

    const vaccination = await Vaccination.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!vaccination) return res.status(404).json({ error: "Vaccination record not found" });
    res.json(vaccination);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/animals/:animalId/vaccinations/:id
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Vaccination.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Vaccination record not found" });
    res.json({ message: "Vaccination deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
