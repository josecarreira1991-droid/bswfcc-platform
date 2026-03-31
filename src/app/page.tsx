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
    <div className="min-h-screen bg-corp-bg">
      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-corp-bg via-corp-card to-corp-bg" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <nav className="relative z-10 flex items-center justify-between max-w-7xl mx-auto px-6 py-6">
          <div>
            <span className="text-3xl font-bold text-accent">BSWFCC</span>
            <p className="text-xs text-corp-muted mt-1">Brazilian Southwest Florida Chamber of Commerce</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-corp-muted hover:text-accent transition-colors hidden sm:block">
              Entrar
            </Link>
            <Link href="/diretoria" className="text-sm text-corp-muted hover:text-accent transition-colors hidden sm:block">
              Diretoria
            </Link>
            <Link href="/login" className="px-5 py-2.5 text-sm font-medium bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors">
              Acessar Plataforma
            </Link>
          </div>
        </nav>

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32 text-center">
          <div className="inline-block px-4 py-1.5 bg-accent/10 border border-accent/15 rounded-full text-accent text-sm font-medium mb-8">
            Única câmara brasileira no Sudoeste da Flórida
          </div>
          <h1 className="text-5xl sm:text-7xl font-bold leading-tight max-w-4xl mx-auto text-corp-text">
            Conectando{" "}
            <span className="text-accent">negócios brasileiros</span>{" "}
            no coração da Flórida
          </h1>
          <p className="text-xl text-corp-muted mt-6 max-w-2xl mx-auto">
            Plataforma de inteligência de mercado, networking e crescimento para a comunidade empresarial brasileira em Lee County e Southwest Florida.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <Link
              href="/register"
              className="px-8 py-3.5 bg-accent text-white font-semibold rounded-xl hover:bg-accent/90 transition-all shadow-lg shadow-accent/20 hover:shadow-accent/40"
            >
              Tornar-se Membro
            </Link>
            <Link
              href="/diretoria"
              className="px-8 py-3.5 border border-accent/20 text-accent font-medium rounded-xl hover:bg-accent/10 transition-all"
            >
              Conheça a Diretoria
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
            <h2 className="text-3xl font-bold mb-6 text-corp-text">
              A <span className="text-accent">ponte</span> entre o Brasil e o Southwest Florida
            </h2>
            <p className="text-corp-muted leading-relaxed mb-4">
              A BSWFCC é a primeira e única câmara de comércio brasileira formalmente constituída no sudoeste da Flórida. Registrada em setembro de 2024, com escritório inaugurado em Fort Myers em fevereiro de 2026, a câmara serve uma região com crescimento populacional acelerado e uma comunidade empresarial brasileira vibrante.
            </p>
            <p className="text-corp-muted leading-relaxed mb-4">
              Com um corredor comercial bilateral de US$ 25,6 bilhões entre Florida e Brasil, e estimativa de 15.000 a 20.000 brasileiros somente no Condado de Lee, a oportunidade de negócios é concreta e urgente.
            </p>
            <p className="text-corp-muted/60 text-sm">
              EIN: 99-4852466 | SunBiz: N24000010828 | Florida Not For Profit Corporation — 501(c)(6)
            </p>
          </div>
          <div className="bg-corp-card rounded-2xl p-8 border border-corp-border">
            <h3 className="text-accent font-semibold mb-4">Dados Verificados</h3>
            <div className="space-y-3 text-sm">
              {[
                ["Nome Legal", "Brazilian Southwest Florida Chamber of Commerce, Inc."],
                ["Sede Legal", "1905 Intermodal Circle, Ste 320, Palmetto, FL"],
                ["Fort Myers", "8400 Cypress Lake Drive, Fort Myers, FL 33919"],
                ["Agente Registrado", "Carlo Barbieri Filho"],
                ["NAICS / SIC", "813 (Associações Empresariais) / SIC 861"],
                ["Website", "bswfcc.com"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-corp-border pb-2">
                  <span className="text-corp-muted">{k}</span>
                  <span className="text-corp-text text-right max-w-[60%]">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-corp-card to-corp-bg border-y border-corp-border">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl font-bold mb-4 text-corp-text">
            Pronto para fazer parte da <span className="text-accent">câmara que conecta</span>?
          </h2>
          <p className="text-corp-muted mb-8">
            Membros têm acesso a networking exclusivo, eventos, inteligência de mercado, e a maior rede de empresários brasileiros do SWFL.
          </p>
          <Link
            href="/register"
            className="inline-block px-10 py-4 bg-accent text-white font-bold rounded-xl hover:bg-accent/90 transition-all shadow-lg shadow-accent/20 text-lg"
          >
            Cadastrar Agora
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-xl font-bold text-accent">BSWFCC</span>
            <p className="text-xs text-corp-muted mt-1">Brazilian Southwest Florida Chamber of Commerce, Inc.</p>
          </div>
          <div className="flex gap-6 text-sm text-corp-muted">
            <Link href="/login" className="hover:text-accent transition-colors">Entrar</Link>
            <Link href="/diretoria" className="hover:text-accent transition-colors">Diretoria</Link>
            <Link href="/register" className="hover:text-accent transition-colors">Cadastrar</Link>
            <a href="https://bswfcc.com" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">bswfcc.com</a>
          </div>
          <p className="text-xs text-corp-muted">
            Plataforma desenvolvida por{" "}
            <a href="https://quantrexnow.io" target="_blank" rel="noopener noreferrer" className="text-accent/60 hover:text-accent">
              Quantrex LLC
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
