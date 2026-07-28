import mongoose from "mongoose";

const { Schema } = mongoose;

// Single-document-per-key counter, used to generate sequential CTL-#### ids
// atomically even under concurrent requests.
const CounterSchema = new Schema({
  key: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.model("Counter", CounterSchema);

export async function nextAnimalId() {
  const counter = await Counter.findOneAndUpdate(
    { key: "animalId" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return `CTL-${String(counter.seq).padStart(4, "0")}`;
}

export default Counter;
