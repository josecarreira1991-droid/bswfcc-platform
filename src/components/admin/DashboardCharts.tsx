"use client";

import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";

const COLORS = ["#C9A84C", "#2D5F8A", "#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
}

function ChartCard({ title, children }: ChartCardProps) {
  return (
    <div className="bg-[#0D1B2A] border border-slate-700/50 rounded-xl p-5">
      <h3 className="text-sm font-medium text-slate-300 mb-4">{title}</h3>
      {children}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1B2A4A] border border-slate-600/50 rounded-lg px-3 py-2 text-xs text-white shadow-xl">
      <p className="text-slate-400">{label}</p>
      <p className="font-semibold">{payload[0].value}</p>
    </div>
  );
};

export function RoleDistributionChart({ data }: { data: Record<string, number> }) {
  const chartData = Object.entries(data)
    .map(([name, value]) => ({ name: formatRoleName(name), value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  if (chartData.length === 0) return <EmptyChart />;

  return (
    <ChartCard title="Membros por Cargo">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<PieTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
        {chartData.map((item, i) => (
          <div key={item.name} className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
            {item.name} ({item.value})
          </div>
        ))}
      </div>
    </ChartCard>
  );
}

export function IndustryChart({ data }: { data: Record<string, number> }) {
  const chartData = Object.entries(data)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  if (chartData.length === 0) return <EmptyChart />;

  return (
    <ChartCard title="Membros por Indústria">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
          <XAxis type="number" tick={{ fill: "#64748b", fontSize: 11 }} />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            width={100}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" fill="#C9A84C" radius={[0, 4, 4, 0]} barSize={16} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function PieTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number }> }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1B2A4A] border border-slate-600/50 rounded-lg px-3 py-2 text-xs text-white shadow-xl">
      <p className="text-slate-400">{payload[0].name}</p>
      <p className="font-semibold">{payload[0].value} membros</p>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex items-center justify-center h-[220px] text-sm text-slate-500">
      Dados insuficientes
    </div>
  );
}

function formatRoleName(role: string): string {
  const map: Record<string, string> = {
    presidente: "Presidente",
    vice_presidente: "Vice-Pres.",
    secretario: "Secretário",
    tesoureiro: "Tesoureiro",
    diretor_marketing: "Dir. Mkt",
    diretor_tecnologia: "Dir. Tech",
    head_automation: "Head Autom.",
    diretor_inovacao: "Dir. Inov.",
    diretor: "Diretor",
    membro: "Membro",
    parceiro_estrategico: "Parceiro",
    voluntario: "Voluntário",
  };
  return map[role] || role;
}
