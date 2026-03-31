interface KPICardProps {
  value: string;
  label: string;
  sublabel?: string;
}

export default function KPICard({ value, label, sublabel }: KPICardProps) {
  return (
    <div className="bg-white shadow-card rounded-xl p-6 border border-corp-border hover:border-navy/20 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-navy/5">
      <div className="text-3xl sm:text-4xl font-bold text-navy">{value}</div>
      <div className="text-sm text-corp-muted mt-2 uppercase tracking-wider">{label}</div>
      {sublabel && <div className="text-xs text-corp-muted mt-1">{sublabel}</div>}
    </div>
  );
}
