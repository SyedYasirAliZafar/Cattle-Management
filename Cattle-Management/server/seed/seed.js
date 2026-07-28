import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";

import Animal from "../models/Animal.js";
import Vaccination from "../models/Vaccination.js";
import WeightLog from "../models/WeightLog.js";
import Counter from "../models/Counter.js";

dotenv.config();

function monthStr(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthsAgo(months) {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  return date;
}

async function seed() {
  await connectDB();

  console.log("🗑 Clearing old data...");

  await Animal.deleteMany({});
  await Vaccination.deleteMany({});
  await WeightLog.deleteMany({});
  await Counter.deleteMany({});

  // ===========================
  // Animals
  // ===========================

  const animals = [
    {
      animalId: "CTL-0001",
      tag: "Sultan",
      photoUrl: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=600&q=80",
      cloudinaryPublicId: "",
      ownerName: "Malik Farms",
      ownerContact: "0300-1234567",
      breed: "Sahiwal",
      rate: 185000,
      palaiCharges: 5000,
      arrivalDate: monthsAgo(5),
      initialWeight: 280,
    },
    {
      animalId: "CTL-0002",
      tag: "Bijli",
      photoUrl: "https://images.unsplash.com/photo-1591160690555-5debfba289f0?w=600&q=80",
      cloudinaryPublicId: "",
      ownerName: "Rana Livestock",
      ownerContact: "0321-9876543",
      breed: "Cholistani",
      rate: 210000,
      palaiCharges: 6500,
      arrivalDate: monthsAgo(4),
      initialWeight: 260,
    },
    {
      animalId: "CTL-0003",
      tag: "",
      photoUrl: "",
      cloudinaryPublicId: "",
      ownerName: "Ahmed Cattle Co.",
      ownerContact: "0333-4455667",
      breed: "Nili-Ravi Buffalo",
      rate: 320000,
      palaiCharges: 8500,
      arrivalDate: monthsAgo(3),
      initialWeight: 400,
    },
    {
      animalId: "CTL-0004",
      tag: "Shera",
      photoUrl: "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=600&q=80",
      cloudinaryPublicId: "",
      ownerName: "Malik Farms",
      ownerContact: "0300-1234567",
      breed: "Sahiwal",
      rate: 175000,
      palaiCharges: 4500,
      arrivalDate: monthsAgo(2),
      initialWeight: 240,
    },
    {
      animalId: "CTL-0005",
      tag: "Kaka",
      photoUrl: "",
      cloudinaryPublicId: "",
      ownerName: "Zahid Dairy",
      ownerContact: "0345-6677889",
      breed: "Red Sindhi",
      rate: null,
      palaiCharges: 3900,
      arrivalDate: monthsAgo(8),
      initialWeight: 255,
    },
    {
      animalId: "CTL-0006",
      tag: "Laloo",
      photoUrl: "https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?w=600&q=80",
      cloudinaryPublicId: "",
      ownerName: "Sabir Traders",
      ownerContact: "0312-5566778",
      breed: "Holstein Friesian",
      rate: 260000,
      palaiCharges: 7200,
      arrivalDate: monthsAgo(6),
      initialWeight: 310,
    },
    {
      animalId: "CTL-0007",
      tag: "Taro",
      photoUrl: "",
      cloudinaryPublicId: "",
      ownerName: "Nawaz Cattle Group",
      ownerContact: "0301-2233445",
      breed: "Ayrshire",
      rate: 240000,
      palaiCharges: 6100,
      arrivalDate: monthsAgo(7),
      initialWeight: 285,
    },
    {
      animalId: "CTL-0008",
      tag: "Moti",
      photoUrl: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&q=80",
      cloudinaryPublicId: "",
      ownerName: "Khan Livestock",
      ownerContact: "0322-9988776",
      breed: "Brahman",
      rate: 290000,
      palaiCharges: 7600,
      arrivalDate: monthsAgo(1),
      initialWeight: 330,
    },
    {
      animalId: "CTL-0009",
      tag: "Pappu",
      photoUrl: "",
      cloudinaryPublicId: "",
      ownerName: "Farooq Farms",
      ownerContact: "0331-4455667",
      breed: "Karan Fries",
      rate: null,
      palaiCharges: 4300,
      arrivalDate: monthsAgo(9),
      initialWeight: 270,
    },
    {
      animalId: "CTL-0010",
      tag: "Daisy",
      photoUrl: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600&q=80",
      cloudinaryPublicId: "",
      ownerName: "Hassan Dairy",
      ownerContact: "0315-1122334",
      breed: "Brown Swiss",
      rate: 305000,
      palaiCharges: 7800,
      arrivalDate: monthsAgo(4),
      initialWeight: 295,
    },
  ];

  await Animal.insertMany(animals);

  await Counter.create({
    key: "animalId",
    seq: animals.length,
  });

  console.log("✅ Animals inserted");

  // ===========================
  // Vaccinations
  // ===========================

  const vaccinations = [
    { animalId: "CTL-0001", vaccineName: "FMD", dateGiven: monthsAgo(8), notes: "Initial vaccination" },
    { animalId: "CTL-0001", vaccineName: "Anthrax", dateGiven: monthsAgo(5), notes: "Booster completed" },
    { animalId: "CTL-0002", vaccineName: "HS", dateGiven: monthsAgo(7), notes: "Routine protocol" },
    { animalId: "CTL-0002", vaccineName: "Anthrax", dateGiven: monthsAgo(4), notes: "Follow-up" },
    { animalId: "CTL-0003", vaccineName: "FMD", dateGiven: monthsAgo(6), notes: "Buffalo protocol" },
    { animalId: "CTL-0003", vaccineName: "Lumpy Skin Disease", dateGiven: monthsAgo(2), notes: "Recent record" },
    { animalId: "CTL-0004", vaccineName: "Anthrax", dateGiven: monthsAgo(2), notes: "Seasonal booster" },
    { animalId: "CTL-0005", vaccineName: "FMD", dateGiven: monthsAgo(9), notes: "Starter vaccine" },
    { animalId: "CTL-0005", vaccineName: "HS", dateGiven: monthsAgo(6), notes: "Supportive vaccine" },
    { animalId: "CTL-0006", vaccineName: "Anthrax", dateGiven: monthsAgo(8), notes: "Quarterly record" },
    { animalId: "CTL-0006", vaccineName: "FMD", dateGiven: monthsAgo(3), notes: "Updated vaccine" },
    { animalId: "CTL-0007", vaccineName: "HS", dateGiven: monthsAgo(7), notes: "Strong health history" },
    { animalId: "CTL-0008", vaccineName: "FMD", dateGiven: monthsAgo(1), notes: "Fresh entry" },
    { animalId: "CTL-0009", vaccineName: "Anthrax", dateGiven: monthsAgo(10), notes: "Initial protection" },
    { animalId: "CTL-0010", vaccineName: "Lumpy Skin Disease", dateGiven: monthsAgo(5), notes: "Recent field vaccination" },
  ];

  for (const vaccine of vaccinations) {
    await Vaccination.create(vaccine);
  }
  console.log("✅ Vaccinations inserted");

  // ===========================
  // Weight Logs
  // ===========================

  const weights = {
    "CTL-0001": [280, 292, 305, 315, 330],
    "CTL-0002": [260, 271, 283, 298, 306],
    "CTL-0003": [400, 412, 421, 435],
    "CTL-0004": [240, 250, 258, 267],
    "CTL-0005": [255, 268, 279, 286],
    "CTL-0006": [310, 318, 326, 334, 341],
    "CTL-0007": [285, 297, 308, 319],
    "CTL-0008": [330, 344, 352, 360],
    "CTL-0009": [270, 282, 295, 301],
    "CTL-0010": [295, 308, 314, 321, 329],
  };

  for (const [animalId, records] of Object.entries(weights)) {
    for (let i = 0; i < records.length; i++) {
      const back = records.length - i - 1;
      const date = monthsAgo(back);

      await WeightLog.create({
        animalId,
        date,
        weight: records[i],
        month: monthStr(date),
      });
    }
  }

  console.log("✅ Weight logs inserted");

  console.log("🎉 Database seeded successfully!");

  await mongoose.disconnect();
}

seed().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});