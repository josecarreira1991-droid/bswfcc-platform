import Link from "next/link";
import KPICard from "@/components/KPICard";

const kpis = [
  { value: "$25.6B", label: "Comércio FL-Brasil", sublabel: "Bilateral 2024" },
  { value: "894K", label: "População Lee County", sublabel: "Estimativa 2026" },
  { value: "15-20K", label: "Brasileiros Lee County", sublabel: "Maior concentração SWFL" },
  { value: "80+", label: "Membros Ativos", sublabel: "Desde setembro 2024" },
  { value: "11.8M", label: "SeaPort Manatee Tons", sublabel: "FY2025 — recorde" },
  { value: "42%", label: "Crescimento SWFL", sublabel: "2010-2024" },
  { value: "Set 2024", label: "Registro BSWFCC", sublabel: "Florida Not For Profit" },
  { value: "Fev 2026", label: "Escritório Fort Myers", sublabel: "Inauguração" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-navy">
      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy via-dark-blue to-navy" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <nav className="relative z-10 flex items-center justify-between max-w-7xl mx-auto px-6 py-6">
          <div>
            <span className="text-3xl font-bold gold-gradient">BSWFCC</span>
            <p className="text-xs text-gray-400 mt-1">Brazilian Southwest Florida Chamber of Commerce</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-gray-300 hover:text-gold transition-colors hidden sm:block">
              Dashboard
            </Link>
            <Link href="/diretoria" className="text-sm text-gray-300 hover:text-gold transition-colors hidden sm:block">
              Diretoria
            </Link>
            <Link href="/login" className="px-5 py-2.5 text-sm font-medium bg-gold text-navy rounded-lg hover:bg-light-gold transition-colors">
              Acessar Plataforma
            </Link>
          </div>
        </nav>

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32 text-center">
          <div className="inline-block px-4 py-1.5 bg-gold/10 border border-gold/20 rounded-full text-gold text-sm font-medium mb-8">
            Única câmara brasileira no Sudoeste da Flórida
          </div>
          <h1 className="text-5xl sm:text-7xl font-bold leading-tight max-w-4xl mx-auto">
            Conectando{" "}
            <span className="gold-gradient">negócios brasileiros</span>{" "}
            no coração da Flórida
          </h1>
          <p className="text-xl text-gray-400 mt-6 max-w-2xl mx-auto">
            Plataforma de inteligência de mercado, networking e crescimento para a comunidade empresarial brasileira em Lee County e Southwest Florida.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <Link
              href="/register"
              className="px-8 py-3.5 bg-gold text-navy font-semibold rounded-xl hover:bg-light-gold transition-all shadow-lg shadow-gold/20 hover:shadow-gold/40"
            >
              Tornar-se Membro
            </Link>
            <Link
              href="/inteligencia"
              className="px-8 py-3.5 border border-gold/30 text-gold font-medium rounded-xl hover:bg-gold/10 transition-all"
            >
              Ver Relatórios
            </Link>
          </div>
        </div>
      </header>

      {/* KPIs */}
      <section className="max-w-7xl mx-auto px-6 -mt-16 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <KPICard key={kpi.label} {...kpi} />
          ))}
        </div>
      </section>

      {/* About */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">
              A <span className="text-gold">ponte</span> entre o Brasil e o Southwest Florida
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              A BSWFCC é a primeira e única câmara de comércio brasileira formalmente constituída no sudoeste da Flórida. Registrada em setembro de 2024, com escritório inaugurado em Fort Myers em fevereiro de 2026, a câmara serve uma região com crescimento populacional acelerado e uma comunidade empresarial brasileira vibrante.
            </p>
            <p className="text-gray-300 leading-relaxed mb-4">
              Com um corredor comercial bilateral de US$ 25,6 bilhões entre Florida e Brasil, e estimativa de 15.000 a 20.000 brasileiros somente no Condado de Lee, a oportunidade de negócios é concreta e urgente.
            </p>
            <p className="text-gray-400 text-sm">
              EIN: 99-4852466 | SunBiz: N24000010828 | Florida Not For Profit Corporation — 501(c)(6)
            </p>
          </div>
          <div className="bg-dark-blue/60 rounded-2xl p-8 border border-gold/10">
            <h3 className="text-gold font-semibold mb-4">Dados Verificados</h3>
            <div className="space-y-3 text-sm">
              {[
                ["Nome Legal", "Brazilian Southwest Florida Chamber of Commerce, Inc."],
                ["Sede Legal", "1905 Intermodal Circle, Ste 320, Palmetto, FL"],
                ["Fort Myers", "8400 Cypress Lake Drive, Fort Myers, FL 33919"],
                ["Agente Registrado", "Carlo Barbieri Filho"],
                ["NAICS / SIC", "813 (Associações Empresariais) / SIC 861"],
                ["Website", "bswfcc.com"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-400">{k}</span>
                  <span className="text-gray-200 text-right max-w-[60%]">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-dark-blue to-navy border-y border-gold/10">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Pronto para fazer parte da <span className="text-gold">câmara que conecta</span>?
          </h2>
          <p className="text-gray-400 mb-8">
            Membros têm acesso a networking exclusivo, eventos, inteligência de mercado, e a maior rede de empresários brasileiros do SWFL.
          </p>
          <Link
            href="/register"
            className="inline-block px-10 py-4 bg-gold text-navy font-bold rounded-xl hover:bg-light-gold transition-all shadow-lg shadow-gold/20 text-lg"
          >
            Cadastrar Agora
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-xl font-bold gold-gradient">BSWFCC</span>
            <p className="text-xs text-gray-500 mt-1">Brazilian Southwest Florida Chamber of Commerce, Inc.</p>
          </div>
          <div className="flex gap-6 text-sm text-gray-400">
            <Link href="/dashboard" className="hover:text-gold transition-colors">Dashboard</Link>
            <Link href="/diretoria" className="hover:text-gold transition-colors">Diretoria</Link>
            <Link href="/eventos" className="hover:text-gold transition-colors">Eventos</Link>
            <a href="https://bswfcc.com" target="_blank" className="hover:text-gold transition-colors">bswfcc.com</a>
          </div>
          <p className="text-xs text-gray-600">
            Plataforma desenvolvida por{" "}
            <a href="https://quantrexnow.io" target="_blank" className="text-gold/60 hover:text-gold">
              Quantrex LLC
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
