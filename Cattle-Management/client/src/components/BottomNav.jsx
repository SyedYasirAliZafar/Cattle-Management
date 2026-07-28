import { NavLink } from "react-router-dom";

// Simple stroke-based icons matching the outline style already used
// elsewhere in the header (e.g. the search icon), so the bottom nav feels
// consistent with the rest of the UI rather than introducing a new visual
// language.

function HomeIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.25 : 1.75} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5L12 4l9 6.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 9.5V20h14V9.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 20v-6h5v6" />
    </svg>
  );
}

function SearchIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.25 : 1.75} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function VaccinateIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.25 : 1.75} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.5 5.5l-11 11" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.5 2.5l6 6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.5 14.5l3 3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 17l-1.5 4.5L7 20" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 8l2 2M13.5 5.5l2 2" />
    </svg>
  );
}

function WeighIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.25 : 1.75} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 7h14" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 7L2.5 13a2.5 2.5 0 005 0L5 7z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-2.5 6a2.5 2.5 0 005 0L19 7z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 21h7" />
    </svg>
  );
}

function AddIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.25} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
    </svg>
  );
}

const navItems = [
  { to: "/", label: "Home", Icon: HomeIcon, end: true },
  { to: "/client-search", label: "Search", Icon: SearchIcon },
  { to: "/vaccinate", label: "Vaccinate", Icon: VaccinateIcon },
  { to: "/weigh-in", label: "Weigh-In", Icon: WeighIcon },
  { to: "/add", label: "Add", Icon: AddIcon, emphasize: true },
];

// Fixed bottom navigation shown on mobile screens only (hidden from `md`
// upward, where the existing header nav links remain unchanged).
export default function BottomNav() {
  return (
    <nav
      className="md:hidden fixed inset-x-0 bottom-0 z-40 border-t-2 border-brass/70 bg-white shadow-[0_-1px_2px_rgba(42,42,40,0.06),0_-2px_8px_rgba(42,42,40,0.04)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Primary"
    >
      <ul className="flex items-stretch justify-between">
        {navItems.map(({ to, label, Icon, end, emphasize }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex min-h-[56px] w-full flex-col items-center justify-center gap-0.5 py-1.5 text-[10.5px] font-semibold transition-colors ${
                  isActive ? "text-forest" : "text-charcoal/50"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                      emphasize
                        ? "bg-brass text-white"
                        : isActive
                        ? "bg-forest/10 text-forest"
                        : "text-charcoal/50"
                    }`}
                  >
                    <Icon active={isActive} />
                  </span>
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
