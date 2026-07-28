import { useState } from "react";
import api from "../api/axios.js";
import Header from "../components/Header.jsx";
import EarTag from "../components/EarTag.jsx";
import AnimalPhoto from "../components/AnimalPhoto.jsx";

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function ClientSearch({ initialMode = "animal" }) {
  const [mode, setMode] = useState(initialMode);
  const [query, setQuery] = useState("");
  const [animal, setAnimal] = useState(null);
  const [animals, setAnimals] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [error, setError] = useState("");

  function resetResults() {
    setAnimal(null);
    setAnimals([]);
    setSearched(false);
    setError("");
  }

  async function handleSearch(e) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      setError("Enter an animal ID or owner contact number to search.");
      return;
    }

    setLoading(true);
    setSearched(true);
    setError("");
    setAnimal(null);
    setAnimals([]);

    try {
      if (mode === "animal") {
        const { data } = await api.get(`/animals/${encodeURIComponent(trimmed)}`);
        setAnimal(data);
      } else {
        const { data } = await api.get(`/animals/contact/${encodeURIComponent(trimmed)}`);
        setAnimals(data);
      }
    } catch (err) {
      const message = err.response?.status === 404 ? "No matching record found." : "We could not complete that search right now.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDownloadPdf(animalId) {
    setDownloadingId(animalId);
    try {
      const res = await api.get(`/animals/${animalId}/pdf`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Noori-Cattle-Farm-${animalId}-report.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } finally {
      setDownloadingId(null);
    }
  }

  function changeMode(nextMode) {
    setMode(nextMode);
    setQuery("");
    resetResults();
  }

  return (
    <div className="min-h-screen bg-paper/70">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:py-10">
        <div className="mb-6 text-center sm:text-left">
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-forest">Search Animals</h1>
          <p className="mt-2 text-sm text-charcoal/60">Find animals by animal ID or owner contact number, then download a PDF report instantly.</p>
        </div>

        <div className="rounded-xl border border-sand bg-white p-4 shadow-card sm:p-6">
          <div className="mb-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => changeMode("animal")}
              className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${mode === "animal" ? "bg-forest text-paper" : "bg-sandlight text-charcoal/70"}`}
            >
              Search by Animal ID
            </button>
            <button
              type="button"
              onClick={() => changeMode("contact")}
              className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${mode === "contact" ? "bg-forest text-paper" : "bg-sandlight text-charcoal/70"}`}
            >
              Search by Contact Number
            </button>
          </div>

          <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
            <input
              type={mode === "animal" ? "text" : "tel"}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={mode === "animal" ? "e.g. CTL-0007" : "03XX-XXXXXXX"}
              className="flex-1"
            />
            <button type="submit" className="rounded-md bg-forest px-5 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-forest-light sm:min-w-[120px]">
              Search
            </button>
          </form>

          {loading && <div className="mt-4 text-sm text-charcoal/50">Searching…</div>}
          {error && <div className="mt-4 rounded-md border border-brass/20 bg-brass/5 px-3 py-2 text-sm text-charcoal/70">{error}</div>}

          {!loading && mode === "animal" && searched && !animal && !error && (
            <div className="mt-6 rounded-lg border border-dashed border-sand px-4 py-8 text-center text-sm text-charcoal/50">
              No animal found for <span className="font-mono">{query}</span>. Please double-check the ID and try again.
            </div>
          )}

          {!loading && mode === "animal" && animal && (
            <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-lg border border-sand bg-sandlight/40 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <AnimalPhoto url={animal.photoUrl} className="h-24 w-24 shrink-0" iconClassName="h-10 w-10" />
                  <div className="flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <EarTag id={animal.animalId} size="lg" />
                      {animal.tag ? <span className="text-sm text-charcoal/60">{animal.tag}</span> : null}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <div className="text-[11px] uppercase tracking-wide text-charcoal/45">Owner</div>
                        <div className="text-sm font-medium">{animal.ownerName}</div>
                      </div>
                      <div>
                        <div className="text-[11px] uppercase tracking-wide text-charcoal/45">Contact</div>
                        <div className="text-sm">{animal.ownerContact}</div>
                      </div>
                      <div>
                        <div className="text-[11px] uppercase tracking-wide text-charcoal/45">Breed</div>
                        <div className="text-sm">{animal.breed || "—"}</div>
                      </div>
                      <div>
                        <div className="text-[11px] uppercase tracking-wide text-charcoal/45">Arrival</div>
                        <div className="text-sm">{fmtDate(animal.arrivalDate)}</div>
                      </div>
                      <div>
                        <div className="text-[11px] uppercase tracking-wide text-charcoal/45">Rate</div>
                        <div className="text-sm font-mono">{animal.rate != null ? `PKR ${Number(animal.rate).toLocaleString()}` : "N/A"}</div>
                      </div>
                      <div>
                        <div className="text-[11px] uppercase tracking-wide text-charcoal/45">Palai Charges</div>
                        <div className="text-sm font-mono">PKR {Number(animal.palaiCharges || 0).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-sand bg-white p-5">
                <h2 className="font-serif text-lg font-semibold text-forest">Download Report</h2>
                <p className="mt-2 text-sm text-charcoal/60">Generate a full PDF report for this animal in one tap.</p>
                <button
                  onClick={() => handleDownloadPdf(animal.animalId)}
                  disabled={downloadingId === animal.animalId}
                  className="mt-4 w-full rounded-md bg-brass px-4 py-3 text-sm font-semibold text-paper transition-colors hover:bg-brass-light disabled:opacity-60"
                >
                  {downloadingId === animal.animalId ? "Preparing…" : "Download PDF Report"}
                </button>
              </div>
            </div>
          )}

          {!loading && mode === "contact" && searched && animals.length > 0 && (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[760px] ledger-table">
                <thead>
                  <tr>
                    <th>Animal</th>
                    <th>Owner</th>
                    <th>Contact</th>
                    <th className="hidden sm:table-cell">Breed</th>
                    <th className="hidden sm:table-cell">Arrival</th>
                    <th>Weight</th>
                    <th>Report</th>
                  </tr>
                </thead>
                <tbody>
                  {animals.map((animalEntry) => (
                    <tr key={animalEntry.animalId}>
                      <td>
                        <div className="flex items-center gap-3">
                          <AnimalPhoto url={animalEntry.photoUrl} alt={animalEntry.tag || animalEntry.animalId} className="h-10 w-10" />
                          <div>
                            <EarTag id={animalEntry.animalId} size="sm" />
                            {animalEntry.tag ? <div className="mt-1 text-xs text-charcoal/50">{animalEntry.tag}</div> : null}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="font-medium">{animalEntry.ownerName}</div>
                      </td>
                      <td>{animalEntry.ownerContact}</td>
                      <td className="hidden sm:table-cell">{animalEntry.breed || "—"}</td>
                      <td className="hidden sm:table-cell">{fmtDate(animalEntry.arrivalDate)}</td>
                      <td>{animalEntry.latestWeight ? `${animalEntry.latestWeight} kg` : "—"}</td>
                      <td>
                        <button
                          onClick={() => handleDownloadPdf(animalEntry.animalId)}
                          disabled={downloadingId === animalEntry.animalId}
                          className="rounded-md border border-sand px-3 py-1.5 text-xs font-semibold text-brass transition-colors hover:bg-sandlight disabled:opacity-60"
                        >
                          {downloadingId === animalEntry.animalId ? "Preparing…" : "PDF"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && mode === "contact" && searched && animals.length === 0 && !error && (
            <div className="mt-6 rounded-lg border border-dashed border-sand px-4 py-8 text-center text-sm text-charcoal/50">
              No animals matched that contact number.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
