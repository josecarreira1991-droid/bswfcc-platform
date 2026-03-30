"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Users, Calendar, BarChart3, TrendingUp, Clock,
  UserCheck, UserX, Building2, MapPin, ArrowRight,
  Search, Filter, ChevronLeft, ChevronRight,
} from "lucide-react";
import { cn, ROLE_LABELS, STATUS_STYLES, EVENT_TYPE_LABELS, formatDate, isAdmin } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import type { Member, Event, MarketData } from "@/types/database";

interface WorkspaceViewProps {
  members: Member[];
  stats: {
    total: number;
    ativos: number;
    pendentes: number;
    inativos: number;
    byRole: Record<string, number>;
    byIndustry: Record<string, number>;
  };
  events: Event[];
  upcomingEvents: Event[];
  marketData: MarketData[];
}

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const EVENT_TYPE_COLORS: Record<string, string> = {
  networking: "bg-blue-500",
  palestra: "bg-purple-500",
  workshop: "bg-emerald-500",
  gala: "bg-gold",
  almoco: "bg-amber-500",
  outro: "bg-slate-500",
};

function AgendaCalendar({ events, upcomingEvents }: { events: Event[]; upcomingEvents: Event[] }) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const eventsByDate = useMemo(() => {
    const map: Record<string, Event[]> = {};
    for (const ev of events) {
      if (!ev.date) continue;
      if (!map[ev.date]) map[ev.date] = [];
      map[ev.date].push(ev);
    }
    return map;
  }, [events]);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
    setSelectedDate(null);
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
    setSelectedDate(null);
  };

  const goToToday = () => {
    setViewMonth(today.getMonth());
    setViewYear(today.getFullYear());
    setSelectedDate(null);
  };

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const selectedEvents = selectedDate ? eventsByDate[selectedDate] || [] : [];

  return (
    <div className="space-y-4">
      {/* Calendar header */}
      <div className="bg-[#0D1B2A] border border-slate-700/50 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-white">
              {MONTHS[viewMonth]} {viewYear}
            </h3>
            <button
              onClick={goToToday}
              className="text-[11px] text-gold hover:text-light-gold border border-gold/30 rounded px-2 py-0.5 transition-colors"
            >
              Hoje
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={prevMonth} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
              <ChevronLeft size={18} />
            </button>
            <button onClick={nextMonth} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-1">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-center text-[10px] font-semibold text-slate-500 uppercase tracking-wider py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-px bg-slate-700/20 rounded-lg overflow-hidden">
          {cells.map((day, i) => {
            if (day === null) {
              return <div key={`empty-${i}`} className="bg-[#0D1B2A] min-h-[80px]" />;
            }
            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayEvents = eventsByDate[dateStr] || [];
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                className={cn(
                  "bg-[#0D1B2A] min-h-[80px] p-1.5 text-left transition-colors relative group",
                  isSelected && "ring-1 ring-gold/50 bg-gold/5",
                  !isSelected && "hover:bg-white/[0.03]"
                )}
              >
                <span
                  className={cn(
                    "inline-flex items-center justify-center w-6 h-6 text-xs font-medium rounded-full",
                    isToday ? "bg-gold text-navy font-bold" : "text-slate-400 group-hover:text-white"
                  )}
                >
                  {day}
                </span>
                {dayEvents.length > 0 && (
                  <div className="mt-1 space-y-0.5">
                    {dayEvents.slice(0, 2).map((ev) => (
                      <div
                        key={ev.id}
                        className={cn(
                          "text-[9px] leading-tight px-1 py-0.5 rounded truncate text-white/90 font-medium",
                          EVENT_TYPE_COLORS[ev.type] || "bg-slate-600"
                        )}
                      >
                        {ev.time ? `${ev.time} ` : ""}{ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-[9px] text-slate-500 px-1">+{dayEvents.length - 2} mais</span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-slate-700/50">
          {Object.entries(EVENT_TYPE_LABELS).map(([key, label]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div className={cn("w-2.5 h-2.5 rounded-sm", EVENT_TYPE_COLORS[key] || "bg-slate-600")} />
              <span className="text-[10px] text-slate-500">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected date detail */}
      {selectedDate && (
        <div className="bg-[#0D1B2A] border border-slate-700/50 rounded-xl p-5">
          <h3 className="text-sm font-medium text-white mb-3">
            {new Date(selectedDate + "T00:00:00").toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </h3>
          {selectedEvents.length > 0 ? (
            <div className="space-y-3">
              {selectedEvents.map((ev) => (
                <div key={ev.id} className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg">
                  <div className={cn("w-1 self-stretch rounded-full flex-shrink-0", EVENT_TYPE_COLORS[ev.type] || "bg-slate-600")} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{ev.title}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                      {ev.time && (
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock size={10} /> {ev.time}
                        </span>
                      )}
                      {ev.location && (
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <MapPin size={10} /> {ev.location}
                        </span>
                      )}
                      <span className="text-[11px] text-slate-500">{EVENT_TYPE_LABELS[ev.type]}</span>
                    </div>
                    {ev.description && (
                      <p className="text-[11px] text-slate-500 mt-1.5 line-clamp-2">{ev.description}</p>
                    )}
                  </div>
                  <Badge variant={ev.is_public ? "success" : "default"}>
                    {ev.is_public ? "Público" : "Privado"}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 text-center py-4">Nenhum evento neste dia</p>
          )}
        </div>
      )}

      {/* Upcoming events sidebar */}
      <div className="bg-[#0D1B2A] border border-slate-700/50 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-white">Próximos Eventos</h3>
          <Link href="/eventos" className="text-[11px] text-gold hover:text-light-gold flex items-center gap-1">
            Gerenciar <ArrowRight size={10} />
          </Link>
        </div>
        {upcomingEvents.length > 0 ? (
          <div className="space-y-2">
            {upcomingEvents.map((ev) => (
              <div key={ev.id} className="flex items-center gap-3 py-2 border-b border-slate-800/30 last:border-0">
                <div className="flex flex-col items-center w-10 flex-shrink-0">
                  <span className="text-lg font-bold text-gold leading-none">
                    {new Date(ev.date + "T00:00:00").getDate()}
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase">
                    {new Date(ev.date + "T00:00:00").toLocaleDateString("pt-BR", { month: "short" })}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate">{ev.title}</p>
                  <p className="text-[10px] text-slate-500">
                    {EVENT_TYPE_LABELS[ev.type]}{ev.time ? ` · ${ev.time}` : ""}{ev.location ? ` · ${ev.location}` : ""}
                  </p>
                </div>
                <div className={cn("w-2 h-2 rounded-full flex-shrink-0", EVENT_TYPE_COLORS[ev.type] || "bg-slate-600")} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 text-center py-4">Nenhum evento agendado</p>
        )}
      </div>
    </div>
  );
}

export default function WorkspaceView({ members, stats, events, upcomingEvents, marketData }: WorkspaceViewProps) {
  const [memberSearch, setMemberSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "members" | "pipeline" | "activity" | "agenda">("overview");

  const recentMembers = members.slice(0, 10);
  const pendingMembers = members.filter((m) => m.status === "pendente");
  const today = new Date().toISOString().split("T")[0];
  const pastEvents = events.filter((e) => e.date < today);

  const filteredMembers = memberSearch
    ? members.filter((m) =>
        m.full_name.toLowerCase().includes(memberSearch.toLowerCase()) ||
        m.company?.toLowerCase().includes(memberSearch.toLowerCase()) ||
        m.email.toLowerCase().includes(memberSearch.toLowerCase())
      )
    : members;

  const topIndustries = Object.entries(stats.byIndustry)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">Workspace</h1>
          <p className="text-sm text-slate-500 mt-0.5">Visão operacional da câmara</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-slate-700/50 pb-px overflow-x-auto">
        {[
          { key: "overview" as const, label: "Visão Geral" },
          { key: "agenda" as const, label: "Agenda" },
          { key: "members" as const, label: "Membros" },
          { key: "pipeline" as const, label: "Pipeline" },
          { key: "activity" as const, label: "Atividade" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors",
              activeTab === tab.key
                ? "bg-[#0D1B2A] text-gold border border-slate-700/50 border-b-[#0D1B2A] -mb-px"
                : "text-slate-500 hover:text-white"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* KPI row */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              { label: "Total Membros", value: stats.total, icon: Users, color: "text-gold" },
              { label: "Ativos", value: stats.ativos, icon: UserCheck, color: "text-emerald-400" },
              { label: "Pendentes", value: stats.pendentes, icon: Clock, color: "text-amber-400" },
              { label: "Inativos", value: stats.inativos, icon: UserX, color: "text-red-400" },
              { label: "Eventos", value: events.length, icon: Calendar, color: "text-blue-400" },
            ].map((kpi) => (
              <div key={kpi.label} className="bg-[#0D1B2A] border border-slate-700/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-slate-500 uppercase tracking-wider">{kpi.label}</span>
                  <kpi.icon size={14} className="text-slate-600" strokeWidth={1.5} />
                </div>
                <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Pending actions */}
            <div className="bg-[#0D1B2A] border border-slate-700/50 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-white">Ações Pendentes</h3>
                <Link href="/membros" className="text-[11px] text-gold hover:text-light-gold flex items-center gap-1">
                  Ver todos <ArrowRight size={10} />
                </Link>
              </div>
              {pendingMembers.length > 0 ? (
                <div className="space-y-2">
                  {pendingMembers.slice(0, 5).map((m) => (
                    <div key={m.id} className="flex items-center justify-between py-2 border-b border-slate-800/30 last:border-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                          <span className="text-amber-400 text-[10px] font-bold">{m.full_name[0]}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-white truncate">{m.full_name}</p>
                          <p className="text-[10px] text-slate-500">{m.company || m.email}</p>
                        </div>
                      </div>
                      <Badge variant="warning">Pendente</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">Nenhuma ação pendente</p>
              )}
            </div>

            {/* Upcoming events */}
            <div className="bg-[#0D1B2A] border border-slate-700/50 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-white">Próximos Eventos</h3>
                <Link href="/eventos" className="text-[11px] text-gold hover:text-light-gold flex items-center gap-1">
                  Ver todos <ArrowRight size={10} />
                </Link>
              </div>
              {upcomingEvents.length > 0 ? (
                <div className="space-y-2">
                  {upcomingEvents.map((ev) => (
                    <div key={ev.id} className="flex items-center gap-3 py-2 border-b border-slate-800/30 last:border-0">
                      <div className="flex flex-col items-center w-10 flex-shrink-0">
                        <span className="text-lg font-bold text-gold leading-none">
                          {new Date(ev.date + "T00:00:00").getDate()}
                        </span>
                        <span className="text-[10px] text-slate-500 uppercase">
                          {new Date(ev.date + "T00:00:00").toLocaleDateString("pt-BR", { month: "short" })}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{ev.title}</p>
                        <p className="text-[10px] text-slate-500">{EVENT_TYPE_LABELS[ev.type]} {ev.time ? `· ${ev.time}` : ""}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">Nenhum evento agendado</p>
              )}
            </div>
          </div>

          {/* Industries */}
          {topIndustries.length > 0 && (
            <div className="bg-[#0D1B2A] border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-sm font-medium text-white mb-3">Membros por Indústria</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {topIndustries.map(([industry, count]) => (
                  <div key={industry} className="text-center py-3 bg-slate-800/30 rounded-lg">
                    <p className="text-lg font-bold text-gold">{count}</p>
                    <p className="text-[10px] text-slate-500 truncate px-2">{industry}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Members Tab */}
      {activeTab === "members" && (
        <div>
          <div className="relative mb-4 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar membro..."
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:border-gold/40 focus:outline-none"
            />
          </div>
          <div className="bg-[#0D1B2A] border border-slate-700/50 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Nome</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Empresa</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Indústria</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Cidade</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.slice(0, 25).map((m, i) => (
                  <tr key={m.id} className={cn("border-b border-slate-800/50 hover:bg-slate-800/30", i % 2 !== 0 && "bg-slate-900/20")}>
                    <td className="px-4 py-2.5">
                      <p className="font-medium text-white">{m.full_name}</p>
                      <p className="text-[10px] text-slate-500">{m.email}</p>
                    </td>
                    <td className="px-4 py-2.5 text-slate-400">{m.company || "—"}</td>
                    <td className="px-4 py-2.5 text-slate-400">{m.industry || "—"}</td>
                    <td className="px-4 py-2.5">
                      <Badge variant={m.status === "ativo" ? "success" : m.status === "pendente" ? "warning" : "danger"}>
                        {m.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 text-slate-500 text-xs">{m.city || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredMembers.length > 25 && (
              <div className="px-4 py-3 border-t border-slate-700/50 text-center">
                <Link href="/membros" className="text-xs text-gold hover:text-light-gold">
                  Ver todos os {filteredMembers.length} membros
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pipeline Tab */}
      {activeTab === "pipeline" && (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-4 gap-4">
            {[
              { label: "Pendentes", count: pendingMembers.length, members: pendingMembers, color: "border-amber-500/30 bg-amber-500/5" },
              { label: "Ativos", count: stats.ativos, members: members.filter((m) => m.status === "ativo").slice(0, 5), color: "border-emerald-500/30 bg-emerald-500/5" },
              { label: "Inativos", count: stats.inativos, members: members.filter((m) => m.status === "inativo").slice(0, 5), color: "border-red-500/30 bg-red-500/5" },
              { label: "Total", count: stats.total, members: [], color: "border-gold/30 bg-gold/5" },
            ].map((col) => (
              <div key={col.label} className={`border rounded-xl p-4 ${col.color}`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-white">{col.label}</h3>
                  <span className="text-lg font-bold text-white">{col.count}</span>
                </div>
                <div className="space-y-1.5">
                  {col.members.slice(0, 5).map((m) => (
                    <div key={m.id} className="flex items-center gap-2 py-1">
                      <div className="w-6 h-6 rounded-full bg-slate-700/50 flex items-center justify-center flex-shrink-0">
                        <span className="text-[9px] text-slate-400 font-bold">{m.full_name[0]}</span>
                      </div>
                      <p className="text-xs text-slate-300 truncate">{m.full_name}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === "activity" && (
        <div className="space-y-4">
          <div className="bg-[#0D1B2A] border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-sm font-medium text-white mb-3">Membros Recentes</h3>
            <div className="space-y-2">
              {recentMembers.map((m) => (
                <div key={m.id} className="flex items-center justify-between py-2 border-b border-slate-800/30 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gold/15 flex items-center justify-center flex-shrink-0">
                      <span className="text-gold text-xs font-bold">{m.full_name[0]}</span>
                    </div>
                    <div>
                      <p className="text-sm text-white">{m.full_name}</p>
                      <p className="text-[10px] text-slate-500">{m.company || m.industry || "—"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={m.status === "ativo" ? "success" : m.status === "pendente" ? "warning" : "danger"}>
                      {m.status}
                    </Badge>
                    <p className="text-[10px] text-slate-600 mt-0.5">{formatDate(m.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {pastEvents.length > 0 && (
            <div className="bg-[#0D1B2A] border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-sm font-medium text-white mb-3">Eventos Recentes</h3>
              <div className="space-y-2">
                {pastEvents.slice(0, 5).map((ev) => (
                  <div key={ev.id} className="flex items-center justify-between py-2 border-b border-slate-800/30 last:border-0">
                    <div>
                      <p className="text-sm text-white">{ev.title}</p>
                      <p className="text-[10px] text-slate-500">{EVENT_TYPE_LABELS[ev.type]} · {formatDate(ev.date)}</p>
                    </div>
                    <Badge variant="default">{ev.is_public ? "Público" : "Privado"}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Agenda Tab */}
      {activeTab === "agenda" && (
        <AgendaCalendar events={events} upcomingEvents={upcomingEvents} />
      )}
    </div>
  );
}
