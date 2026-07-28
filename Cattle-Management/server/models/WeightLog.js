import mongoose from "mongoose";

const { Schema } = mongoose;

const WeightLogSchema = new Schema(
  {
    animalId: { type: String, required: true, index: true }, // references Animal.animalId
    date: { type: Date, required: true },
    weight: { type: Number, required: true, min: 0 },
    month: { type: String, required: true }, // "2026-07"
  },
  { timestamps: true }
);

WeightLogSchema.index({ animalId: 1, month: 1 }, { unique: true });

export default mongoose.model("WeightLog", WeightLogSchema);
