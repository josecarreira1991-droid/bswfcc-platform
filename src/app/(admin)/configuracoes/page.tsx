import { getCurrentMember } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import { Lock, Building2, Globe, Shield, Bell, Database, CreditCard, Mail, CheckCircle2, Clock, XCircle, ExternalLink } from "lucide-react";
import { isAdmin } from "@/lib/utils";

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

  const stripeConfigured = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bswfcc.quantrexnow.io";

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white">Configurações</h1>
        <p className="text-sm text-slate-500 mt-0.5">Configurações gerais da plataforma BSWFCC</p>
      </div>

      <div className="space-y-4">
        {/* Organization Info */}
        <div className="bg-[#0D1B2A] border border-slate-700/50 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Building2 size={16} className="text-gold" />
            <h3 className="text-sm font-medium text-white">Informações da Organização</h3>
          </div>
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

        {/* Platform Settings */}
        <div className="bg-[#0D1B2A] border border-slate-700/50 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Globe size={16} className="text-gold" />
            <h3 className="text-sm font-medium text-white">Plataforma</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">URL</p>
              <a href={appUrl} target="_blank" rel="noopener noreferrer" className="text-gold hover:text-light-gold flex items-center gap-1">
                {appUrl.replace("https://", "")}
                <ExternalLink size={11} />
              </a>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">Deploy</p>
              <p className="text-white">Vercel — Auto-deploy via GitHub</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">Banco de Dados</p>
              <p className="text-white">Supabase (Self-hosted)</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">Framework</p>
              <p className="text-white">Next.js 15 + React 19</p>
            </div>
          </div>
        </div>

        {/* Access & Security */}
        <div className="bg-[#0D1B2A] border border-slate-700/50 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={16} className="text-gold" />
            <h3 className="text-sm font-medium text-white">Acesso & Segurança</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-slate-800/50">
              <div>
                <p className="text-slate-300">Aprovação de Novos Membros</p>
                <p className="text-[10px] text-slate-600">Novos cadastros precisam de aprovação da diretoria</p>
              </div>
              <span className="px-2.5 py-1 text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">Ativo</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-800/50">
              <div>
                <p className="text-slate-300">Cadastro por Indicação</p>
                <p className="text-[10px] text-slate-600">Membros podem gerar códigos de indicação</p>
              </div>
              <span className="px-2.5 py-1 text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">Ativo</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-800/50">
              <div>
                <p className="text-slate-300">Autenticação</p>
                <p className="text-[10px] text-slate-600">Login via email + senha com Supabase Auth</p>
              </div>
              <span className="px-2.5 py-1 text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">Ativo</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-slate-300">Row Level Security (RLS)</p>
                <p className="text-[10px] text-slate-600">Proteção de dados por nível de acesso no banco</p>
              </div>
              <span className="px-2.5 py-1 text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">Ativo</span>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-[#0D1B2A] border border-slate-700/50 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={16} className="text-gold" />
            <h3 className="text-sm font-medium text-white">Notificações</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-slate-800/50">
              <div>
                <p className="text-slate-300">Novos Membros Pendentes</p>
                <p className="text-[10px] text-slate-600">Badge no sino do header quando há membros aguardando aprovação</p>
              </div>
              <span className="px-2.5 py-1 text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">Ativo</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-800/50">
              <div>
                <p className="text-slate-300">Polling de Mensagens (Chat)</p>
                <p className="text-[10px] text-slate-600">Novas mensagens verificadas a cada 15 segundos</p>
              </div>
              <span className="px-2.5 py-1 text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">Ativo</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-slate-300">Email Transacional</p>
                <p className="text-[10px] text-slate-600">Confirmação de cadastro, notificações de eventos</p>
              </div>
              <span className="px-2.5 py-1 text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">Pendente</span>
            </div>
          </div>
        </div>

        {/* Integrations Status */}
        <div className="bg-[#0D1B2A] border border-slate-700/50 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Database size={16} className="text-gold" />
            <h3 className="text-sm font-medium text-white">Status das Integrações</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-slate-800/50">
              <div className="flex items-center gap-2">
                <Database size={14} className="text-slate-500" />
                <div>
                  <span className="text-sm text-slate-300">Supabase</span>
                  <p className="text-[10px] text-slate-600">Banco de dados, autenticação e storage</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span className="text-xs text-emerald-400">Conectado</span>
              </div>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-800/50">
              <div className="flex items-center gap-2">
                <CreditCard size={14} className="text-slate-500" />
                <div>
                  <span className="text-sm text-slate-300">Stripe</span>
                  <p className="text-[10px] text-slate-600">Pagamentos e assinaturas</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {stripeConfigured ? (
                  <>
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    <span className="text-xs text-emerald-400">Configurado</span>
                  </>
                ) : (
                  <>
                    <Clock size={14} className="text-amber-400" />
                    <span className="text-xs text-amber-400">Pendente</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-800/50">
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-slate-500" />
                <div>
                  <span className="text-sm text-slate-300">Email (SMTP)</span>
                  <p className="text-[10px] text-slate-600">Notificações por email</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-amber-400" />
                <span className="text-xs text-amber-400">Pendente</span>
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Globe size={14} className="text-slate-500" />
                <div>
                  <span className="text-sm text-slate-300">Vercel</span>
                  <p className="text-[10px] text-slate-600">Hosting e deploy automático</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span className="text-xs text-emerald-400">Conectado</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
