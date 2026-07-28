import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import Header from "../components/Header.jsx";
import EarTag from "../components/EarTag.jsx";
import AnimalPhoto from "../components/AnimalPhoto.jsx";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function BulkVaccinate() {
  const [animals, setAnimals] = useState([]);
  const [loadingAnimals, setLoadingAnimals] = useState(true);
  const [knownNames, setKnownNames] = useState([]);

  const [step, setStep] = useState(1); // 1 = pick vaccine+date, 2 = check off animals
  const [vaccineName, setVaccineName] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [dateGiven, setDateGiven] = useState(todayStr());

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(() => new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(null); // { count, vaccineName }

  useEffect(() => {
    async function load() {
      setLoadingAnimals(true);
      try {
        const [{ data: a }, { data: names }] = await Promise.all([
          api.get("/animals"),
          api.get("/meta/vaccine-names"),
        ]);
        setAnimals(a);
        setKnownNames(names);
      } finally {
        setLoadingAnimals(false);
      }
    }
    load();
  }, []);

  const finalVaccineName = isCustom ? customName.trim() : vaccineName;

  const filtered = useMemo(() => {
    if (!search.trim()) return animals;
    const q = search.trim().toLowerCase();
    return animals.filter(
      (a) =>
        a.animalId.toLowerCase().includes(q) ||
        a.ownerName.toLowerCase().includes(q) ||
        (a.tag || "").toLowerCase().includes(q) ||
        a.breed.toLowerCase().includes(q)
    );
  }, [animals, search]);

  function toggle(animalId) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(animalId)) next.delete(animalId);
      else next.add(animalId);
      return next;
    });
  }

  function selectAllFiltered() {
    setSelected((prev) => {
      const next = new Set(prev);
      filtered.forEach((a) => next.add(a.animalId));
      return next;
    });
  }

  function clearSelection() {
    setSelected(new Set());
  }

  async function handleSave() {
    if (selected.size === 0) {
      setError("Check at least one animal.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const { data } = await api.post("/bulk/vaccinations", {
        vaccineName: finalVaccineName,
        dateGiven,
        animalIds: Array.from(selected),
      });
      setDone({ count: data.count, vaccineName: finalVaccineName });
    } catch (err) {
      setError(err.response?.data?.error || "Could not save vaccinations.");
    } finally {
      setSaving(false);
    }
  }

  function startOver() {
    setStep(1);
    setVaccineName("");
    setIsCustom(false);
    setCustomName("");
    setDateGiven(todayStr());
    setSelected(new Set());
    setSearch("");
    setDone(null);
    setError("");
  }

  if (done) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="max-w-lg mx-auto px-6 py-20 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-brass/10 text-brass flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-serif text-2xl font-semibold text-forest mb-2">
            {done.count} animal{done.count === 1 ? "" : "s"} vaccinated
          </h1>
          <p className="text-charcoal/60 mb-8">
            Logged <span className="font-semibold text-charcoal">{done.vaccineName}</span> for {done.count} animal
            {done.count === 1 ? "" : "s"}.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={startOver}
              className="px-4 py-2 rounded-md bg-forest text-paper text-sm font-semibold hover:bg-forest-light transition-colors"
            >
              Log Another Vaccine
            </button>
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
      <main className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="font-serif text-3xl font-semibold text-forest mb-1">Vaccinate Animals</h1>
        <p className="text-sm text-charcoal/50 mb-6">
          Pick the vaccine once, then just tick every animal that got it.
        </p>

        {step === 1 && (
          <div className="bg-white border border-sand rounded-lg shadow-card p-6 space-y-5 max-w-md">
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
                <div className="flex gap-2">
                  <input
                    type="text"
                    autoFocus
                    placeholder="e.g. Lumpy Skin Disease"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                  />
                  {knownNames.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsCustom(false)}
                      className="shrink-0 text-xs font-medium px-3 rounded-md border border-sand hover:bg-sandlight transition-colors"
                    >
                      Choose existing
                    </button>
                  )}
                </div>
              )}
            </div>

            <div>
              <label>Date Given</label>
              <input type="date" value={dateGiven} onChange={(e) => setDateGiven(e.target.value)} />
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!finalVaccineName}
              className="w-full px-5 py-2.5 rounded-md bg-forest hover:bg-forest-light text-paper text-sm font-semibold transition-colors disabled:opacity-40"
            >
              Continue — Choose Animals
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white border border-sand rounded-lg shadow-card overflow-hidden">
            <div className="px-5 py-4 border-b border-sand flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-wide text-charcoal/45 font-semibold">
                  {finalVaccineName} · {new Date(dateGiven).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
                <div className="text-sm text-charcoal/60 mt-0.5">
                  {selected.size} of {animals.length} selected
                </div>
              </div>
              <button onClick={() => setStep(1)} className="text-xs text-brass hover:underline font-medium">
                Change vaccine / date
              </button>
            </div>

            <div className="px-5 py-3 border-b border-sand flex flex-wrap items-center gap-3">
              <input
                type="text"
                placeholder="Search by owner, ID, tag, or breed..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="!w-auto flex-1 min-w-[180px]"
              />
              <button
                onClick={selectAllFiltered}
                className="text-xs font-semibold px-3 py-1.5 rounded-md border border-sand hover:bg-sandlight transition-colors whitespace-nowrap"
              >
                Select All Shown
              </button>
              <button
                onClick={clearSelection}
                className="text-xs font-semibold px-3 py-1.5 rounded-md border border-sand hover:bg-sandlight transition-colors whitespace-nowrap"
              >
                Clear
              </button>
            </div>

            {loadingAnimals ? (
              <div className="p-10 text-center text-charcoal/40 text-sm">Loading animals…</div>
            ) : filtered.length === 0 ? (
              <div className="p-10 text-center text-charcoal/40 text-sm">No animals match your search.</div>
            ) : (
              <div className="max-h-[50vh] overflow-y-auto divide-y divide-sandlight">
                {filtered.map((a) => {
                  const checked = selected.has(a.animalId);
                  return (
                    <label
                      key={a.animalId}
                      className={`flex items-center gap-3 px-5 py-3 cursor-pointer transition-colors ${
                        checked ? "bg-brass/10" : "hover:bg-sandlight/60"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(a.animalId)}
                        className="!w-5 !h-5 accent-brass shrink-0"
                      />
                      <AnimalPhoto url={a.photoUrl} className="w-9 h-9" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <EarTag id={a.animalId} size="sm" />
                          {a.tag && <span className="text-sm text-charcoal/60 truncate">{a.tag}</span>}
                        </div>
                        <div className="text-xs text-charcoal/45 mt-0.5 truncate">
                          {a.ownerName} · {a.breed}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}

            <div className="px-5 py-4 border-t border-sand bg-sandlight/40 flex items-center justify-between gap-3">
              {error && <p className="text-xs text-status-overdue">{error}</p>}
              <div className="flex-1" />
              <button
                onClick={handleSave}
                disabled={saving || selected.size === 0}
                className="px-5 py-2.5 rounded-md bg-forest hover:bg-forest-light text-paper text-sm font-semibold transition-colors disabled:opacity-40"
              >
                {saving
                  ? "Saving…"
                  : `Save Vaccinations for ${selected.size} Animal${selected.size === 1 ? "" : "s"}`}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
