import { useEffect, useState } from "react";
import api from "../api/axios.js";
import EarTag from "./EarTag.jsx";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function QuickVaccinationPopover({ animal, onClose, onSaved }) {
  const [knownNames, setKnownNames] = useState([]);
  const [vaccineName, setVaccineName] = useState(animal?.lastVaccination?.vaccineName || "");
  const [isCustom, setIsCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [dateGiven, setDateGiven] = useState(todayStr());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadNames() {
      try {
        const { data } = await api.get("/meta/vaccine-names");
        setKnownNames(data);
      } catch {
        // non-fatal
      }
    }
    loadNames();
  }, []);

  async function handleSave() {
    const finalName = isCustom ? customName.trim() : vaccineName;
    if (!finalName) {
      setError("Pick or type a vaccine name.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const { data } = await api.post(`/animals/${animal.animalId}/vaccinations`, {
        vaccineName: finalName,
        dateGiven,
      });
      onSaved(data);
    } catch (err) {
      setError(err.response?.data?.error || "Could not save vaccination.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-5 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-brass">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M19 8l-8 8-4-4m0 0L3 16m4-4l4 4M15 5l4 4m0 0l2-2m-2 2l-2 2"
                />
              </svg>
            </span>
            <h3 className="font-serif font-semibold text-lg text-forest">Log Vaccination</h3>
          </div>
          <EarTag id={animal.animalId} size="sm" />
        </div>

        <div className="space-y-3">
          <div>
            <label>Vaccine</label>
            {!isCustom ? (
              <select
                value={vaccineName}
                onChange={(e) => {
                  if (e.target.value === "__new__") {
                    setIsCustom(true);
                    setVaccineName("");
                  } else {
                    setVaccineName(e.target.value);
                  }
                }}
                autoFocus
              >
                <option value="">Select vaccine…</option>
                {knownNames.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
                <option value="__new__">+ Add new vaccine name</option>
              </select>
            ) : (
              <input
                type="text"
                autoFocus
                placeholder="e.g. FMD (Foot & Mouth)"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
              />
            )}
          </div>

          <div>
            <label>Date Given</label>
            <input type="date" value={dateGiven} onChange={(e) => setDateGiven(e.target.value)} />
          </div>

          {error && <p className="text-xs text-status-overdue">{error}</p>}
        </div>

        <div className="flex gap-2 mt-5">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-md border border-sand text-sm font-medium text-charcoal/70 hover:bg-sandlight transition-colors"
          >
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
