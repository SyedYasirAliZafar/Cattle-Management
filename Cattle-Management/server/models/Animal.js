import mongoose from "mongoose";

const { Schema } = mongoose;

const AnimalSchema = new Schema(
  {
    animalId: { type: String, required: true, unique: true, index: true }, // CTL-0001
    tag: { type: String, default: "" }, // nickname / tag number, optional
    photoUrl: { type: String, default: "" },
    cloudinaryPublicId: { type: String, default: "" },
    ownerName: { type: String, required: true, trim: true },
    ownerContact: { type: String, required: true, trim: true, index: true },
    breed: { type: String, default: "", trim: true }, // optional
    rate: { type: Number, default: null, min: 0 },
    palaiCharges: { type: Number, default: 0, min: 0 }, // feeding/upkeep charges, editable anytime
    arrivalDate: { type: Date, required: true },
    initialWeight: { type: Number, default: null },
  },
  { timestamps: true }
);

AnimalSchema.index({ ownerName: "text", tag: "text" });

export default mongoose.model("Animal", AnimalSchema);
