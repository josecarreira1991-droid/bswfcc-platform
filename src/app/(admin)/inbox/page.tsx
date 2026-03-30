import { getCurrentMember } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/utils";
import { Lock, MessageCircle, Wifi, WifiOff } from "lucide-react";
import InboxChat from "@/components/admin/InboxChat";
import BroadcastPanel from "@/components/admin/BroadcastPanel";
import { getConversations, getTemplates } from "@/lib/actions/messaging";

export default async function InboxPage() {
  const member = await getCurrentMember();
  if (!member) redirect("/login");

  if (!isAdmin(member.role)) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Lock size={32} className="text-slate-600 mb-3" />
        <h2 className="text-lg font-medium text-white mb-1">Acesso Restrito</h2>
        <p className="text-sm text-slate-500">Somente administradores podem acessar o Inbox.</p>
      </div>
    );
  }

  let conversations: Awaited<ReturnType<typeof getConversations>> = [];
  let templates: Awaited<ReturnType<typeof getTemplates>> = [];
  let wahaConnected = false;

  try {
    [conversations, templates] = await Promise.all([
      getConversations("open").catch(() => []),
      getTemplates().catch(() => []),
    ]);
  } catch {
    // Tables might not exist yet — that's OK
  }

  // Check Waha status (non-blocking)
  try {
    const res = await fetch(`${process.env.WAHA_API_URL || "http://187.77.210.204:3001"}/api/sessions/bswfcc`, {
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const data = await res.json();
      wahaConnected = data.status === "WORKING" || data.status === "connected";
    }
  } catch {
    // Waha not running or unreachable — expected before setup
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold text-white">Inbox</h1>
          <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-2">
            Conversas WhatsApp com membros
            <span className={`flex items-center gap-1 text-[11px] ${wahaConnected ? "text-emerald-400" : "text-slate-600"}`}>
              {wahaConnected ? <Wifi size={11} /> : <WifiOff size={11} />}
              {wahaConnected ? "Conectado" : "Desconectado"}
            </span>
          </p>
        </div>
        <BroadcastPanel templates={templates} />
      </div>

      {/* Chat Interface */}
      <InboxChat conversations={conversations} />

      {/* Setup hint when not connected */}
      {!wahaConnected && conversations.length === 0 && (
        <div className="mt-4 bg-[#0D1B2A] border border-amber-500/20 rounded-xl p-5">
          <h3 className="text-sm font-medium text-amber-400 mb-2">WhatsApp não conectado</h3>
          <div className="text-xs text-slate-400 space-y-1.5">
            <p>Para ativar o Inbox, configure o Waha na VPS (187.77.210.204):</p>
            <ol className="list-decimal list-inside space-y-1 text-slate-500">
              <li>Execute o setup: <code className="text-slate-300 bg-slate-800/60 px-1.5 py-0.5 rounded">bash deploy/setup-waha.sh</code></li>
              <li>Configure as env vars: WAHA_API_URL, WAHA_API_KEY</li>
              <li>Escaneie o QR code na página de Configurações</li>
              <li>O número WhatsApp Business da câmara precisa ser fornecido pela diretoria</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
