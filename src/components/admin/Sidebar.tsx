"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn, ROLE_LABELS } from "@/lib/utils";
import {
  LayoutDashboard, Users, Calendar, BarChart3, FileText, Shield,
  Settings, User, LogOut, X, MessageSquare, Users2, CreditCard,
  ClipboardList, Handshake, FolderOpen, UserPlus, Vote, Sparkles,
  Briefcase, Newspaper, Wrench,
} from "lucide-react";
import { logout } from "@/lib/actions/auth";
import type { Member } from "@/types/database";

const mainMenu = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Chat", href: "/chat", icon: MessageSquare },
  { label: "Grupo", href: "/grupo", icon: Users2 },
  { label: "Mural", href: "/mural", icon: Newspaper },
  { label: "Workspace", href: "/workspace", icon: Briefcase },
  { label: "Membros", href: "/membros", icon: Users },
  { label: "Eventos", href: "/eventos", icon: Calendar },
  { label: "Mercado", href: "/mercado", icon: BarChart3 },
  { label: "Inteligência", href: "/inteligencia", icon: FileText },
  { label: "Matchmaking", href: "/matchmaking", icon: Handshake },
  { label: "Networking AI", href: "/networking", icon: Sparkles },
  { label: "Documentos", href: "/documentos", icon: FolderOpen },
  { label: "Indicações", href: "/referrals", icon: UserPlus },
  { label: "Votações", href: "/votacoes", icon: Vote },
  { label: "Billing", href: "/billing", icon: CreditCard },
  { label: "Relatórios", href: "/relatorios", icon: ClipboardList },
  { label: "Diretoria", href: "/diretoria-admin", icon: Shield },
];

const secondaryMenu = [
  { label: "Ferramentas", href: "/ferramentas", icon: Wrench },
  { label: "Configurações", href: "/configuracoes", icon: Settings },
  { label: "Meu Perfil", href: "/perfil", icon: User },
];

type MenuItem = (typeof mainMenu)[number];

interface SidebarProps {
  member: Member;
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ member, open, onClose }: SidebarProps) {
  const pathname = usePathname();

  function renderMenuItems(items: MenuItem[], matchSubRoutes: boolean) {
    return items.map((item) => {
      const isActive = pathname === item.href
        || (matchSubRoutes && pathname.startsWith(item.href + "/"));
      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={onClose}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded text-[13px] font-medium transition-all",
            isActive
              ? "bg-accent text-white shadow-retro"
              : "text-corp-muted hover:text-corp-text hover:bg-black/[0.04]"
          )}
        >
          <item.icon size={16} strokeWidth={1.6} />
          {item.label}
        </Link>
      );
    });
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen w-[220px] bg-gradient-to-b from-[#E8EDF3] to-[#D8DEE8] border-r border-corp-border flex flex-col transition-transform duration-200",
          "lg:translate-x-0 lg:static lg:z-auto",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-14 flex items-center justify-between px-4 border-b border-corp-border bg-gradient-to-r from-accent to-accent-light">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-white/20 flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <div>
              <span className="font-bold text-white text-sm">BSWFCC</span>
              <span className="block text-[9px] text-white/70 -mt-0.5">Chamber of Commerce</span>
            </div>
          </Link>
          <button onClick={onClose} className="lg:hidden text-white/70 hover:text-white">
            <X size={16} />
          </button>
        </div>

        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          <p className="px-3 text-[10px] font-bold text-corp-subtle uppercase tracking-wider mb-2">
            Principal
          </p>
          {renderMenuItems(mainMenu, true)}
          <div className="my-3 border-t border-corp-border" />
          <p className="px-3 text-[10px] font-bold text-corp-subtle uppercase tracking-wider mb-2">
            Sistema
          </p>
          {renderMenuItems(secondaryMenu, false)}
        </nav>

        <div className="px-3 py-3 border-t border-corp-border bg-[#DEE3EC]">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded bg-accent/15 flex items-center justify-center flex-shrink-0">
              <span className="text-accent font-bold text-[10px]">
                {member.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-corp-text truncate">{member.full_name}</p>
              <p className="text-[10px] text-corp-subtle truncate">{ROLE_LABELS[member.role] || member.role}</p>
            </div>
          </div>
          <form action={logout}>
            <button type="submit" className="flex items-center gap-2 w-full px-2 py-1.5 text-xs text-corp-muted hover:text-red-600 rounded transition-colors">
              <LogOut size={13} strokeWidth={1.6} /> Sair
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
