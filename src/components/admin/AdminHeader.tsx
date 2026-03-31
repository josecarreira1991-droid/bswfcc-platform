"use client";

import { usePathname } from "next/navigation";
import { Menu, Bell } from "lucide-react";
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
    <header className="h-14 bg-white border-b border-corp-border flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-corp-muted hover:text-corp-text p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <Menu size={20} />
        </button>

        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-sm">
          <Link href="/dashboard" className="text-corp-muted hover:text-navy transition-colors">
            BSWFCC
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-corp-text font-medium">{pageTitle}</span>
        </nav>
      </div>

      <div className="flex items-center gap-2">
        {/* Pending members alert */}
        <button
          onClick={() => pendingCount > 0 ? router.push("/membros") : null}
          className={`relative p-2 rounded-lg transition-colors ${pendingCount > 0 ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50 cursor-pointer" : "text-slate-400 cursor-default"}`}
          title={pendingCount > 0 ? `${pendingCount} membro${pendingCount > 1 ? "s" : ""} pendente${pendingCount > 1 ? "s" : ""} de aprovação` : "Nenhuma notificação"}
        >
          <Bell size={18} strokeWidth={1.8} />
          {pendingCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
              {pendingCount > 9 ? "9+" : pendingCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
