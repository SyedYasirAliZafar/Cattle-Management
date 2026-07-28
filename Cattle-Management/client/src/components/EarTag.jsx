export default function EarTag({ id, size = "md" }) {
  const sizes = {
    sm: "text-[10px] px-2 py-0.5 gap-1",
    md: "text-xs px-2.5 py-1 gap-1.5",
    lg: "text-sm px-3.5 py-1.5 gap-2",
  };

  return (
    <span
      className={`inline-flex items-center rounded-md bg-brass text-paper font-mono font-bold tracking-wide shadow-sm relative ${sizes[size]}`}
      title={`Animal ID: ${id}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-white/70" aria-hidden="true" />
      {id}
    </span>
  );
}
