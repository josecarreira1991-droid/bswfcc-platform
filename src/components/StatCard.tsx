interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: { value: number; positive: boolean };
}

export default function StatCard({ title, value, subtitle, icon, trend }: StatCardProps) {
  return (
    <div className="bg-dark-blue/80 rounded-xl p-6 border border-gold/10">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <p className="text-3xl font-bold mt-1 gold-gradient">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          {trend && (
            <p className={`text-xs mt-2 ${trend.positive ? "text-green-400" : "text-red-400"}`}>
              {trend.positive ? "+" : ""}{trend.value}% vs mês anterior
            </p>
          )}
        </div>
        {icon && <div className="text-gold/40">{icon}</div>}
      </div>
    </div>
  );
}
