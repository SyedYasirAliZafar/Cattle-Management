import { useEffect, useMemo, useState } from "react";
import api from "../api/axios.js";
import Header from "../components/Header.jsx";
import AnimalPhoto from "../components/AnimalPhoto.jsx";
import EarTag from "../components/EarTag.jsx";

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function ContactSearch() {
  const [query, setQuery] = useState("");
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const debouncedQuery = useMemo(() => query.trim(), [query]);

  useEffect(() => {
    if (!debouncedQuery) {
      setAnimals([]);
      setError("");
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get(`/animals/contact/${encodeURIComponent(debouncedQuery)}`, { signal: controller.signal });
        setAnimals(data);
      } catch (err) {
        if (err.name !== "CanceledError") {
          setError("We could not load matching animals right now.");
          setAnimals([]);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [debouncedQuery]);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6">
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-forest">Find Animals by Contact Number</h1>
          <p className="text-sm text-charcoal/60 mt-1">Search by full or partial owner contact numbers, with instant filtering.</p>
        </div>

        <div className="bg-white border border-sand rounded-lg shadow-card p-4 sm:p-6">
          <label>Owner Contact</label>
          <input
            type="tel"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="03XX-XXXXXXX"
            className="max-w-xl"
          />

          {loading && <div className="mt-4 text-sm text-charcoal/50">Searching…</div>}
          {error && <div className="mt-4 text-sm text-status-overdue">{error}</div>}

          {!loading && !error && debouncedQuery && animals.length === 0 && (
            <div className="mt-6 rounded-lg border border-dashed border-sand px-4 py-8 text-center text-sm text-charcoal/50">
              No animals matched that contact number.
            </div>
          )}

          {!loading && !error && !debouncedQuery && (
            <div className="mt-6 rounded-lg border border-dashed border-sand px-4 py-8 text-center text-sm text-charcoal/50">
              Enter a contact number to start filtering your herd.
            </div>
          )}

          {animals.length > 0 && (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[720px] ledger-table">
                <thead>
                  <tr>
                    <th>Animal</th>
                    <th>Owner</th>
                    <th>Contact</th>
                    <th>Breed</th>
                    <th>Arrival</th>
                    <th>Weight</th>
                  </tr>
                </thead>
                <tbody>
                  {animals.map((animal) => {
                    const latestWeight = animal.latestWeight ?? null;
                    return (
                      <tr key={animal.animalId}>
                        <td>
                          <div className="flex items-center gap-3">
                            <AnimalPhoto url={animal.photoUrl} alt={animal.tag || animal.animalId} className="w-10 h-10" />
                            <div>
                              <EarTag id={animal.animalId} size="sm" />
                              {animal.tag ? <div className="text-xs text-charcoal/50 mt-1">{animal.tag}</div> : null}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="font-medium">{animal.ownerName}</div>
                        </td>
                        <td>{animal.ownerContact}</td>
                        <td>{animal.breed || "—"}</td>
                        <td>{fmtDate(animal.arrivalDate)}</td>
                        <td>{latestWeight ? `${latestWeight} kg` : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
