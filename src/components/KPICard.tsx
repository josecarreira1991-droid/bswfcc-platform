interface KPICardProps {
  value: string;
  label: string;
  sublabel?: string;
}

export default function KPICard({ value, label, sublabel }: KPICardProps) {
  return (
    <div className="bg-dark-blue/80 rounded-xl p-6 border border-gold/10 hover:border-gold/30 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-gold/5">
      <div className="text-3xl sm:text-4xl font-bold gold-gradient">{value}</div>
      <div className="text-sm text-gray-400 mt-2 uppercase tracking-wider">{label}</div>
      {sublabel && <div className="text-xs text-gray-500 mt-1">{sublabel}</div>}
    </div>
  );
}
