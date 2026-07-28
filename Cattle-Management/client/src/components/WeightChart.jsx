import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function fmtMonth(m) {
  const [y, mo] = m.split("-");
  const d = new Date(Number(y), Number(mo) - 1, 1);
  return d.toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
}

export default function WeightChart({ weights }) {
  if (!weights || weights.length === 0) {
    return (
      <div className="h-56 flex items-center justify-center text-sm text-charcoal/35 bg-sandlight/50 rounded-md">
        No weight records yet — add the first entry below.
      </div>
    );
  }

  const data = weights.map((w) => ({ month: fmtMonth(w.month), weight: w.weight }));

  return (
    <div className="h-56 animate-fade-in">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 16, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#EDE1C0" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#2A2A2899" }} axisLine={{ stroke: "#EDE1C0" }} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#2A2A2899" }} axisLine={false} tickLine={false} width={44} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: "1px solid #EDE1C0", fontSize: 12 }}
            formatter={(value) => [`${value} kg`, "Weight"]}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="#D9A227"
            strokeWidth={2.5}
            dot={{ fill: "#B96D08", r: 3.5 }}
            activeDot={{ r: 5 }}
            animationDuration={800}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
