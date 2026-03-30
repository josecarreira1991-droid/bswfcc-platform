"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  UserPlus,
  Copy,
  Check,
  Crown,
  TrendingUp,
  Users,
  ArrowRight,
  Link2,
  ChevronDown,
  ChevronRight,
  Building2,
  Mail,
  Phone,
  X,
  ExternalLink,
} from "lucide-react";
import { createReferral, updateReferralStatus, generateReferralCode } from "@/lib/actions/referrals";
import { cn } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import type { Member } from "@/types/database";

const statusVariant: Record<string, "warning" | "info" | "success" | "gold" | "danger"> = {
  pending: "warning", contacted: "info", registered: "gold", active: "success", declined: "danger",
};
const statusLabel: Record<string, string> = {
  pending: "Pendente", contacted: "Contactado", registered: "Registrado", active: "Ativo", declined: "Recusado",
  ativo: "Ativo", pendente: "Pendente", inativo: "Inativo",
};

interface ReferralTreeItem {
  id: string;
  full_name: string;
  company: string | null;
  referral_count: number;
  referred: Array<{ id: string; full_name: string; company: string | null; created_at: string }>;
}

interface ReferralStats {
  totalCodes: number;
  totalUsed: number;
  conversionRate: number;
  topReferrers: Array<{ id: string; full_name: string; company: string | null; count: number }>;
  recentReferrals: Array<{ referrer: string; referred: string; date: string }>;
}

interface MyReferral {
  id: string;
  full_name: string;
  company: string | null;
  status: string;
  created_at: string;
}

interface ReferralsViewProps {
  referrals: Array<{
    id: string; referred_name: string; referred_email: string | null; referred_phone: string | null;
    referred_company: string | null; status: string; notes: string | null; created_at: string;
    members: { full_name: string; company: string | null } | null;
  }>;
  currentMember: Member;
  isAdmin: boolean;
  myCode?: string | null;
  stats?: ReferralStats;
  tree?: ReferralTreeItem[];
  myReferrals?: MyReferral[];
}

