import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios.js";
import Header from "../components/Header.jsx";
import EarTag from "../components/EarTag.jsx";
import PlaceholderAvatar from "../components/PlaceholderAvatar.jsx";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function AddAnimal() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    tag: "",
    ownerName: "",
    ownerContact: "",
    breed: "",
    rate: "",
    palaiCharges: "",
    arrivalDate: todayStr(),
  });
  const [addWeightNow, setAddWeightNow] = useState(false);
  const [initialWeight, setInitialWeight] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState(null);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.ownerName || !form.ownerContact || !form.arrivalDate) {
      setError("Please fill in the required fields.");
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (addWeightNow && initialWeight) fd.append("initialWeight", initialWeight);
      if (photoFile) fd.append("photo", photoFile);

      const { data } = await api.post("/animals", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setCreated(data);
    } catch (err) {
      setError(err.response?.data?.error || "Could not create animal record.");
    } finally {
      setSaving(false);
    }
  }

  if (created) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="max-w-lg mx-auto px-6 py-20 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-status-active/10 text-status-active flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-serif text-2xl font-semibold text-forest mb-2">Animal recorded</h1>
          <p className="text-charcoal/60 mb-5">The new entry has been tagged and saved to the ledger.</p>
          <div className="flex justify-center mb-8">
            <EarTag id={created.animalId} size="lg" />
          </div>
          <div className="flex gap-3 justify-center">
            <Link
              to={`/animals/${created.animalId}`}
              className="px-4 py-2 rounded-md bg-forest text-paper text-sm font-semibold hover:bg-forest-light transition-colors"
            >
              View Profile
            </Link>
            <Link
              to="/"
              className="px-4 py-2 rounded-md border border-sand text-sm font-medium text-charcoal/70 hover:bg-sandlight transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <h1 className="font-serif text-3xl font-semibold text-forest mb-1">Add New Animal</h1>
        <p className="text-sm text-charcoal/50 mb-6">A new ear-tag ID will be assigned automatically on save.</p>

        <form onSubmit={handleSubmit} className="bg-white border border-sand rounded-lg shadow-card p-4 sm:p-6 space-y-5">
          {/* Photo — optional */}
          <div>
            <label>Photo (optional)</label>
            <div className="flex items-center gap-4">
              {photoPreview ? (
                <img src={photoPreview} alt="preview" className="w-20 h-20 rounded-md object-cover border border-sand" />
              ) : (
                <PlaceholderAvatar className="w-20 h-20" iconClassName="w-9 h-9" />
              )}
              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="text-sm font-medium px-3 py-1.5 rounded-md border border-sand hover:bg-sandlight transition-colors"
                >
                  {photoPreview ? "Change photo" : "Upload photo"}
                </button>
                <p className="text-xs text-charcoal/40 mt-1.5">
                  Skip this — you can add or change the photo anytime from the profile page.
                </p>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label>Tag / Nickname</label>
              <input type="text" value={form.tag} onChange={(e) => update("tag", e.target.value)} placeholder="e.g. Sultan" />
            </div>
            <div>
              <label>Breed (optional)</label>
              <input type="text" value={form.breed} onChange={(e) => update("breed", e.target.value)} placeholder="e.g. Sahiwal" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label>Owner Name *</label>
              <input type="text" value={form.ownerName} onChange={(e) => update("ownerName", e.target.value)} required />
            </div>
            <div>
              <label>Owner Contact *</label>
              <input type="tel" value={form.ownerContact} onChange={(e) => update("ownerContact", e.target.value)} placeholder="03XX-XXXXXXX" required />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label>Rate (PKR)</label>
              <input type="number" min="0" value={form.rate} onChange={(e) => update("rate", e.target.value)} placeholder="Optional" />
            </div>
            <div>
              <label>Palai Charges (PKR)</label>
              <input type="number" min="0" value={form.palaiCharges} onChange={(e) => update("palaiCharges", e.target.value)} placeholder="0" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label>Arrival Date *</label>
              <input type="date" value={form.arrivalDate} onChange={(e) => update("arrivalDate", e.target.value)} required />
            </div>
          </div>

          <div className="border-t border-sand pt-4">
            <label className="flex items-center gap-2 cursor-pointer !mb-0">
              <input
                type="checkbox"
                checked={addWeightNow}
                onChange={(e) => setAddWeightNow(e.target.checked)}
                className="!w-auto accent-brass"
              />
              <span className="normal-case text-sm text-charcoal font-medium">Add initial weight now</span>
            </label>
            {addWeightNow && (
              <div className="mt-3">
                <label>Initial Weight (kg)</label>
                <input type="number" min="0" value={initialWeight} onChange={(e) => setInitialWeight(e.target.value)} />
              </div>
            )}
          </div>

          {error && <p className="text-sm text-status-overdue">{error}</p>}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-md bg-forest hover:bg-forest-light text-paper text-sm font-semibold transition-colors disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save Animal"}
            </button>
            <Link to="/" className="px-5 py-2.5 rounded-md border border-sand text-sm font-medium text-charcoal/70 hover:bg-sandlight transition-colors">
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
