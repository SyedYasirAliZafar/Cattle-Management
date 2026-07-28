import { useState } from "react";
import api from "../api/axios.js";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function AddWeightModal({ animalId, existingEntry, onClose, onSaved }) {
  const [date, setDate] = useState(existingEntry ? existingEntry.date.slice(0, 10) : todayStr());
  const [weight, setWeight] = useState(existingEntry ? existingEntry.weight : "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!weight) {
      setError("Enter a weight value.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      let data;
      if (existingEntry) {
        ({ data } = await api.put(`/animals/${animalId}/weights/${existingEntry._id}`, { date, weight }));
      } else {
        ({ data } = await api.post(`/animals/${animalId}/weights`, { date, weight }));
      }
      onSaved(data);
    } catch (err) {
      setError(err.response?.data?.error || "Could not save weight entry.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xs p-5 animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-serif font-semibold text-lg text-forest mb-4">
          {existingEntry ? "Edit Weight Entry" : "Add This Month's Weight"}
        </h3>
        <div className="space-y-3">
          <div>
            <label>Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label>Weight (kg)</label>
            <input type="number" min="0" value={weight} onChange={(e) => setWeight(e.target.value)} autoFocus />
          </div>
          {error && <p className="text-xs text-status-overdue">{error}</p>}
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 py-2 rounded-md border border-sand text-sm font-medium text-charcoal/70 hover:bg-sandlight transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2 rounded-md bg-forest hover:bg-forest-light text-paper text-sm font-semibold transition-colors disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
