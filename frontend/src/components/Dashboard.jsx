export default function Dashboard({ metrics }) {
  const cards = [
    {
      label: "Resolution Rate",
      value: `${metrics.resolution_rate ?? 0}%`,
      tone: "text-success",
    },
    {
      label: "Total Queries",
      value: metrics.total_queries ?? 0,
      tone: "text-accent",
    },
    {
      label: "Resolved Queries",
      value: metrics.resolved_queries ?? 0,
      tone: "text-emerald-300",
    },
    {
      label: "Emergency Cases",
      value: metrics.emergency_cases_flagged ?? 0,
      tone: "text-danger",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl border border-slate-700 bg-panel/80 p-4 shadow-lg backdrop-blur"
        >
          <p className="text-xs uppercase tracking-wider text-slate-400">{card.label}</p>
          <p className={`mt-1 text-2xl font-semibold ${card.tone}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}
