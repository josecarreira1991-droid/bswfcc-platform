import { getCurrentMember } from "@/lib/actions/auth";
import AuthNavbar from "@/components/AuthNavbar";
import { redirect } from "next/navigation";

const reports = [
  {
    title: "Relatório de Inteligência de Mercado — SWFL Q1 2026",
    description: "Análise completa do corredor comercial Florida-Brasil, oportunidades em Lee County, tendências de mercado e recomendações estratégicas para membros da BSWFCC.",
    category: "Mercado",
    date: "Março 2026",
    highlights: ["Comércio bilateral $25.6B", "Crescimento 42% SWFL", "15-20K brasileiros Lee County"],
  },
  {
    title: "Mapeamento de Indústrias — Lee County & SWFL",
    description: "Setores-chave para empresários brasileiros: construção, real estate, saúde, food service, serviços profissionais, turismo e tecnologia.",
    category: "Setorial",
    date: "Fevereiro 2026",
    highlights: ["12 setores mapeados", "Oportunidades por setor", "Barreiras de entrada"],
  },
  {
    title: "Perfil do Empreendedor Brasileiro no SWFL",
    description: "Pesquisa interna com membros da BSWFCC sobre perfil, desafios, necessidades e oportunidades da comunidade empresarial brasileira na região.",
    category: "Pesquisa",
    date: "Janeiro 2026",
    highlights: ["80+ membros pesquisados", "Top 5 desafios", "Ações prioritárias"],
  },
  {
    title: "Guia de Compliance — Empresa Brasileira na FL",
    description: "Orientações sobre registro de empresa, tributação, licenças, vistos de negócios, e compliance para brasileiros operando na Flórida.",
    category: "Legal",
    date: "Dezembro 2025",
    highlights: ["LLC vs Corp", "Tributação FL", "Vistos E-2, L-1, EB-5"],
  },
  {
    title: "Análise Competitiva — Câmaras e Associações SWFL",
    description: "Mapeamento das câmaras de comércio e associações empresariais atuantes em Lee County e SWFL, com posicionamento estratégico da BSWFCC.",
    category: "Estratégia",
    date: "Novembro 2025",
    highlights: ["8 câmaras mapeadas", "Diferencial BSWFCC", "Oportunidades de parceria"],
  },
];

const categoryColors: Record<string, string> = {
  Mercado: "bg-gold/20 text-gold",
  Setorial: "bg-blue-500/20 text-blue-400",
  Pesquisa: "bg-purple-500/20 text-purple-400",
  Legal: "bg-red-500/20 text-red-400",
  "Estratégia": "bg-green-500/20 text-green-400",
};

export default async function InteligenciaPage() {
  const member = await getCurrentMember();
  if (!member) redirect("/login");

  return (
    <div className="min-h-screen bg-navy">
      <AuthNavbar member={member} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">
            <span className="gold-gradient">Inteligência</span> de Mercado
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Relatórios, análises e insights exclusivos para membros
          </p>
        </div>

        {/* Destaque */}
        <div className="bg-gradient-to-r from-dark-blue to-navy rounded-2xl p-8 border border-gold/20 mb-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/20 text-gold font-medium">
              DESTAQUE
            </span>
            <span className="text-xs text-gray-500">Março 2026</span>
          </div>
          <h2 className="text-xl font-bold mb-2">
            Relatório de Inteligência de Mercado — SWFL Q1 2026
          </h2>
          <p className="text-gray-400 text-sm mb-4 max-w-3xl">
            Análise completa do corredor comercial Florida-Brasil com dados atualizados, tendências de mercado, oportunidades setoriais e recomendações estratégicas.
          </p>
          <div className="flex flex-wrap gap-2">
            {["Comércio bilateral $25.6B", "Crescimento 42% SWFL", "15-20K brasileiros Lee County"].map((h) => (
              <span key={h} className="text-[11px] px-3 py-1 bg-gold/10 text-gold rounded-full">{h}</span>
            ))}
          </div>
        </div>

        {/* Lista de Relatórios */}
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.title}
              className="bg-dark-blue/60 rounded-xl p-6 border border-gold/10 hover:border-gold/30 transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${categoryColors[report.category] || "bg-gray-500/20 text-gray-400"}`}>
                      {report.category}
                    </span>
                    <span className="text-xs text-gray-500">{report.date}</span>
                  </div>
                  <h3 className="text-base font-semibold text-white group-hover:text-gold transition-colors">
                    {report.title}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">{report.description}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {report.highlights.map((h) => (
                      <span key={h} className="text-[10px] px-2 py-0.5 bg-white/5 text-gray-400 rounded">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="shrink-0">
                  <button className="px-4 py-2 text-xs font-medium bg-gold/10 text-gold rounded-lg hover:bg-gold/20 transition-colors">
                    Acessar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info */}
        <div className="mt-12 bg-dark-blue/40 rounded-xl p-6 border border-gold/10 text-center">
          <p className="text-gray-400 text-sm">
            Relatórios são produzidos pela equipe da BSWFCC com dados de fontes oficiais (Census Bureau, Enterprise Florida, BEA, Florida DoR) e pesquisas internas.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Acesso exclusivo para membros ativos da câmara.
          </p>
        </div>
      </main>
    </div>
  );
}
