"use client";

import { usePathname } from "next/navigation";
import { Menu, Bell } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const BREADCRUMB_MAP: Record<string, string> = {
  "/dashboard": "Dashboard", "/chat": "Chat", "/grupo": "Grupo", "/mural": "Mural",
  "/workspace": "Workspace", "/membros": "Membros", "/eventos": "Eventos",
  "/mercado": "Dados de Mercado", "/inteligencia": "Inteligência", "/matchmaking": "Matchmaking",
  "/networking": "Networking AI", "/documentos": "Documentos", "/referrals": "Indicações",
  "/votacoes": "Votações", "/billing": "Billing", "/relatorios": "Relatórios",
  "/diretoria-admin": "Diretoria", "/ferramentas": "Ferramentas",
  "/configuracoes": "Configurações", "/perfil": "Meu Perfil",
};

interface AdminHeaderProps { onMenuClick: () => void; pendingCount?: number; }

export default function AdminHeader({ onMenuClick, pendingCount = 0 }: AdminHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const pageTitle = BREADCRUMB_MAP[pathname] || "BSWFCC";

  return (
    <header className="h-12 bg-gradient-to-b from-[#F0F3F8] to-[#E4E8EF] border-b border-corp-border flex items-center justify-between px-4 sm:px-5 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="lg:hidden text-corp-muted hover:text-corp-text p-1 rounded">
          <Menu size={18} />
        </button>
        <nav className="flex items-center gap-1.5 text-[13px]">
          <Link href="/dashboard" className="text-corp-muted hover:text-accent transition-colors">BSWFCC</Link>
          <span className="text-corp-border">&rsaquo;</span>
          <span className="text-corp-text font-semibold">{pageTitle}</span>
        </nav>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => pendingCount > 0 ? router.push("/membros") : null}
          className={`relative p-1.5 rounded transition-colors ${pendingCount > 0 ? "text-amber-600 hover:bg-amber-100 cursor-pointer" : "text-corp-subtle cursor-default"}`}
          title={pendingCount > 0 ? `${pendingCount} pendente${pendingCount > 1 ? "s" : ""}` : "Nenhuma notificação"}
        >
          <Bell size={16} strokeWidth={1.6} />
          {pendingCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
              {pendingCount > 9 ? "9+" : pendingCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
