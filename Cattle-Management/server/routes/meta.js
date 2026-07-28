import express from "express";
import Vaccination from "../models/Vaccination.js";

const router = express.Router();

// GET /api/meta/vaccine-names -> distinct vaccine names used across all animals, for the quick-add dropdown
router.get("/vaccine-names", async (req, res) => {
  try {
    const names = await Vaccination.distinct("vaccineName");
    res.json(names.sort());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
