import { getCurrentMember } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/utils";
import { Lock } from "lucide-react";
import { getReports } from "@/lib/actions/reports";
import ReportsManager from "@/components/admin/ReportsManager";

export default async function RelatoriosPage() {
  const member = await getCurrentMember();
  if (!member) redirect("/login");

  if (!isAdmin(member.role)) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Lock size={32} className="text-slate-600 mb-3" />
        <h2 className="text-lg font-medium text-corp-text mb-1">Acesso Restrito</h2>
        <p className="text-sm text-corp-muted">Somente administradores podem gerar relatórios.</p>
      </div>
    );
  }

  const reports = await getReports().catch(() => []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-corp-text">Relatórios</h1>
        <p className="text-sm text-corp-muted mt-0.5">
          Gere e exporte relatórios de membros, eventos e financeiro
        </p>
      </div>
      <ReportsManager reports={reports} />
    </div>
  );
}
