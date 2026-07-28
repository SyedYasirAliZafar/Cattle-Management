import { useRef, useState } from "react";
import api from "../api/axios.js";
import AnimalPhoto from "./AnimalPhoto.jsx";

export default function EditAnimalModal({ animal, onClose, onSaved }) {
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    tag: animal.tag || "",
    ownerName: animal.ownerName,
    ownerContact: animal.ownerContact,
    breed: animal.breed || "",
    rate: animal.rate ?? "",
    palaiCharges: animal.palaiCharges || 0,
    arrivalDate: typeof animal.arrivalDate === "string" ? animal.arrivalDate.slice(0, 10) : new Date(animal.arrivalDate).toISOString().slice(0, 10),
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(animal.photoUrl || "");
  const [removePhoto, setRemovePhoto] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setRemovePhoto(false);
  }

  function handleRemovePhoto() {
    setPhotoFile(null);
    setPhotoPreview("");
    setRemovePhoto(true);
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (photoFile) fd.append("photo", photoFile);
      if (removePhoto) fd.append("removePhoto", "true");

      const { data } = await api.put(`/animals/${animal.animalId}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onSaved(data);
    } catch (err) {
      setError(err.response?.data?.error || "Could not save changes.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 animate-fade-in max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-serif font-semibold text-xl text-forest mb-4">Edit Animal — {animal.animalId}</h3>

        <div className="space-y-4">
          <div>
            <label>Photo</label>
            <div className="flex items-center gap-4">
              <AnimalPhoto url={photoPreview} className="w-16 h-16" iconClassName="w-7 h-7" />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="text-xs font-medium px-3 py-1.5 rounded-md border border-sand hover:bg-sandlight transition-colors"
                >
                  {photoPreview ? "Replace" : "Upload"}
                </button>
                {photoPreview && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="text-xs font-medium px-3 py-1.5 rounded-md border border-status-overdue/30 text-status-overdue hover:bg-status-overdue/5 transition-colors"
                  >
                    Remove
                  </button>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>Tag / Nickname</label>
              <input type="text" value={form.tag} onChange={(e) => update("tag", e.target.value)} />
            </div>
            <div>
              <label>Breed (optional)</label>
              <input type="text" value={form.breed} onChange={(e) => update("breed", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>Owner Name</label>
              <input type="text" value={form.ownerName} onChange={(e) => update("ownerName", e.target.value)} />
            </div>
            <div>
              <label>Owner Contact</label>
              <input type="tel" value={form.ownerContact} onChange={(e) => update("ownerContact", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>Rate (PKR)</label>
              <input type="number" min="0" value={form.rate} onChange={(e) => update("rate", e.target.value)} placeholder="Optional" />
            </div>
            <div>
              <label>Palai Charges (PKR)</label>
              <input type="number" min="0" value={form.palaiCharges} onChange={(e) => update("palaiCharges", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>Arrival Date</label>
              <input type="date" value={form.arrivalDate} onChange={(e) => update("arrivalDate", e.target.value)} />
            </div>
          </div>

          {error && <p className="text-sm text-status-overdue">{error}</p>}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-md border border-sand text-sm font-medium text-charcoal/70 hover:bg-sandlight transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-md bg-forest hover:bg-forest-light text-paper text-sm font-semibold transition-colors disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
