interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
}

export default function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <div className="forge-card p-4">
      <p className="text-xs font-mono text-text-sec uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-display text-text">{value}</p>
      {sub && <p className="text-xs font-mono text-text-dim mt-1">{sub}</p>}
    </div>
  );
}
