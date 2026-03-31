"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn, ROLE_LABELS } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Calendar,
  BarChart3,
  FileText,
  Shield,
  Settings,
  User,
  LogOut,
  X,
  MessageSquare,
  Users2,
  CreditCard,
  ClipboardList,
  Handshake,
  FolderOpen,
  UserPlus,
  Vote,
  Sparkles,
  Briefcase,
  Newspaper,
  Wrench,
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

const ACTIVE_CLASS = "bg-white/10 text-white border-l-2 border-gold";
const INACTIVE_CLASS = "text-slate-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent";

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
            "flex items-center gap-3 px-3 py-2 rounded-r-lg text-sm font-medium transition-all",
            isActive ? ACTIVE_CLASS : INACTIVE_CLASS
          )}
        >
          <item.icon size={18} strokeWidth={1.8} />
          {item.label}
        </Link>
      );
    });
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen w-[260px] bg-dark-navy flex flex-col transition-transform duration-200",
          "lg:translate-x-0 lg:static lg:z-auto",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-white/10">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gold/20 flex items-center justify-center">
              <span className="text-gold font-bold text-sm">B</span>
            </div>
            <div>
              <span className="font-semibold text-white text-sm tracking-wide">BSWFCC</span>
              <span className="block text-[10px] text-slate-400 -mt-0.5">Chamber of Commerce</span>
            </div>
          </Link>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
          <p className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">
            Principal
          </p>
          {renderMenuItems(mainMenu, true)}

          <div className="my-4 border-t border-white/10" />

          <p className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">
            Sistema
          </p>
          {renderMenuItems(secondaryMenu, false)}
        </nav>

        {/* User footer */}
        <div className="px-3 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-navy flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-xs">
                {member.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {member.full_name}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {ROLE_LABELS[member.role] || member.role}
              </p>
            </div>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <LogOut size={16} strokeWidth={1.8} />
              Sair
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
