"use client";

import { ROLE_LABELS } from "@/lib/utils";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";

const COLORS = ["#1B3A6B", "#2D5F8A", "#C8A96E", "#22c55e", "#f59e0b", "#6366f1", "#8b5cf6", "#ec4899"];

const TOOLTIP_CLASS = "bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-corp-text shadow-lg";

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
}

function ChartCard({ title, children }: ChartCardProps) {
  return (
    <div className="bg-white border border-corp-border rounded-xl p-5 shadow-card">
      <h3 className="text-sm font-medium text-corp-text mb-4">{title}</h3>
      {children}
    </div>
  );
}

function formatRoleName(role: string): string {
  return ROLE_LABELS[role] || role;
}

function EmptyChart() {
  return (
    <div className="flex items-center justify-center h-[220px] text-sm text-corp-muted">
      Dados insuficientes
    </div>
  );
}

function PieTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number }> }) {
  if (!active || !payload?.length) return null;
  return (
    <div className={TOOLTIP_CLASS}>
      <p className="text-corp-muted">{payload[0].name}</p>
      <p className="font-semibold text-corp-text">{payload[0].value} membros</p>
    </div>
  );
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className={TOOLTIP_CLASS}>
      <p className="text-corp-muted">{label}</p>
      <p className="font-semibold text-corp-text">{payload[0].value}</p>
    </div>
  );
}

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
          <div key={item.name} className="flex items-center gap-1.5 text-[11px] text-corp-muted">
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
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
          <XAxis type="number" tick={{ fill: "#64748B", fontSize: 11 }} />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: "#475569", fontSize: 11 }}
            width={100}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" fill="#1B3A6B" radius={[0, 4, 4, 0]} barSize={16} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