export default function ReferralsView({ referrals, currentMember, isAdmin, myCode, stats, tree, myReferrals }: ReferralsViewProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expandedTree, setExpandedTree] = useState<Set<string>>(new Set());
  const [generatingCode, setGeneratingCode] = useState(false);

  const appUrl = typeof window !== "undefined" ? window.location.origin : "https://bswfcc.quantrexnow.io";
  const shareUrl = myCode ? `${appUrl}/convite/${myCode}` : null;

  function copyCode() {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copiado!");
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function copyCodeOnly() {
    if (myCode) {
      navigator.clipboard.writeText(myCode);
      toast.success("Código copiado!");
    }
  }

  async function handleGenerateCode() {
    setGeneratingCode(true);
    const result = await generateReferralCode(currentMember.id);
    if ("error" in result) {
      toast.error(result.error);
    } else {
      toast.success("Novo código gerado!");
      router.refresh();
    }
    setGeneratingCode(false);
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const result = await createReferral(currentMember.id, form);
    if (result?.error) toast.error(result.error);
    else { toast.success("Indicação registrada"); setShowForm(false); router.refresh(); }
    setLoading(false);
  }

  async function handleStatus(id: string, status: "pending" | "contacted" | "registered" | "active" | "declined") {
    const result = await updateReferralStatus(id, status);
    if (result?.error) toast.error(result.error);
    else { toast.success("Status atualizado"); router.refresh(); }
  }

  function toggleTree(id: string) {
    const next = new Set(expandedTree);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedTree(next);
  }

  const activeCount = referrals.filter((r) => r.status === "active").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">Indicações</h1>
          <p className="text-sm text-slate-500 mt-0.5">Sistema de convite e referral da BSWFCC</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gold text-navy rounded-lg hover:bg-light-gold transition-colors">
          <UserPlus size={16} /> Indicar Membro
        </button>
      </div>

      {/* My Referral Code Section — for all members */}
      <div className="bg-[#0D1B2A] border border-slate-700/50 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Link2 size={16} className="text-gold" />
            Seu Código de Indicação
          </h2>
          <button
            onClick={handleGenerateCode}
            disabled={generatingCode}
            className="px-3 py-1.5 text-xs font-medium bg-gold/10 text-gold border border-gold/20 rounded-lg hover:bg-gold/20 transition-colors disabled:opacity-50"
          >
            {generatingCode ? "Gerando..." : myCode ? "Gerar Novo" : "Gerar Código"}
          </button>
        </div>

        {myCode ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-navy/60 border border-gold/20 rounded-lg px-4 py-3 font-mono text-lg text-gold tracking-widest text-center">
                {myCode}
              </div>
              <button
                onClick={copyCodeOnly}
                className="px-3 py-3 bg-gold/10 text-gold border border-gold/20 rounded-lg hover:bg-gold/20 transition-colors"
                title="Copiar código"
              >
                <Copy size={18} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl || ""}
                className="flex-1 px-3 py-2 text-xs bg-navy/60 border border-slate-700/50 rounded-lg text-slate-400 truncate"
              />
              <button
                onClick={copyCode}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-gold text-navy rounded-lg hover:bg-light-gold transition-colors"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copiado!" : "Copiar Link"}
              </button>
            </div>
            <p className="text-[10px] text-slate-500">
              Compartilhe este link com empresários que desejam se tornar membros. Após cada uso, um novo código será gerado automaticamente.
            </p>
          </div>
        ) : (
          <p className="text-sm text-slate-400">
            Você ainda não tem um código de indicação. Clique em &quot;Gerar Código&quot; para criar o seu.
          </p>
        )}
      </div>

      {/* My Referrals Section */}
      {myReferrals && myReferrals.length > 0 && (
        <div className="bg-[#0D1B2A] border border-slate-700/50 rounded-xl overflow-hidden mb-6">
          <div className="px-4 py-3 border-b border-slate-700/50">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Users size={16} className="text-gold" />
              Suas Indicações ({myReferrals.length})
            </h2>
          </div>
          <div className="divide-y divide-slate-800/50">
            {myReferrals.map((r) => (
              <div key={r.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{r.full_name}</p>
                  {r.company && <p className="text-[11px] text-slate-500">{r.company}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={r.status === "ativo" ? "success" : r.status === "pendente" ? "warning" : "danger"}>
                    {statusLabel[r.status] || r.status}
                  </Badge>
                  <span className="text-[10px] text-slate-500">
                    {new Date(r.created_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Admin Stats Section */}
      {isAdmin && stats && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-[#0D1B2A] border border-slate-700/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                  <Link2 size={16} className="text-gold" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{stats.totalCodes}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Total Códigos</p>
            </div>
            <div className="bg-[#0D1B2A] border border-slate-700/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Check size={16} className="text-emerald-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{stats.totalUsed}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Convertidos</p>
            </div>
            <div className="bg-[#0D1B2A] border border-slate-700/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <TrendingUp size={16} className="text-blue-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{stats.conversionRate}%</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Taxa Conversão</p>
            </div>
            <div className="bg-[#0D1B2A] border border-slate-700/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                  <Crown size={16} className="text-gold" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white truncate">
                {stats.topReferrers[0]?.full_name.split(" ")[0] || "—"}
              </p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Top Indicador</p>
            </div>
          </div>

          {/* Leaderboard */}
          {stats.topReferrers.length > 0 && (
            <div className="bg-[#0D1B2A] border border-slate-700/50 rounded-xl overflow-hidden mb-6">
              <div className="px-4 py-3 border-b border-slate-700/50">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Crown size={16} className="text-gold" />
                  Ranking de Indicadores
                </h2>
              </div>
              <div className="divide-y divide-slate-800/50">
                {stats.topReferrers.map((r, i) => {
                  const total = stats.totalUsed || 1;
                  const pct = Math.round((r.count / total) * 100);
                  return (
                    <div key={r.id} className="px-4 py-3 flex items-center gap-4">
                      <div className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                        i === 0 ? "bg-gold/20 text-gold" :
                        i === 1 ? "bg-slate-400/20 text-slate-300" :
                        i === 2 ? "bg-amber-700/20 text-amber-600" :
                        "bg-slate-700/30 text-slate-400"
                      )}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{r.full_name}</p>
                        {r.company && <p className="text-[10px] text-slate-500 truncate">{r.company}</p>}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-gold">{r.count}</p>
                        <p className="text-[10px] text-slate-500">{pct}%</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Referral Tree */}
          {tree && tree.length > 0 && (
            <div className="bg-[#0D1B2A] border border-slate-700/50 rounded-xl overflow-hidden mb-6">
              <div className="px-4 py-3 border-b border-slate-700/50">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Users size={16} className="text-gold" />
                  Árvore de Indicações
                </h2>
              </div>
              <div className="divide-y divide-slate-800/50">
                {tree.map((node) => (
                  <div key={node.id}>
                    <button
                      onClick={() => toggleTree(node.id)}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-800/20 transition-colors text-left"
                    >
                      {expandedTree.has(node.id) ? (
                        <ChevronDown size={14} className="text-slate-400 flex-shrink-0" />
                      ) : (
                        <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{node.full_name}</p>
                        {node.company && <p className="text-[10px] text-slate-500">{node.company}</p>}
                      </div>
                      <Badge variant="gold">{node.referred.length} indicações</Badge>
                    </button>
                    {expandedTree.has(node.id) && node.referred.length > 0 && (
                      <div className="bg-slate-900/30 border-t border-slate-800/50">
                        {node.referred.map((ref) => (
                          <div key={ref.id} className="px-4 py-2.5 pl-12 flex items-center gap-2 border-b border-slate-800/30 last:border-0">
                            <ArrowRight size={12} className="text-gold/50 flex-shrink-0" />
                            <p className="text-sm text-slate-300">{ref.full_name}</p>
                            {ref.company && <span className="text-[10px] text-slate-500">({ref.company})</span>}
                            <span className="text-[10px] text-slate-600 ml-auto">
                              {new Date(ref.created_at).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Timeline */}
          {stats.recentReferrals.length > 0 && (
            <div className="bg-[#0D1B2A] border border-slate-700/50 rounded-xl overflow-hidden mb-6">
              <div className="px-4 py-3 border-b border-slate-700/50">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <TrendingUp size={16} className="text-gold" />
                  Indicações Recentes
                </h2>
              </div>
              <div className="divide-y divide-slate-800/50">
                {stats.recentReferrals.map((r, i) => (
                  <div key={i} className="px-4 py-3 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-gold flex-shrink-0" />
                    <p className="text-sm text-slate-300 flex-1">
                      <span className="text-white font-medium">{r.referrer}</span>
                      <span className="text-slate-500 mx-2">indicou</span>
                      <span className="text-white font-medium">{r.referred}</span>
                    </p>
                    <span className="text-[10px] text-slate-500 flex-shrink-0">
                      {new Date(r.date).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Legacy Referrals Table */}
      <div className="bg-[#0D1B2A] border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-700/50 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Indicações Manuais</h2>
          <p className="text-xs text-slate-500">{referrals.length} indicações &middot; {activeCount} convertidas</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4">
          {Object.entries(statusLabel).filter(([key]) => ["pending", "contacted", "registered", "active", "declined"].includes(key)).map(([key, label]) => (
            <div key={key} className="bg-navy/40 border border-slate-700/30 rounded-lg p-2.5 text-center">
              <p className="text-lg font-bold text-white">{referrals.filter((r) => r.status === key).length}</p>
              <p className="text-[10px] text-slate-500">{label}</p>
            </div>
          ))}
        </div>

        {/* List */}
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Indicado</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Indicado Por</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Data</th>
              {isAdmin && <th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Ações</th>}
            </tr>
          </thead>
          <tbody>
            {referrals.map((r, i) => (
              <tr key={r.id} className={cn("border-b border-slate-800/50 hover:bg-slate-800/30", i % 2 !== 0 && "bg-slate-900/20")}>
                <td className="px-4 py-3">
                  <p className="font-medium text-white">{r.referred_name}</p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    {r.referred_company && <span className="flex items-center gap-1"><Building2 size={10} />{r.referred_company}</span>}
                    {r.referred_email && <span className="flex items-center gap-1"><Mail size={10} />{r.referred_email}</span>}
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-400">{r.members?.full_name || "—"}</td>
                <td className="px-4 py-3"><Badge variant={statusVariant[r.status] || "default"}>{statusLabel[r.status] || r.status}</Badge></td>
                <td className="px-4 py-3 text-slate-500 text-xs">{new Date(r.created_at).toLocaleDateString("pt-BR")}</td>
                {isAdmin && (
                  <td className="px-4 py-3 text-right">
                    {r.status === "pending" && (
                      <div className="flex justify-end gap-1">
                        <button onClick={() => handleStatus(r.id, "contacted")} className="px-2 py-1 text-[11px] bg-blue-500/10 text-blue-400 rounded hover:bg-blue-500/20">Contactar</button>
                        <button onClick={() => handleStatus(r.id, "declined")} className="px-2 py-1 text-[11px] bg-red-500/10 text-red-400 rounded hover:bg-red-500/20">Recusar</button>
                      </div>
                    )}
                    {r.status === "contacted" && (
                      <button onClick={() => handleStatus(r.id, "registered")} className="px-2 py-1 text-[11px] bg-gold/10 text-gold rounded hover:bg-gold/20">Registrado</button>
                    )}
                    {r.status === "registered" && (
                      <button onClick={() => handleStatus(r.id, "active")} className="px-2 py-1 text-[11px] bg-emerald-500/10 text-emerald-400 rounded hover:bg-emerald-500/20">Ativar</button>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {referrals.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-slate-500">Nenhuma indicação manual ainda. Use o código acima para convidar membros!</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Indicar Novo Membro">
        <form onSubmit={handleCreate} className="space-y-4">
          <div><label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Nome *</label>
            <input name="referred_name" required className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:border-gold/40 focus:outline-none" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Email</label>
              <input name="referred_email" type="email" className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:border-gold/40 focus:outline-none" /></div>
            <div><label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Telefone</label>
              <input name="referred_phone" className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:border-gold/40 focus:outline-none" /></div>
          </div>
          <div><label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Empresa</label>
            <input name="referred_company" className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:border-gold/40 focus:outline-none" /></div>
          <div><label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Notas</label>
            <textarea name="notes" rows={2} className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:border-gold/40 focus:outline-none resize-none" /></div>
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-700/50">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white rounded-lg transition-colors">Cancelar</button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium bg-gold text-navy rounded-lg hover:bg-light-gold transition-colors disabled:opacity-50">
              {loading ? "Enviando..." : "Indicar"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
