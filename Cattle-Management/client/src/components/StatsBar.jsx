export default function StatsBar({ stats }) {
  if (!stats) return null;

  const items = [
    { label: "Total Animals", value: stats.total, accent: "text-forest" },
    { label: "Vaccination Records", value: stats.totalVaccinations ?? 0, accent: "text-brass" },
    { label: "Avg. Weight", value: stats.avgWeight ? `${stats.avgWeight} kg` : "—", accent: "text-brass" },
    {
      label: "Total Herd Value",
      value: stats.totalValue ? `PKR ${Number(stats.totalValue).toLocaleString()}` : "—",
      accent: "text-forest",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-6 animate-fade-in">
      {items.map((item) => (
        <div
          key={item.label}
          className="bg-white border border-sand rounded-lg px-4 sm:px-5 py-4 shadow-card"
        >
          <div className="text-[11px] uppercase tracking-wide text-charcoal/50 font-semibold mb-1">
            {item.label}
          </div>
          <div className={`font-serif text-2xl font-semibold ${item.accent}`}>{item.value}</div>
        </div>
      ))}
    </div>
  );
}
