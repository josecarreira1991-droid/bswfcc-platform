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
        <Lock size={32} className="text-corp-muted mb-3" />
        <h2 className="text-lg font-medium text-corp-text mb-1">Acesso Restrito</h2>
        <p className="text-sm text-corp-muted">Somente administradores podem acessar esta página.</p>
      </div>
    );
  }

  const stripeConfigured = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bswfcc.quantrexnow.io";

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-corp-text">Configurações</h1>
        <p className="text-sm text-corp-muted mt-0.5">Configurações gerais da plataforma BSWFCC</p>
      </div>

      <div className="space-y-4">
        {/* Organization Info */}
        <div className="bg-corp-card border border-corp-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Building2 size={16} className="text-accent" />
            <h3 className="text-sm font-medium text-corp-text">Informações da Organização</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[11px] text-corp-muted uppercase tracking-wider mb-1">Nome</p>
              <p className="text-corp-text">Brazilian SouthWest Florida Chamber of Commerce</p>
            </div>
            <div>
              <p className="text-[11px] text-corp-muted uppercase tracking-wider mb-1">EIN</p>
              <p className="text-corp-text">99-4852466</p>
            </div>
            <div>
              <p className="text-[11px] text-corp-muted uppercase tracking-wider mb-1">Status</p>
              <p className="text-corp-text">501(c)(6) — Not For Profit</p>
            </div>
            <div>
              <p className="text-[11px] text-corp-muted uppercase tracking-wider mb-1">Registro</p>
              <p className="text-corp-text">Setembro 2024 — Florida</p>
            </div>
          </div>
        </div>

        {/* Platform Settings */}
        <div className="bg-corp-card border border-corp-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Globe size={16} className="text-accent" />
            <h3 className="text-sm font-medium text-corp-text">Plataforma</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[11px] text-corp-muted uppercase tracking-wider mb-1">URL</p>
              <a href={appUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent-light flex items-center gap-1">
                {appUrl.replace("https://", "")}
                <ExternalLink size={11} />
              </a>
            </div>
            <div>
              <p className="text-[11px] text-corp-muted uppercase tracking-wider mb-1">Deploy</p>
              <p className="text-corp-text">Vercel — Auto-deploy via GitHub</p>
            </div>
            <div>
              <p className="text-[11px] text-corp-muted uppercase tracking-wider mb-1">Banco de Dados</p>
              <p className="text-corp-text">Supabase (Self-hosted)</p>
            </div>
            <div>
              <p className="text-[11px] text-corp-muted uppercase tracking-wider mb-1">Framework</p>
              <p className="text-corp-text">Next.js 15 + React 19</p>
            </div>
          </div>
        </div>

        {/* Access & Security */}
        <div className="bg-corp-card border border-corp-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={16} className="text-accent" />
            <h3 className="text-sm font-medium text-corp-text">Acesso & Segurança</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-corp-border">
              <div>
                <p className="text-corp-text">Aprovação de Novos Membros</p>
                <p className="text-[10px] text-corp-muted">Novos cadastros precisam de aprovação da diretoria</p>
              </div>
              <span className="px-2.5 py-1 text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 rounded-full">Ativo</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-corp-border">
              <div>
                <p className="text-corp-text">Cadastro por Indicação</p>
                <p className="text-[10px] text-corp-muted">Membros podem gerar códigos de indicação</p>
              </div>
              <span className="px-2.5 py-1 text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 rounded-full">Ativo</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-corp-border">
              <div>
                <p className="text-corp-text">Autenticação</p>
                <p className="text-[10px] text-corp-muted">Login via email + senha com Supabase Auth</p>
              </div>
              <span className="px-2.5 py-1 text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 rounded-full">Ativo</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-corp-text">Row Level Security (RLS)</p>
                <p className="text-[10px] text-corp-muted">Proteção de dados por nível de acesso no banco</p>
              </div>
              <span className="px-2.5 py-1 text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 rounded-full">Ativo</span>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-corp-card border border-corp-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={16} className="text-accent" />
            <h3 className="text-sm font-medium text-corp-text">Notificações</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-corp-border">
              <div>
                <p className="text-corp-text">Novos Membros Pendentes</p>
                <p className="text-[10px] text-corp-muted">Badge no sino do header quando há membros aguardando aprovação</p>
              </div>
              <span className="px-2.5 py-1 text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 rounded-full">Ativo</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-corp-border">
              <div>
                <p className="text-corp-text">Polling de Mensagens (Chat)</p>
                <p className="text-[10px] text-corp-muted">Novas mensagens verificadas a cada 15 segundos</p>
              </div>
              <span className="px-2.5 py-1 text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 rounded-full">Ativo</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-corp-text">Email Transacional</p>
                <p className="text-[10px] text-corp-muted">Confirmação de cadastro, notificações de eventos</p>
              </div>
              <span className="px-2.5 py-1 text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/15 rounded-full">Pendente</span>
            </div>
          </div>
        </div>

        {/* Integrations Status */}
        <div className="bg-corp-card border border-corp-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Database size={16} className="text-accent" />
            <h3 className="text-sm font-medium text-corp-text">Status das Integrações</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-corp-border">
              <div className="flex items-center gap-2">
                <Database size={14} className="text-corp-muted" />
                <div>
                  <span className="text-sm text-corp-text">Supabase</span>
                  <p className="text-[10px] text-corp-muted">Banco de dados, autenticação e storage</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span className="text-xs text-emerald-400">Conectado</span>
              </div>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-corp-border">
              <div className="flex items-center gap-2">
                <CreditCard size={14} className="text-corp-muted" />
                <div>
                  <span className="text-sm text-corp-text">Stripe</span>
                  <p className="text-[10px] text-corp-muted">Pagamentos e assinaturas</p>
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

            <div className="flex items-center justify-between py-2 border-b border-corp-border">
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-corp-muted" />
                <div>
                  <span className="text-sm text-corp-text">Email (SMTP)</span>
                  <p className="text-[10px] text-corp-muted">Notificações por email</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-amber-400" />
                <span className="text-xs text-amber-400">Pendente</span>
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Globe size={14} className="text-corp-muted" />
                <div>
                  <span className="text-sm text-corp-text">Vercel</span>
                  <p className="text-[10px] text-corp-muted">Hosting e deploy automático</p>
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
