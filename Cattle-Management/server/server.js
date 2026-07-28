import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import animalRoutes from "./routes/animals.js";
import vaccinationRoutes from "./routes/vaccinations.js";
import weightRoutes from "./routes/weights.js";
import metaRoutes from "./routes/meta.js";
import bulkRoutes from "./routes/bulk.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/animals/:animalId/vaccinations", vaccinationRoutes);
app.use("/api/animals/:animalId/weights", weightRoutes);
app.use("/api/animals", animalRoutes);
app.use("/api/meta", metaRoutes);
app.use("/api/bulk", bulkRoutes);

app.use((req, res) => res.status(404).json({ error: "Not found" }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`[server] listening on port ${PORT}`));
});
