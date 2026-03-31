"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  FileText, Users, Calendar, CreditCard, BarChart3,
  Download, RefreshCw, Clock,
} from "lucide-react";
import { generateMembersReport, generateEventsReport, generateFinancialReport } from "@/lib/actions/reports";
import { cn } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import type { Report } from "@/types/database";

const typeConfig: Record<string, { icon: typeof FileText; label: string; variant: "gold" | "info" | "success" | "default" }> = {
  members: { icon: Users, label: "Membros", variant: "gold" },
  events: { icon: Calendar, label: "Eventos", variant: "info" },
  financial: { icon: CreditCard, label: "Financeiro", variant: "success" },
  market: { icon: BarChart3, label: "Mercado", variant: "default" },
  monthly: { icon: FileText, label: "Mensal", variant: "default" },
};

interface ReportsManagerProps {
  reports: Report[];
}

export default function ReportsManager({ reports }: ReportsManagerProps) {
  const router = useRouter();
  const [generating, setGenerating] = useState<string | null>(null);

  async function handleGenerate(type: string) {
    setGenerating(type);
    try {
      let report: Report;
      switch (type) {
        case "members":
          report = await generateMembersReport();
          break;
        case "events":
          report = await generateEventsReport();
          break;
        case "financial":
          report = await generateFinancialReport();
          break;
        default:
          throw new Error("Tipo inválido");
      }
      toast.success(`Relatório gerado: ${report.title}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao gerar relatório");
    }
    setGenerating(null);
  }

  function exportReportCSV(report: Report) {
    const data = report.data as Record<string, unknown>;
    const lines: string[] = [`Relatório: ${report.title}`, `Gerado em: ${new Date(report.created_at).toLocaleString("pt-BR")}`, ""];

    function flatten(obj: Record<string, unknown>, prefix = "") {
      for (const [key, val] of Object.entries(obj)) {
        const label = prefix ? `${prefix} > ${key}` : key;
        if (typeof val === "object" && val !== null && !Array.isArray(val)) {
          flatten(val as Record<string, unknown>, label);
        } else {
          lines.push(`"${label}","${String(val)}"`);
        }
      }
    }

    flatten(data);

    const csv = lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.type}-${report.created_at.split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 100);
    toast.success("CSV exportado");
  }

  return (
    <div className="space-y-6">
      {/* Generate buttons */}
      <div className="bg-corp-card border border-corp-border rounded-xl p-5">
        <h3 className="text-sm font-medium text-corp-muted mb-3">Gerar Novo Relatório</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { type: "members", label: "Relatório de Membros", desc: "Status, cargos, indústrias, crescimento", icon: Users },
            { type: "events", label: "Relatório de Eventos", desc: "Participação, tipos, métricas", icon: Calendar },
            { type: "financial", label: "Relatório Financeiro", desc: "MRR, receita, assinaturas", icon: CreditCard },
          ].map((item) => (
            <button
              key={item.type}
              onClick={() => handleGenerate(item.type)}
              disabled={generating === item.type}
              className="flex items-start gap-3 p-4 bg-white/[0.03] border border-corp-border rounded-xl text-left hover:border-accent/30 transition-colors disabled:opacity-50"
            >
              <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                {generating === item.type ? (
                  <RefreshCw size={16} className="text-accent animate-spin" />
                ) : (
                  <item.icon size={16} className="text-accent" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-corp-text">{item.label}</p>
                <p className="text-[11px] text-corp-muted mt-0.5">{item.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Reports List */}
      <div>
        <h3 className="text-sm font-medium text-corp-muted mb-3">Relatórios Gerados</h3>
        {reports.length > 0 ? (
          <div className="space-y-2">
            {reports.map((report) => {
              const config = typeConfig[report.type] || typeConfig.monthly;
              const Icon = config.icon;
              const data = report.data as Record<string, unknown>;

              return (
                <div
                  key={report.id}
                  className="bg-corp-card border border-corp-border rounded-xl p-4 flex items-center justify-between hover:border-accent/20 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-white/[0.03] flex items-center justify-center flex-shrink-0">
                      <Icon size={18} className="text-corp-muted" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <Badge variant={config.variant}>{config.label}</Badge>
                        <span className="text-[10px] text-corp-muted flex items-center gap-1">
                          <Clock size={9} />
                          {new Date(report.created_at).toLocaleString("pt-BR")}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-corp-text truncate">{report.title}</p>
                      {/* Quick stats */}
                      <div className="flex items-center gap-3 mt-1">
                        {data.total !== undefined && (
                          <span className="text-[10px] text-corp-muted">Total: {String(data.total)}</span>
                        )}
                        {data.mrr !== undefined && (
                          <span className="text-[10px] text-corp-muted">MRR: ${Number(data.mrr) / 100}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => exportReportCSV(report)}
                    className="p-2 text-corp-muted hover:text-accent hover:bg-accent/10 rounded-lg transition-colors flex-shrink-0"
                    title="Exportar CSV"
                  >
                    <Download size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-corp-card border border-corp-border rounded-xl p-12 text-center">
            <FileText size={32} className="text-corp-muted/30 mx-auto mb-3" />
            <p className="text-sm text-corp-muted">Nenhum relatório gerado ainda</p>
            <p className="text-[11px] text-corp-muted mt-1">Use os botões acima para gerar seu primeiro relatório</p>
          </div>
        )}
      </div>
    </div>
  );
}
