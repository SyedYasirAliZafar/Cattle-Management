import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import Header from "../components/Header.jsx";
import EarTag from "../components/EarTag.jsx";
import AnimalPhoto from "../components/AnimalPhoto.jsx";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function currentMonthStr() {
  return todayStr().slice(0, 7); // "2026-07"
}

function monthLabel(m) {
  const [y, mo] = m.split("-");
  const d = new Date(Number(y), Number(mo) - 1, 1);
  return d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

export default function BulkWeighIn() {
  const [animals, setAnimals] = useState([]);
  const [loadingAnimals, setLoadingAnimals] = useState(true);

  const [step, setStep] = useState(1); // 1 = pick month+date, 2 = enter weights
  const [month, setMonth] = useState(currentMonthStr());
  const [date, setDate] = useState(todayStr());

  const [existing, setExisting] = useState({}); // animalId -> weight already logged this month
  const [values, setValues] = useState({}); // animalId -> weight being typed
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(null);

  useEffect(() => {
    async function load() {
      setLoadingAnimals(true);
      try {
        const { data } = await api.get("/animals");
        setAnimals(data);
      } finally {
        setLoadingAnimals(false);
      }
    }
    load();
  }, []);

  function handleMonthChange(newMonth) {
    setMonth(newMonth);
    // keep the date lined up with the chosen month by default
    const [y, mo] = newMonth.split("-");
    const currentDay = date.slice(8, 10) || "01";
    setDate(`${y}-${mo}-${currentDay}`);
  }

  async function goToStep2() {
    setStep(2);
    try {
      const { data } = await api.get("/bulk/weights", { params: { month } });
      const map = {};
      data.forEach((w) => {
        map[w.animalId] = w.weight;
      });
      setExisting(map);
      setValues({ ...map });
    } catch {
      // non-fatal — user can still enter fresh weights
    }
  }

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

  const filledCount = Object.values(values).filter((v) => v !== "" && v !== undefined && v !== null).length;

  function updateValue(animalId, value) {
    setValues((prev) => ({ ...prev, [animalId]: value }));
  }

  async function handleSave() {
    const entries = Object.entries(values)
      .filter(([, v]) => v !== "" && v !== undefined && v !== null)
      .map(([animalId, weight]) => ({ animalId, weight }));

    if (entries.length === 0) {
      setError("Enter at least one weight.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const { data } = await api.post("/bulk/weights", { date, entries });
      setDone({ count: data.count });
    } catch (err) {
      setError(err.response?.data?.error || "Could not save weights.");
    } finally {
      setSaving(false);
    }
  }

  function startOver() {
    setStep(1);
    setMonth(currentMonthStr());
    setDate(todayStr());
    setValues({});
    setExisting({});
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
            {done.count} weight{done.count === 1 ? "" : "s"} recorded
          </h1>
          <p className="text-charcoal/60 mb-8">
            Saved for <span className="font-semibold text-charcoal">{monthLabel(month)}</span>.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={startOver}
              className="px-4 py-2 rounded-md bg-forest text-paper text-sm font-semibold hover:bg-forest-light transition-colors"
            >
              Record Another Month
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
        <h1 className="font-serif text-3xl font-semibold text-forest mb-1">Record Weights</h1>
        <p className="text-sm text-charcoal/50 mb-6">
          Pick the month once, then just walk down the list and type each weight.
        </p>

        {step === 1 && (
          <div className="bg-white border border-sand rounded-lg shadow-card p-6 space-y-5 max-w-md">
            <div>
              <label>Month</label>
              <input type="month" value={month} onChange={(e) => handleMonthChange(e.target.value)} autoFocus />
            </div>
            <div>
              <label>Date Recorded</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <button
              onClick={goToStep2}
              className="w-full px-5 py-2.5 rounded-md bg-forest hover:bg-forest-light text-paper text-sm font-semibold transition-colors"
            >
              Continue — Enter Weights
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white border border-sand rounded-lg shadow-card overflow-hidden">
            <div className="px-5 py-4 border-b border-sand flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-wide text-charcoal/45 font-semibold">
                  {monthLabel(month)}
                </div>
                <div className="text-sm text-charcoal/60 mt-0.5">
                  {filledCount} of {animals.length} entered
                </div>
              </div>
              <button onClick={() => setStep(1)} className="text-xs text-brass hover:underline font-medium">
                Change month / date
              </button>
            </div>

            <div className="px-5 py-3 border-b border-sand">
              <input
                type="text"
                placeholder="Search by owner, ID, tag, or breed..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {loadingAnimals ? (
              <div className="p-10 text-center text-charcoal/40 text-sm">Loading animals…</div>
            ) : filtered.length === 0 ? (
              <div className="p-10 text-center text-charcoal/40 text-sm">No animals match your search.</div>
            ) : (
              <div className="max-h-[55vh] overflow-y-auto divide-y divide-sandlight">
                {filtered.map((a) => {
                  const hasExisting = existing[a.animalId] !== undefined;
                  return (
                    <div key={a.animalId} className="flex items-center gap-3 px-5 py-3">
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
                      <div className="flex items-center gap-2 shrink-0">
                        {hasExisting && (
                          <span className="text-[10px] uppercase tracking-wide text-brass font-semibold">
                            recorded
                          </span>
                        )}
                        <input
                          type="number"
                          min="0"
                          placeholder="kg"
                          value={values[a.animalId] ?? ""}
                          onChange={(e) => updateValue(a.animalId, e.target.value)}
                          className="!w-24 text-right font-mono"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="px-5 py-4 border-t border-sand bg-sandlight/40 flex items-center justify-between gap-3">
              {error && <p className="text-xs text-status-overdue">{error}</p>}
              <div className="flex-1" />
              <button
                onClick={handleSave}
                disabled={saving || filledCount === 0}
                className="px-5 py-2.5 rounded-md bg-forest hover:bg-forest-light text-paper text-sm font-semibold transition-colors disabled:opacity-40"
              >
                {saving ? "Saving…" : `Save ${filledCount} Weight${filledCount === 1 ? "" : "s"}`}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
