import express from "express";
import Animal from "../models/Animal.js";
import Vaccination from "../models/Vaccination.js";
import WeightLog from "../models/WeightLog.js";
import { nextAnimalId } from "../models/Counter.js";
import upload from "../middleware/upload.js";
import { uploadBufferToCloudinary, deleteFromCloudinary } from "../config/cloudinary.js";
import { generateAnimalPdf } from "../utils/pdfReport.js";

const router = express.Router();

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function withAnimalDetails(animals) {
  const ids = animals.map((a) => a.animalId);
  const [vaccs, weightLogs] = await Promise.all([
    Vaccination.find({ animalId: { $in: ids } }).sort({ dateGiven: -1 }),
    WeightLog.find({ animalId: { $in: ids } }).sort({ date: -1 }),
  ]);

  const latestByAnimal = {};
  for (const v of vaccs) {
    if (!latestByAnimal[v.animalId]) latestByAnimal[v.animalId] = v;
  }

  const latestWeightByAnimal = {};
  for (const w of weightLogs) {
    if (!latestWeightByAnimal[w.animalId]) latestWeightByAnimal[w.animalId] = w;
  }

  return animals.map((a) => {
    const obj = a.toObject();
    const latest = latestByAnimal[a.animalId];
    const latestWeight = latestWeightByAnimal[a.animalId];
    obj.lastVaccination = latest
      ? {
          vaccineName: latest.vaccineName,
          dateGiven: latest.dateGiven,
        }
      : null;
    obj.latestWeight = latestWeight ? latestWeight.weight : null;
    return obj;
  });
}

// GET /api/animals  -> list all (dashboard), supports ?search=
router.get("/", async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query = {
        $or: [
          { animalId: { $regex: search, $options: "i" } },
          { ownerName: { $regex: search, $options: "i" } },
          { ownerContact: { $regex: search, $options: "i" } },
          { tag: { $regex: search, $options: "i" } },
        ],
      };
    }
    const animals = await Animal.find(query).sort({ createdAt: -1 });
    const enriched = await withAnimalDetails(animals);
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/animals/contact/:contact -> partial contact search
router.get("/contact/:contact", async (req, res) => {
  try {
    const contact = req.params.contact?.trim();
    if (!contact) return res.status(400).json({ error: "contact is required" });

    const animals = await Animal.find({
      ownerContact: { $regex: escapeRegex(contact), $options: "i" },
    }).sort({ ownerContact: 1, animalId: 1 });

    const enriched = await withAnimalDetails(animals);
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/animals/stats -> quick dashboard stats
router.get("/stats", async (req, res) => {
  try {
    const total = await Animal.countDocuments();
    const totalVaccinations = await Vaccination.countDocuments();
    const weights = await WeightLog.find();
    const avgWeight = weights.length
      ? Math.round(weights.reduce((sum, w) => sum + w.weight, 0) / weights.length)
      : 0;
    const animals = await Animal.find();
    const totalValue = animals.reduce((sum, a) => sum + (a.rate || 0), 0);
    res.json({ total, totalVaccinations, avgWeight, totalValue });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/animals/:animalId -> get one
router.get("/:animalId", async (req, res) => {
  try {
    const animal = await Animal.findOne({ animalId: req.params.animalId });
    if (!animal) return res.status(404).json({ error: "Animal not found" });
    res.json(animal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/animals -> create, optional photo upload (field name "photo")
router.post("/", upload.single("photo"), async (req, res) => {
  try {
    const { tag, ownerName, ownerContact, breed, rate, palaiCharges, arrivalDate, initialWeight } = req.body;

    if (!ownerName || !ownerContact || !arrivalDate) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const animalId = await nextAnimalId();
    const normalizedRate = rate === undefined || rate === "" || rate === null ? null : Number(rate);

    let photoUrl = "";
    let cloudinaryPublicId = "";
    if (req.file) {
      const result = await uploadBufferToCloudinary(req.file.buffer);
      photoUrl = result.secure_url;
      cloudinaryPublicId = result.public_id;
    }

    const animal = await Animal.create({
      animalId,
      tag: tag || "",
      photoUrl,
      cloudinaryPublicId,
      ownerName,
      ownerContact,
      breed: breed || "",
      rate: normalizedRate,
      palaiCharges: palaiCharges ? Number(palaiCharges) : 0,
      arrivalDate: new Date(arrivalDate),
      initialWeight: initialWeight ? Number(initialWeight) : null,
    });

    if (initialWeight) {
      const d = new Date(arrivalDate);
      const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      await WeightLog.create({
        animalId,
        date: d,
        weight: Number(initialWeight),
        month,
      });
    }

    res.status(201).json(animal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/animals/:animalId -> edit, optional new photo (field name "photo"), optional removePhoto flag
router.put("/:animalId", upload.single("photo"), async (req, res) => {
  try {
    const animal = await Animal.findOne({ animalId: req.params.animalId });
    if (!animal) return res.status(404).json({ error: "Animal not found" });

    const { tag, ownerName, ownerContact, breed, rate, palaiCharges, arrivalDate, initialWeight, removePhoto } = req.body;

    if (req.file) {
      if (animal.cloudinaryPublicId) await deleteFromCloudinary(animal.cloudinaryPublicId);
      const result = await uploadBufferToCloudinary(req.file.buffer);
      animal.photoUrl = result.secure_url;
      animal.cloudinaryPublicId = result.public_id;
    } else if (removePhoto === "true") {
      if (animal.cloudinaryPublicId) await deleteFromCloudinary(animal.cloudinaryPublicId);
      animal.photoUrl = "";
      animal.cloudinaryPublicId = "";
    }

    if (tag !== undefined) animal.tag = tag;
    if (ownerName !== undefined) animal.ownerName = ownerName;
    if (ownerContact !== undefined) animal.ownerContact = ownerContact;
    if (breed !== undefined) animal.breed = breed;
    if (rate !== undefined) animal.rate = rate === "" || rate === null ? null : Number(rate);
    if (palaiCharges !== undefined) animal.palaiCharges = Number(palaiCharges);
    if (arrivalDate !== undefined) animal.arrivalDate = new Date(arrivalDate);
    if (initialWeight !== undefined) animal.initialWeight = initialWeight ? Number(initialWeight) : null;

    await animal.save();
    res.json(animal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/animals/:animalId
router.delete("/:animalId", async (req, res) => {
  try {
    const animal = await Animal.findOne({ animalId: req.params.animalId });
    if (!animal) return res.status(404).json({ error: "Animal not found" });

    if (animal.cloudinaryPublicId) await deleteFromCloudinary(animal.cloudinaryPublicId);
    await Vaccination.deleteMany({ animalId: animal.animalId });
    await WeightLog.deleteMany({ animalId: animal.animalId });
    await animal.deleteOne();

    res.json({ message: "Animal deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/animals/:animalId/pdf -> generate & return PDF report
router.get("/:animalId/pdf", async (req, res) => {
  try {
    const animal = await Animal.findOne({ animalId: req.params.animalId });
    if (!animal) return res.status(404).json({ error: "Animal not found" });

    const vaccinations = await Vaccination.find({ animalId: animal.animalId }).sort({ dateGiven: -1 });
    const weights = await WeightLog.find({ animalId: animal.animalId }).sort({ date: 1 });

    const pdfBuffer = await generateAnimalPdf(animal, vaccinations, weights);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Noori-Cattle-Farm-${animal.animalId}-report.pdf"`,
    });
    res.send(pdfBuffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
