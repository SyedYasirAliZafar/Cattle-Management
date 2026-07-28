import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios.js";
import Header from "../components/Header.jsx";
import EarTag from "../components/EarTag.jsx";
import AnimalPhoto from "../components/AnimalPhoto.jsx";
import WeightChart from "../components/WeightChart.jsx";
import QuickVaccinationPopover from "../components/QuickVaccinationPopover.jsx";
import AddWeightModal from "../components/AddWeightModal.jsx";

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function AnimalProfile() {
  const { animalId } = useParams();

  const [animal, setAnimal] = useState(null);
  const [vaccinations, setVaccinations] = useState([]);
  const [weights, setWeights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [showQuickVaccine, setShowQuickVaccine] = useState(false);
  const [weightModal, setWeightModal] = useState(null); // null | {} | entry
  const [downloading, setDownloading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setNotFound(false);
    try {
      const [{ data: a }, { data: v }, { data: w }] = await Promise.all([
        api.get(`/animals/${animalId}`),
        api.get(`/animals/${animalId}/vaccinations`),
        api.get(`/animals/${animalId}/weights`),
      ]);
      setAnimal(a);
      setVaccinations(v);
      setWeights(w);
    } catch (err) {
      if (err.response?.status === 404) setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [animalId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDownloadPdf() {
    setDownloading(true);
    try {
      const res = await api.get(`/animals/${animalId}/pdf`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Noori-Cattle-Farm-${animalId}-report.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } finally {
      setDownloading(false);
    }
  }

  const quickAnimalForPopover = animal
    ? {
        animalId: animal.animalId,
        lastVaccination: vaccinations[0]
          ? { vaccineName: vaccinations[0].vaccineName }
          : null,
      }
    : null;

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="p-10 text-center text-charcoal/40 text-sm">Loading animal profile…</div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="p-10 text-center">
          <p className="text-charcoal/60 mb-4">No animal found with that ID.</p>
          <Link to="/" className="text-brass underline text-sm">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-5xl animate-fade-in px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 flex flex-col gap-6 rounded-lg border border-sand bg-white p-6 shadow-card lg:flex-row">
          <AnimalPhoto url={animal.photoUrl} className="h-28 w-28 shrink-0 sm:h-32 sm:w-32" iconClassName="h-12 w-12" />
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-3">
              <EarTag id={animal.animalId} size="lg" />
            </div>
            <h1 className="font-serif text-2xl font-semibold text-forest">{animal.tag || animal.breed}</h1>
            <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2 xl:grid-cols-4">
              <div>
                <div className="text-[11px] uppercase tracking-wide text-charcoal/45 font-semibold">Owner</div>
                <div>{animal.ownerName}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wide text-charcoal/45 font-semibold">Contact</div>
                <div>{animal.ownerContact}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wide text-charcoal/45 font-semibold">Breed</div>
                <div>{animal.breed || "—"}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wide text-charcoal/45 font-semibold">Rate</div>
                <div className="font-mono">{animal.rate != null ? `PKR ${Number(animal.rate).toLocaleString()}` : "N/A"}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wide text-charcoal/45 font-semibold">Palai Charges</div>
                <div className="font-mono">PKR {Number(animal.palaiCharges || 0).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wide text-charcoal/45 font-semibold">Arrival Date</div>
                <div>{fmtDate(animal.arrivalDate)}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wide text-charcoal/45 font-semibold">Initial Weight</div>
                <div>{animal.initialWeight ? `${animal.initialWeight} kg` : "—"}</div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="px-4 py-2 rounded-md bg-brass hover:bg-brass-light text-paper text-sm font-semibold transition-colors disabled:opacity-60"
            >
              {downloading ? "Preparing…" : "Download PDF Report"}
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Vaccinations */}
          <div className="bg-white border border-sand rounded-lg shadow-card p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
              <h2 className="font-serif text-lg font-semibold text-forest">Vaccination History</h2>
              <button
                onClick={() => setShowQuickVaccine(true)}
                className="text-xs font-semibold px-3 py-1.5 rounded-md bg-forest text-paper hover:bg-forest-light transition-colors"
              >
                + Add Vaccination
              </button>
            </div>
            {vaccinations.length === 0 ? (
              <p className="text-sm text-charcoal/40">No vaccination records yet.</p>
            ) : (
              <div className="space-y-2">
                {vaccinations.map((v) => (
                  <div key={v._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-2 border-b border-sandlight last:border-0">
                    <div>
                      <div className="text-sm font-medium">{v.vaccineName}</div>
                      <div className="text-xs text-charcoal/45">Given {fmtDate(v.dateGiven)}</div>
                    </div>
                    {v.notes ? <div className="text-xs text-charcoal/60">{v.notes}</div> : null}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Weights */}
          <div className="bg-white border border-sand rounded-lg shadow-card p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
              <h2 className="font-serif text-lg font-semibold text-forest">Weight Tracking</h2>
              <button
                onClick={() => setWeightModal({})}
                className="text-xs font-semibold px-3 py-1.5 rounded-md bg-forest text-paper hover:bg-forest-light transition-colors"
              >
                + Add This Month
              </button>
            </div>
            <WeightChart weights={weights} />
            {weights.length > 0 && (
              <div className="mt-4 space-y-1 max-h-40 overflow-y-auto">
                {[...weights].reverse().map((w) => (
                  <div
                    key={w._id}
                    className="flex items-center justify-between text-sm py-1.5 border-b border-sandlight last:border-0"
                  >
                    <span className="text-charcoal/60">{w.month}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">{w.weight} kg</span>
                      <button
                        onClick={() => setWeightModal(w)}
                        className="text-xs text-brass hover:underline"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {showQuickVaccine && quickAnimalForPopover && (
        <QuickVaccinationPopover
          animal={quickAnimalForPopover}
          onClose={() => setShowQuickVaccine(false)}
          onSaved={() => {
            setShowQuickVaccine(false);
            load();
          }}
        />
      )}

      {weightModal !== null && (
        <AddWeightModal
          animalId={animalId}
          existingEntry={weightModal._id ? weightModal : null}
          onClose={() => setWeightModal(null)}
          onSaved={() => {
            setWeightModal(null);
            load();
          }}
        />
      )}
    </div>
  );
}