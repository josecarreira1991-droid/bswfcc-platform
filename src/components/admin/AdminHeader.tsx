"use client";

import { usePathname } from "next/navigation";
import { Menu, Bell } from "lucide-react";
import Link from "next/link";

const BREADCRUMB_MAP: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/inbox": "Inbox",
  "/membros": "Membros",
  "/eventos": "Eventos",
  "/mercado": "Dados de Mercado",
  "/inteligencia": "Inteligência",
  "/diretoria-admin": "Diretoria",
  "/configuracoes": "Configurações",
  "/perfil": "Meu Perfil",
};

interface AdminHeaderProps {
  onMenuClick: () => void;
  pendingCount?: number;
}

export default function AdminHeader({ onMenuClick, pendingCount = 0 }: AdminHeaderProps) {
  const pathname = usePathname();
  const pageTitle = BREADCRUMB_MAP[pathname] || "BSWFCC";

  return (
    <header className="h-16 bg-[#0D1B2A]/80 backdrop-blur-md border-b border-slate-700/50 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors"
        >
          <Menu size={20} />
        </button>

        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-sm">
          <Link href="/dashboard" className="text-slate-500 hover:text-slate-300 transition-colors">
            BSWFCC
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-white font-medium">{pageTitle}</span>
        </nav>
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button className="relative p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
          <Bell size={18} strokeWidth={1.8} />
          {pendingCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 rounded-full text-[10px] font-bold text-navy flex items-center justify-center">
              {pendingCount > 9 ? "9+" : pendingCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
