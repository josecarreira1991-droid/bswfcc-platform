import { getCurrentMember } from "@/lib/actions/auth";
import { getMarketData } from "@/lib/actions/market";
import AuthNavbar from "@/components/AuthNavbar";
import KPICard from "@/components/KPICard";
import { redirect } from "next/navigation";

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

export default async function MercadoPage() {
  const member = await getCurrentMember();
  if (!member) redirect("/login");

  const marketData = await getMarketData().catch(() => []);

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
            {fallbackData.comercio.map((k) => (
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
            {fallbackData.demografico.map((k) => (
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
            {fallbackData.infraestrutura.map((k) => (
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
            {fallbackData.negocios.map((k) => (
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
