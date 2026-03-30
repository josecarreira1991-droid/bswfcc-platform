import { getCurrentMember } from "@/lib/actions/auth";
import { getMarketData } from "@/lib/actions/market";
import AuthNavbar from "@/components/AuthNavbar";
import KPICard from "@/components/KPICard";
import { redirect } from "next/navigation";
import type { MarketData } from "@/types/database";

const fallbackData = {
  comercio: [
    { value: "$25.6B", label: "Comércio FL-Brasil", sublabel: "Bilateral 2024" },
    { value: "$19B", label: "Exportações FL→Brasil", sublabel: "2024" },
    { value: "$6.6B", label: "Importações FL do Brasil", sublabel: "2024" },
    { value: "+5.3%", label: "Crescimento YoY", sublabel: "Comércio bilateral" },
  ],
  demografico: [
    { value: "894K", label: "Pop. Lee County", sublabel: "Estimativa 2026" },
    { value: "15-20K", label: "Brasileiros Lee County", sublabel: "Maior concentração SWFL" },
    { value: "$73K", label: "Renda Mediana", sublabel: "Familiar Lee County" },
    { value: "400K+", label: "Brasileiros na FL", sublabel: "Estimativa total" },
  ],
  infraestrutura: [
    { value: "11.8M", label: "SeaPort Manatee", sublabel: "Toneladas FY2025 — recorde" },
    { value: "RSW", label: "Aeroporto Internacional", sublabel: "Southwest Florida Int'l" },
    { value: "I-75", label: "Corredor Logístico", sublabel: "Tampa-Miami via SWFL" },
    { value: "3", label: "Portos Próximos", sublabel: "Manatee, Tampa, Miami" },
  ],
  negocios: [
    { value: "80+", label: "Membros BSWFCC", sublabel: "Desde setembro 2024" },
    { value: "Set 2024", label: "Registro BSWFCC", sublabel: "Florida Not For Profit" },
    { value: "Fev 2026", label: "Escritório FM", sublabel: "Inauguração Fort Myers" },
    { value: "501(c)(6)", label: "Status Fiscal", sublabel: "Chamber of Commerce" },
  ],
};

function toKPI(item: MarketData) {
  const labels: Record<string, { label: string; sublabel: string }> = {
    comercio_bilateral: { label: "Comércio FL-Brasil", sublabel: "Bilateral 2024" },
    exportacoes_fl_brasil: { label: "Exportações FL→Brasil", sublabel: "2024" },
    importacoes_fl_do_brasil: { label: "Importações FL do Brasil", sublabel: "2024" },
    crescimento_yoy: { label: "Crescimento YoY", sublabel: "Comércio bilateral" },
    populacao_lee_county: { label: "Pop. Lee County", sublabel: "Estimativa 2026" },
    brasileiros_lee_county: { label: "Brasileiros Lee County", sublabel: "Maior concentração SWFL" },
    brasileiros_florida: { label: "Brasileiros na FL", sublabel: "Estimativa total" },
    renda_mediana_lee: { label: "Renda Mediana", sublabel: "Familiar Lee County" },
    crescimento_swfl: { label: "Crescimento SWFL", sublabel: "Pop. 2010-2024" },
    seaport_manatee_tons: { label: "SeaPort Manatee", sublabel: "Toneladas FY2025 — recorde" },
    aeroporto_rsw: { label: "Aeroporto Internacional", sublabel: "Southwest Florida Int'l" },
    membros_bswfcc: { label: "Membros BSWFCC", sublabel: "Desde setembro 2024" },
    registro_bswfcc: { label: "Registro BSWFCC", sublabel: "Florida Not For Profit" },
    escritorio_fm: { label: "Escritório FM", sublabel: "Inauguração Fort Myers" },
    status_fiscal: { label: "Status Fiscal", sublabel: "Chamber of Commerce" },
    bones_coffee_hq: { label: "Bones Coffee HQ", sublabel: "Relocação Cape Coral" },
    coral_grove: { label: "Coral Grove", sublabel: "Mixed-use 131 acres" },
  };
  const meta = labels[item.indicator] || { label: item.indicator, sublabel: item.source || "" };
  return { value: item.value, label: meta.label, sublabel: meta.sublabel };
}

export default async function MercadoPage() {
  const member = await getCurrentMember();
  if (!member) redirect("/login");

  const dbData = await getMarketData().catch(() => []);
  const hasDbData = dbData.length > 0;

  const comercio = hasDbData
    ? dbData.filter((d) => d.category === "comercio").map(toKPI)
    : fallbackData.comercio;

  const demografico = hasDbData
    ? dbData.filter((d) => d.category === "demografico").map(toKPI)
    : fallbackData.demografico;

  const infraestrutura = hasDbData
    ? dbData.filter((d) => d.category === "infraestrutura" || d.category === "desenvolvimento").map(toKPI)
    : fallbackData.infraestrutura;

  const bswfcc = hasDbData
    ? dbData.filter((d) => d.category === "bswfcc").map(toKPI)
    : fallbackData.negocios;

  return (
    <div className="min-h-screen bg-navy">
      <AuthNavbar member={member} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">
            <span className="gold-gradient">Dados de Mercado</span> SWFL
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Inteligência de mercado — corredor comercial FL-Brasil e indicadores regionais
          </p>
        </div>

        {/* Comércio Bilateral */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gold mb-4 uppercase tracking-wider">
            Comércio Bilateral Florida-Brasil
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {comercio.map((k) => (
              <KPICard key={k.label} {...k} />
            ))}
          </div>
        </section>

        {/* Demográfico */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gold mb-4 uppercase tracking-wider">
            Dados Demográficos SWFL
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {demografico.map((k) => (
              <KPICard key={k.label} {...k} />
            ))}
          </div>
        </section>

        {/* Infraestrutura */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gold mb-4 uppercase tracking-wider">
            Infraestrutura e Logística
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {infraestrutura.map((k) => (
              <KPICard key={k.label} {...k} />
            ))}
          </div>
        </section>

        {/* BSWFCC */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gold mb-4 uppercase tracking-wider">
            BSWFCC em Números
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {bswfcc.map((k) => (
              <KPICard key={k.label} {...k} />
            ))}
          </div>
        </section>

        {/* Fontes */}
        <div className="bg-dark-blue/40 rounded-xl p-6 border border-gold/10">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Fontes</h3>
          <div className="grid sm:grid-cols-2 gap-2 text-xs text-gray-500">
            <p>U.S. Census Bureau — ACS 2024</p>
            <p>Enterprise Florida — Trade Data 2024</p>
            <p>Bureau of Economic Analysis — GDP by State</p>
            <p>Port Manatee — Annual Report FY2025</p>
            <p>Florida Department of Revenue</p>
            <p>BSWFCC — Registros internos</p>
          </div>
        </div>
      </main>
    </div>
  );
}
