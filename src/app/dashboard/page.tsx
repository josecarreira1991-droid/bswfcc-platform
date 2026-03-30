import { getCurrentMember } from "@/lib/actions/auth";
import { getMemberStats } from "@/lib/actions/members";
import { getUpcomingEvents } from "@/lib/actions/events";
import { getMarketData } from "@/lib/actions/market";
import AuthNavbar from "@/components/AuthNavbar";
import StatCard from "@/components/StatCard";
import EventCard from "@/components/EventCard";
import KPICard from "@/components/KPICard";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const member = await getCurrentMember();
  if (!member) redirect("/login");

  const [stats, events, marketData] = await Promise.all([
    getMemberStats().catch(() => ({ total: 0, ativos: 0, pendentes: 0, byRole: {} })),
    getUpcomingEvents(4).catch(() => []),
    getMarketData().catch(() => []),
  ]);

  const tradeData = marketData.find((m) => m.indicator === "comercio_bilateral");
  const populationData = marketData.find((m) => m.indicator === "populacao_lee_county");

  return (
    <div className="min-h-screen bg-navy">
      <AuthNavbar member={member} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">
              Bem-vindo, <span className="text-gold">{member.full_name.split(" ")[0]}</span>
            </h1>
            <p className="text-sm text-gray-400 mt-1">Painel da BSWFCC — Visão Geral</p>
          </div>
          {member.status === "pendente" && (
            <div className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-400 text-sm">
              Cadastro pendente de aprovação
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total de Membros"
            value={stats.total}
            subtitle={`${stats.ativos} ativos`}
          />
          <StatCard
            title="Pendentes"
            value={stats.pendentes}
            subtitle="Aguardando aprovação"
          />
          <StatCard
            title="Próximos Eventos"
            value={events.length}
            subtitle="Nos próximos 30 dias"
          />
          <StatCard
            title="Comércio FL-Brasil"
            value={tradeData?.value || "$25.6B"}
            subtitle="Bilateral 2024"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* KPIs Rápidos */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Indicadores SWFL</h2>
                <Link href="/mercado" className="text-sm text-gold hover:text-light-gold transition-colors">
                  Ver todos
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <KPICard value="894K" label="Pop. Lee County" sublabel="2026" />
                <KPICard value="15-20K" label="Brasileiros SWFL" sublabel="Estimativa" />
                <KPICard value="42%" label="Crescimento SWFL" sublabel="2010-2024" />
                <KPICard value="11.8M" label="SeaPort Tons" sublabel="FY2025 recorde" />
              </div>
            </section>

            {/* Ações Rápidas */}
            <section>
              <h2 className="text-lg font-semibold mb-4">Ações Rápidas</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: "Ver Membros", href: "/membros", color: "bg-accent/20 text-accent hover:bg-accent/30" },
                  { label: "Eventos", href: "/eventos", color: "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30" },
                  { label: "Inteligência", href: "/inteligencia", color: "bg-green-500/20 text-green-400 hover:bg-green-500/30" },
                  { label: "Mercado", href: "/mercado", color: "bg-gold/20 text-gold hover:bg-gold/30" },
                  { label: "Diretoria", href: "/diretoria", color: "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30" },
                  { label: "Meu Perfil", href: "/membros", color: "bg-pink-500/20 text-pink-400 hover:bg-pink-500/30" },
                ].map((action) => (
                  <Link
                    key={action.href + action.label}
                    href={action.href}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors text-center ${action.color}`}
                  >
                    {action.label}
                  </Link>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <section>
              <h2 className="text-lg font-semibold mb-4">Próximos Eventos</h2>
              {events.length > 0 ? (
                <div className="space-y-3">
                  {events.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <div className="bg-dark-blue/60 rounded-xl p-6 border border-gold/10 text-center">
                  <p className="text-gray-400 text-sm">Nenhum evento agendado</p>
                  <Link href="/eventos" className="text-gold text-sm hover:text-light-gold mt-2 inline-block">
                    Ver calendário
                  </Link>
                </div>
              )}
            </section>

            {/* Info Card */}
            <div className="bg-dark-blue/60 rounded-xl p-5 border border-gold/10">
              <h3 className="text-gold font-semibold text-sm mb-3">Sobre a BSWFCC</h3>
              <div className="space-y-2 text-xs text-gray-400">
                <p>Primeira câmara brasileira formalmente constituída no SWFL.</p>
                <p>Registro: Set 2024 | Fort Myers: Fev 2026</p>
                <p>EIN: 99-4852466 | 501(c)(6)</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
