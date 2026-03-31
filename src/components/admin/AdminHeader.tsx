"use client";

import { usePathname } from "next/navigation";
import { Menu, Bell, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const BREADCRUMB_MAP: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/chat": "Chat",
  "/grupo": "Grupo",
  "/mural": "Mural",
  "/workspace": "Workspace",
  "/membros": "Membros",
  "/eventos": "Eventos",
  "/mercado": "Dados de Mercado",
  "/inteligencia": "Inteligência",
  "/matchmaking": "Matchmaking",
  "/networking": "Networking AI",
  "/documentos": "Documentos",
  "/referrals": "Indicações",
  "/votacoes": "Votações",
  "/billing": "Billing",
  "/relatorios": "Relatórios",
  "/diretoria-admin": "Diretoria",
  "/ferramentas": "Ferramentas",
  "/configuracoes": "Configurações",
  "/perfil": "Meu Perfil",
};

interface AdminHeaderProps {
  onMenuClick: () => void;
  pendingCount?: number;
}

export default function AdminHeader({ onMenuClick, pendingCount = 0 }: AdminHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const pageTitle = BREADCRUMB_MAP[pathname] || "BSWFCC";

  return (
    <header className="h-14 bg-dark-navy/80 backdrop-blur-xl border-b border-corp-border flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-corp-muted hover:text-corp-text p-1.5 rounded-lg hover:bg-white/[0.03] transition-colors"
        >
          <Menu size={20} />
        </button>
        <nav className="flex items-center gap-1.5 text-sm">
          <Link href="/dashboard" className="text-corp-muted hover:text-accent transition-colors">
            BSWFCC
          </Link>
          <span className="text-corp-subtle">/</span>
          <span className="text-corp-text font-medium">{pageTitle}</span>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-corp-muted" />
          <input
            type="text"
            placeholder="Buscar..."
            className="pl-9 pr-4 py-1.5 text-xs bg-white/[0.03] border border-corp-border rounded-lg text-corp-text placeholder-corp-muted focus:border-accent/30 focus:outline-none w-48 transition-colors"
          />
        </div>
        <button
          onClick={() => pendingCount > 0 ? router.push("/membros") : null}
          className={`relative p-2 rounded-lg transition-colors ${pendingCount > 0 ? "text-amber-400 hover:bg-amber-500/10 cursor-pointer" : "text-corp-muted cursor-default"}`}
          title={pendingCount > 0 ? `${pendingCount} pendente${pendingCount > 1 ? "s" : ""}` : "Nenhuma notificação"}
        >
          <Bell size={16} strokeWidth={1.6} />
          {pendingCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-accent rounded-full text-[9px] font-bold text-white flex items-center justify-center">
              {pendingCount > 9 ? "9+" : pendingCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
