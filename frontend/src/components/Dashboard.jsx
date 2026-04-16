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
          className="rounded-2xl border border-sky-300/20 bg-gradient-to-b from-slate-900/80 to-blue-950/80 p-4 shadow-[0_10px_30px_rgba(14,165,233,0.2)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-cyan-300/40"
        >
          <p className="text-xs uppercase tracking-[0.14em] text-cyan-100/70">{card.label}</p>
          <p className={`mt-2 text-3xl font-semibold ${card.tone}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}
