import mongoose from "mongoose";

const { Schema } = mongoose;

const VaccinationSchema = new Schema(
  {
    animalId: { type: String, required: true, index: true }, // references Animal.animalId
    vaccineName: { type: String, required: true, trim: true },
    dateGiven: { type: Date, required: true },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

VaccinationSchema.index({ animalId: 1, dateGiven: -1 });

export default mongoose.model("Vaccination", VaccinationSchema);
