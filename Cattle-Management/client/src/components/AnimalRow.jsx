import { Link } from "react-router-dom";
import EarTag from "./EarTag.jsx";
import AnimalPhoto from "./AnimalPhoto.jsx";

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function AnimalRow({ animal, onQuickVaccinate, onEdit, onDelete }) {
  const lastVaccination = animal.lastVaccination;

  return (
    <tr>
      <td>
        <Link to={`/animals/${animal.animalId}`} className="group flex items-center gap-3">
          <AnimalPhoto url={animal.photoUrl} alt={animal.tag || animal.animalId} className="h-10 w-10 shrink-0" />
          <div>
            <EarTag id={animal.animalId} size="sm" />
            {animal.tag && <div className="mt-1 text-xs text-charcoal/50">{animal.tag}</div>}
          </div>
        </Link>
      </td>
      <td>
        <div className="font-medium">{animal.ownerName}</div>
        <div className="text-xs text-charcoal/50">{animal.ownerContact}</div>
      </td>
      <td className="hidden sm:table-cell">{animal.breed || "—"}</td>
      <td className="hidden sm:table-cell">{fmtDate(animal.arrivalDate)}</td>
      <td className="font-mono">{animal.rate != null ? `PKR ${Number(animal.rate).toLocaleString()}` : "N/A"}</td>
      <td className="font-mono">PKR {Number(animal.palaiCharges || 0).toLocaleString()}</td>
      <td>
        {lastVaccination ? (
          <span className="text-xs font-medium px-2 py-1 rounded bg-sandlight/70 text-charcoal/70">
            {lastVaccination.vaccineName} · {fmtDate(lastVaccination.dateGiven)}
          </span>
        ) : (
          <span className="text-xs text-charcoal/35">No record</span>
        )}
      </td>
      <td>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onQuickVaccinate(animal)}
            title="Quick-add vaccination"
            className="w-8 h-8 rounded-md bg-sandlight hover:bg-brass hover:text-white text-brass flex items-center justify-center transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M19 8l-8 8-4-4m0 0L3 16m4-4l4 4M15 5l4 4m0 0l2-2m-2 2l-2 2"
              />
            </svg>
          </button>
          <button
            onClick={() => onEdit(animal)}
            title="Edit animal"
            className="w-8 h-8 rounded-md bg-sandlight hover:bg-forest hover:text-white text-forest flex items-center justify-center transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M11 4h6.5M4 20h4l10.5-10.5a2.121 2.121 0 00-3-3L5 17v3z"
              />
            </svg>
          </button>
          <button
            onClick={() => onDelete(animal)}
            title="Delete animal"
            className="w-8 h-8 rounded-md bg-sandlight hover:bg-status-overdue hover:text-white text-status-overdue flex items-center justify-center transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M6 7h12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m2 0v13a1 1 0 01-1 1H8a1 1 0 01-1-1V7h10z"
              />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
}
