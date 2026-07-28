import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios.js";
import Header from "../components/Header.jsx";
import StatsBar from "../components/StatsBar.jsx";
import AnimalRow from "../components/AnimalRow.jsx";
import QuickVaccinationPopover from "../components/QuickVaccinationPopover.jsx";
import EditAnimalModal from "../components/EditAnimalModal.jsx";

export default function Dashboard() {
  const [animals, setAnimals] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quickAnimal, setQuickAnimal] = useState(null);
  const [editAnimal, setEditAnimal] = useState(null);
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search") || "";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: animalsData }, { data: statsData }] = await Promise.all([
        api.get("/animals", { params: search ? { search } : {} }),
        api.get("/animals/stats"),
      ]);
      setAnimals(animalsData);
      setStats(statsData);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(animal) {
    if (!confirm(`Delete ${animal.animalId}? This removes all its vaccination and weight records too.`)) return;
    await api.delete(`/animals/${animal.animalId}`);
    load();
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <h1 className="font-serif text-3xl font-semibold text-forest">
              {search ? `Results for "${search}"` : "Herd Ledger"}
            </h1>
            <p className="text-sm text-charcoal/50 mt-1">
              {search ? `${animals.length} match(es) found` : "Every animal, at a glance"}
            </p>
          </div>
        </div>

        <StatsBar stats={stats} />

        <div className="overflow-hidden rounded-lg border border-sand bg-white shadow-card">
          {loading ? (
            <div className="p-10 text-center text-sm text-charcoal/40">Loading ledger…</div>
          ) : animals.length === 0 ? (
            <div className="p-10 text-center text-sm text-charcoal/40">
              No animals found. Try clearing your search, or{" "}
              <a href="/add" className="text-brass underline">
                add a new animal
              </a>
              .
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] ledger-table">
                <thead>
                  <tr>
                    <th>Animal</th>
                    <th>Owner</th>
                    <th className="hidden sm:table-cell">Breed</th>
                    <th className="hidden sm:table-cell">Arrival</th>
                    <th>Rate</th>
                    <th>Palai Charges</th>
                    <th>Latest Vaccination</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {animals.map((a) => (
                    <AnimalRow
                      key={a.animalId}
                      animal={a}
                      onQuickVaccinate={setQuickAnimal}
                      onEdit={setEditAnimal}
                      onDelete={handleDelete}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {quickAnimal && (
        <QuickVaccinationPopover
          animal={quickAnimal}
          onClose={() => setQuickAnimal(null)}
          onSaved={() => {
            setQuickAnimal(null);
            load();
          }}
        />
      )}

      {editAnimal && (
        <EditAnimalModal
          animal={editAnimal}
          onClose={() => setEditAnimal(null)}
          onSaved={() => {
            setEditAnimal(null);
            load();
          }}
        />
      )}
    </div>
  );
}
