import { getCurrentMember } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import { FileText, Download, ExternalLink } from "lucide-react";
import Badge from "@/components/ui/Badge";

const reports = [
  {
    title: "Relatório de Inteligência de Mercado — SWFL Q1 2026",
    description: "Análise completa do corredor comercial Florida-Brasil, oportunidades em Lee County, tendências de mercado.",
    category: "Mercado",
    date: "Março 2026",
    highlights: ["Comércio bilateral $25.6B", "Crescimento 42% SWFL", "15-20K brasileiros Lee County"],
  },
  {
    title: "Mapeamento de Indústrias — Lee County & SWFL",
    description: "Setores-chave para empresários brasileiros: construção, real estate, saúde, food service, serviços profissionais.",
    category: "Setorial",
    date: "Fevereiro 2026",
    highlights: ["12 setores mapeados", "Oportunidades por setor", "Barreiras de entrada"],
  },
  {
    title: "Perfil do Empreendedor Brasileiro no SWFL",
    description: "Pesquisa interna com membros da BSWFCC sobre perfil, desafios, necessidades e oportunidades.",
    category: "Pesquisa",
    date: "Janeiro 2026",
    highlights: ["80+ membros pesquisados", "Top 5 desafios", "Ações prioritárias"],
  },
  {
    title: "Guia de Compliance — Empresa Brasileira na FL",
    description: "Orientações sobre registro de empresa, tributação, licenças, vistos de negócios, e compliance.",
    category: "Legal",
    date: "Dezembro 2025",
    highlights: ["LLC vs Corp", "Tributação FL", "Vistos E-2, L-1, EB-5"],
  },
  {
    title: "Análise Competitiva — Câmaras e Associações SWFL",
    description: "Mapeamento das câmaras de comércio e associações empresariais atuantes em Lee County.",
    category: "Estratégia",
    date: "Novembro 2025",
    highlights: ["8 câmaras mapeadas", "Diferencial BSWFCC", "Oportunidades de parceria"],
  },
];

const categoryVariant: Record<string, "gold" | "info" | "default" | "danger" | "success"> = {
  Mercado: "gold",
  Setorial: "info",
  Pesquisa: "default",
  Legal: "danger",
  Estratégia: "success",
};

export default async function InteligenciaPage() {
  const member = await getCurrentMember();
  if (!member) redirect("/login");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">Inteligência & Relatórios</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Relatórios estratégicos e análises de mercado
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {reports.map((report) => (
          <div
            key={report.title}
            className="bg-[#0D1B2A] border border-slate-700/50 rounded-xl p-5 hover:border-slate-600 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                  <FileText size={18} className="text-slate-500" strokeWidth={1.5} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={categoryVariant[report.category] || "default"}>
                      {report.category}
                    </Badge>
                    <span className="text-[11px] text-slate-500">{report.date}</span>
                  </div>
                  <h3 className="text-sm font-medium text-white mb-1">{report.title}</h3>
                  <p className="text-xs text-slate-500 mb-2">{report.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {report.highlights.map((h) => (
                      <span
                        key={h}
                        className="px-2 py-0.5 text-[10px] bg-slate-800/60 text-slate-400 rounded-md"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <span className="p-2 text-slate-600 flex-shrink-0" title="Disponível em breve">
                <Download size={16} />
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-[#0D1B2A] border border-slate-700/50 rounded-xl p-5 text-center">
        <p className="text-sm text-slate-400 mb-1">Novos relatórios são publicados mensalmente</p>
        <p className="text-xs text-slate-500">Relatórios disponíveis exclusivamente para membros ativos da BSWFCC</p>
      </div>
    </div>
  );
}
