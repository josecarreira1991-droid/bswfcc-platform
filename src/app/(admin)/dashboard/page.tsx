import { getCurrentMember } from "@/lib/actions/auth";
import { getMemberStats, getAllMembers } from "@/lib/actions/members";
import { getUpcomingEvents } from "@/lib/actions/events";
import { getMarketData } from "@/lib/actions/market";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Users, UserCheck, Clock, Calendar, TrendingUp, Plus,
  ArrowRight, BarChart3,
} from "lucide-react";
import { RoleDistributionChart, IndustryChart } from "@/components/admin/DashboardCharts";
import PendingMembers from "@/components/admin/PendingMembers";
import Badge from "@/components/ui/Badge";
import { formatDate, isAdmin, ROLE_LABELS, EVENT_TYPE_LABELS } from "@/lib/utils";

export default async function DashboardPage() {
  const member = await getCurrentMember();
  if (!member) redirect("/login");

  const [stats, events, allMembers, marketData] = await Promise.all([
    getMemberStats().catch(() => ({ total: 0, ativos: 0, pendentes: 0, inativos: 0, byRole: {}, byIndustry: {} })),
    getUpcomingEvents(5).catch(() => []),
    getAllMembers().catch(() => []),
    getMarketData().catch(() => []),
  ]);

  const pendingMembers = allMembers.filter((m) => m.status === "pendente");
  const tradeData = marketData.find((m) => m.indicator === "comercio_bilateral");
  const admin = isAdmin(member.role);

  return (
    <div>
      {/* Welcome Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">
            Bem-vindo, <span className="text-gold">{member.full_name.split(" ")[0]}</span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {ROLE_LABELS[member.role]} &middot; Painel da BSWFCC
          </p>
        </div>
        {member.status === "pendente" && (
          <Badge variant="warning">Cadastro pendente de aprovação</Badge>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total de Membros", value: stats.total, icon: Users, color: "text-gold" },
          { label: "Membros Ativos", value: stats.ativos, icon: UserCheck, color: "text-emerald-400" },
          { label: "Pendentes", value: stats.pendentes, icon: Clock, color: "text-amber-400" },
          { label: "Comércio FL-Brasil", value: tradeData?.value || "$25.6B", icon: TrendingUp, color: "text-blue-400" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-[#0D1B2A] border border-slate-700/50 rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider">{stat.label}</span>
              <stat.icon size={16} className="text-slate-600" strokeWidth={1.5} />
            </div>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Charts + Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Charts */}
          <div className="grid sm:grid-cols-2 gap-4">
            <RoleDistributionChart data={stats.byRole} />
            <IndustryChart data={stats.byIndustry} />
          </div>

          {/* Quick Actions */}
          {admin && (
            <div className="bg-[#0D1B2A] border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-sm font-medium text-slate-300 mb-3">Ações Rápidas</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { label: "Novo Evento", href: "/eventos", icon: Plus, style: "bg-gold/10 text-gold hover:bg-gold/15 border-gold/20" },
                  { label: "Ver Membros", href: "/membros", icon: Users, style: "bg-blue-500/10 text-blue-400 hover:bg-blue-500/15 border-blue-500/20" },
                  { label: "Dados de Mercado", href: "/mercado", icon: BarChart3, style: "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/15 border-emerald-500/20" },
                ].map((action) => (
                  <Link
                    key={action.label}
                    href={action.href}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium border transition-colors ${action.style}`}
                  >
                    <action.icon size={14} />
                    {action.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Pending + Events */}
        <div className="space-y-6">
          {/* Pending Approvals */}
          {admin && (
            <div className="bg-[#0D1B2A] border border-slate-700/50 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-slate-300">
                  Pendentes
                  {stats.pendentes > 0 && (
                    <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-amber-500/15 text-amber-400 rounded-md">
                      {stats.pendentes}
                    </span>
                  )}
                </h3>
                <Link href="/membros" className="text-[11px] text-gold hover:text-light-gold flex items-center gap-1">
                  Ver todos <ArrowRight size={10} />
                </Link>
              </div>
              <PendingMembers members={pendingMembers.slice(0, 5)} />
            </div>
          )}

          {/* Upcoming Events */}
          <div className="bg-[#0D1B2A] border border-slate-700/50 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-slate-300">Próximos Eventos</h3>
              <Link href="/eventos" className="text-[11px] text-gold hover:text-light-gold flex items-center gap-1">
                Ver todos <ArrowRight size={10} />
              </Link>
            </div>
            {events.length > 0 ? (
              <div className="space-y-2">
                {events.slice(0, 4).map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-800/30 border border-slate-700/30"
                  >
                    <div className="flex flex-col items-center w-10 flex-shrink-0">
                      <span className="text-lg font-bold text-gold leading-none">
                        {new Date(event.date + "T00:00:00").getDate()}
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase">
                        {new Date(event.date + "T00:00:00").toLocaleDateString("pt-BR", { month: "short" })}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{event.title}</p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span>{EVENT_TYPE_LABELS[event.type] || event.type}</span>
                        {event.time && <span>{event.time}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">Nenhum evento agendado</p>
            )}
          </div>

          {/* BSWFCC Info */}
          <div className="bg-[#0D1B2A] border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-sm font-medium text-gold mb-3">BSWFCC</h3>
            <div className="space-y-1.5 text-[11px] text-slate-500">
              <p>Primeira câmara brasileira formalmente constituída no SWFL.</p>
              <p>Registro: Set 2024 | Fort Myers: Fev 2026</p>
              <p>EIN: 99-4852466 | 501(c)(6)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
