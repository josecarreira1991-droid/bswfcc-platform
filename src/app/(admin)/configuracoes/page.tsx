import { getCurrentMember } from "@/lib/actions/auth";
import { getBotConfig } from "@/lib/actions/bot-config";
import { redirect } from "next/navigation";
import { Lock } from "lucide-react";
import { isAdmin } from "@/lib/utils";
import IntegrationsPanel from "@/components/admin/IntegrationsPanel";
import BotConfigPanel from "@/components/admin/BotConfigPanel";

export default async function ConfiguracoesPage() {
  const member = await getCurrentMember();
  if (!member) redirect("/login");

  if (!isAdmin(member.role)) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Lock size={32} className="text-slate-600 mb-3" />
        <h2 className="text-lg font-medium text-white mb-1">Acesso Restrito</h2>
        <p className="text-sm text-slate-500">Somente administradores podem acessar esta página.</p>
      </div>
    );
  }

  const botConfig = await getBotConfig().catch(() => null);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white">Configurações</h1>
        <p className="text-sm text-slate-500 mt-0.5">Configurações do sistema BSWFCC</p>
      </div>

      <div className="space-y-4">
        {/* Organization Info */}
        <div className="bg-[#0D1B2A] border border-slate-700/50 rounded-xl p-5">
          <h3 className="text-sm font-medium text-white mb-3">Informações da Organização</h3>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">Nome</p>
              <p className="text-white">Brazilian SouthWest Florida Chamber of Commerce</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">EIN</p>
              <p className="text-white">99-4852466</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">Status</p>
              <p className="text-white">501(c)(6) — Not For Profit</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">Registro</p>
              <p className="text-white">Setembro 2024 — Florida</p>
            </div>
          </div>
        </div>

        {/* Bot Configuration */}
        <BotConfigPanel config={botConfig} />

        {/* Integrations (live status + WhatsApp QR) */}
        <IntegrationsPanel />
      </div>
    </div>
  );
}
