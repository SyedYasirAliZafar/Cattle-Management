import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import BottomNav from "./BottomNav.jsx";

export default function Header({ onSearch }) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/?search=${encodeURIComponent(query.trim())}`);
    if (onSearch) onSearch(query.trim());
  }

  const navLinkClass = ({ isActive }) =>
    `text-xs font-semibold px-3 py-2 rounded-md transition-colors whitespace-nowrap ${
      isActive ? "bg-forest text-paper" : "text-forest hover:bg-sandlight"
    }`;

  return (
    <>
      <header className="sticky top-0 z-30 border-b-2 border-brass/70 bg-white shadow-ledger">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <img src="/logo.png" alt="Noori Cattle Farm" className="h-11 w-11 rounded-md object-contain" />
          <div>
            <div className="font-serif text-lg font-semibold leading-none text-forest">Noori Cattle Farm</div>
            <div className="mt-0.5 text-[11px] tracking-wide text-charcoal/45">Goat &amp; Cattle Management</div>
          </div>
        </Link>

        <form onSubmit={handleSubmit} className="w-full max-w-xl lg:mx-4 lg:flex-1">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by Animal ID or owner name..."
              className="w-full rounded-md border-transparent bg-sandlight px-9 py-2 text-sm text-charcoal focus:!ring-brass"
            />
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal/40"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </form>

        <nav className="hidden md:flex flex-wrap items-center justify-end gap-1.5">
          <NavLink to="/client-search" className={navLinkClass}>
            Search Animals
          </NavLink>
          <NavLink to="/vaccinate" className={navLinkClass}>
            Vaccinate
          </NavLink>
          <NavLink to="/weigh-in" className={navLinkClass}>
            Record Weights
          </NavLink>
          <Link
            to="/add"
            className="shrink-0 rounded-md bg-brass px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brass-light"
          >
            + Add Animal
          </Link>
        </nav>
      </div>
      </header>

      {/* Mobile-only fixed bottom navigation. Rendered here so every
          existing page (which already renders <Header />) picks it up
          automatically with no per-page changes required. */}
      <BottomNav />
    </>
  );
}
