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
  Gift,
  Star,
  Sparkles,
  Trophy,
  CircleDollarSign,
} from "lucide-react";
import { createReferral, updateReferralStatus, generateReferralCode, redeemReward } from "@/lib/actions/referrals";
import { cn, APP_URL } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import type { Member, ReferralReward, ReferralRewardType } from "@/types/database";

const REWARD_TIERS: Array<{ milestone: number; type: ReferralRewardType; label: string; shortLabel: string; discount_pct: number }> = [
  { milestone: 1, type: "discount_10", label: "10% de desconto na próxima anuidade", shortLabel: "10% off", discount_pct: 10 },
  { milestone: 3, type: "discount_20", label: "20% de desconto na próxima anuidade", shortLabel: "20% off", discount_pct: 20 },
  { milestone: 5, type: "vip_ambassador", label: "VIP Ambassador + 50% na anuidade", shortLabel: "50% off + VIP", discount_pct: 50 },
  { milestone: 10, type: "lifetime_ambassador", label: "Lifetime Ambassador + anuidade grátis", shortLabel: "100% off", discount_pct: 100 },
];

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

type RewardWithMember = ReferralReward & { member_name: string; member_company: string | null };

interface RewardSummary {
  totalEarned: number;
  totalRedeemed: number;
  totalPending: number;
  totalDiscountValue: number;
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
  myRewards?: ReferralReward[];
  allRewards?: RewardWithMember[];
  rewardSummary?: RewardSummary;
}

export default function ReferralsView({ referrals, currentMember, isAdmin, myCode, stats, tree, myReferrals, myRewards, allRewards, rewardSummary }: ReferralsViewProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expandedTree, setExpandedTree] = useState<Set<string>>(new Set());
  const [generatingCode, setGeneratingCode] = useState(false);

  const shareUrl = myCode ? `${APP_URL}/convite/${myCode}` : null;

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
    try {
      const result = await generateReferralCode(currentMember.id);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Novo código gerado!");
        router.refresh();
      }
    } catch {
      toast.error("Erro de conexão. Tente novamente.");
    } finally {
      setGeneratingCode(false);
    }
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      const result = await createReferral(currentMember.id, form);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Indicação registrada");
        setShowForm(false);
        router.refresh();
      }
    } catch {
      toast.error("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleStatus(id: string, status: "pending" | "contacted" | "registered" | "active" | "declined") {
    try {
      const result = await updateReferralStatus(id, status);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Status atualizado");
        router.refresh();
      }
    } catch {
      toast.error("Erro de conexão. Tente novamente.");
    }
  }

  async function handleRedeem(rewardId: string) {
    try {
      const result = await redeemReward(rewardId);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Bonificação resgatada!");
        router.refresh();
      }
    } catch {
      toast.error("Erro de conexão. Tente novamente.");
    }
  }

  const approvedReferralCount = myReferrals?.filter((r) => r.status === "ativo").length || 0;
  const nextTier = REWARD_TIERS.find((t) => t.milestone > approvedReferralCount);
  const currentTier = [...REWARD_TIERS].reverse().find((t) => approvedReferralCount >= t.milestone);

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
          <h1 className="text-xl font-semibold text-corp-text">Indicações</h1>
          <p className="text-sm text-corp-muted mt-0.5">Sistema de convite e referral da BSWFCC</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-accent text-white rounded-lg hover:bg-accent-dim transition-colors">
          <UserPlus size={16} /> Indicar Membro
        </button>
      </div>

      {/* My Referral Code Section — for all members */}
      <div className="bg-white border border-corp-border rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-corp-text flex items-center gap-2">
            <Link2 size={16} className="text-accent" />
            Seu Código de Indicação
          </h2>
          <button
            onClick={handleGenerateCode}
            disabled={generatingCode}
            className="px-3 py-1.5 text-xs font-medium bg-accent/10 text-accent border border-accent/20 rounded-lg hover:bg-accent/20 transition-colors disabled:opacity-50"
          >
            {generatingCode ? "Gerando..." : myCode ? "Gerar Novo" : "Gerar Código"}
          </button>
        </div>

        {myCode ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-white border border-accent/20 rounded-lg px-4 py-3 font-mono text-lg text-accent tracking-widest text-center">
                {myCode}
              </div>
              <button
                onClick={copyCodeOnly}
                className="px-3 py-3 bg-accent/10 text-accent border border-accent/20 rounded-lg hover:bg-accent/20 transition-colors"
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
                className="flex-1 px-3 py-2 text-xs bg-white border border-corp-border rounded-lg text-corp-muted truncate"
              />
              <button
                onClick={copyCode}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-accent text-white rounded-lg hover:bg-accent-dim transition-colors"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copiado!" : "Copiar Link"}
              </button>
            </div>
            <p className="text-[10px] text-corp-muted">
              Compartilhe este link com empresários que desejam se tornar membros. Após cada uso, um novo código será gerado automaticamente.
            </p>
          </div>
        ) : (
          <p className="text-sm text-corp-muted">
            Você ainda não tem um código de indicação. Clique em &quot;Gerar Código&quot; para criar o seu.
          </p>
        )}
      </div>

      {/* My Referrals Section */}
      {myReferrals && myReferrals.length > 0 && (
        <div className="bg-white border border-corp-border rounded-xl overflow-hidden mb-6">
          <div className="px-4 py-3 border-b border-corp-border">
            <h2 className="text-sm font-semibold text-corp-text flex items-center gap-2">
              <Users size={16} className="text-accent" />
              Suas Indicações ({myReferrals.length})
            </h2>
          </div>
          <div className="divide-y divide-corp-border">
            {myReferrals.map((r) => (
              <div key={r.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-corp-text">{r.full_name}</p>
                  {r.company && <p className="text-[11px] text-corp-muted">{r.company}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={r.status === "ativo" ? "success" : r.status === "pendente" ? "warning" : "danger"}>
                    {statusLabel[r.status] || r.status}
                  </Badge>
                  <span className="text-[10px] text-corp-muted">
                    {new Date(r.created_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My Rewards / Bonificações Section — for all members */}
      <div className="bg-white border border-corp-border rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-corp-text flex items-center gap-2">
            <Gift size={16} className="text-accent" />
            Suas Bonificações
          </h2>
          {currentTier && (
            <Badge variant="gold">{currentTier.label}</Badge>
          )}
        </div>

        {/* Progress toward next tier */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-corp-muted">
              {approvedReferralCount} indicação{approvedReferralCount !== 1 ? "ões" : ""} aprovada{approvedReferralCount !== 1 ? "s" : ""}
            </span>
            {nextTier ? (
              <span className="text-accent">
                Próximo: {nextTier.label} ({nextTier.milestone - approvedReferralCount} faltando)
              </span>
            ) : (
              <span className="text-accent">Nível máximo atingido!</span>
            )}
          </div>
          <div className="w-full bg-gray-50 rounded-full h-2.5">
            <div
              className="bg-gradient-to-r from-accent to-purple-400 h-2.5 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, nextTier ? (approvedReferralCount / nextTier.milestone) * 100 : 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Tier roadmap */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {REWARD_TIERS.map((tier) => {
            const achieved = approvedReferralCount >= tier.milestone;
            return (
              <div
                key={tier.type}
                className={cn(
                  "border rounded-lg p-3 text-center transition-all",
                  achieved
                    ? "bg-accent/10 border-accent/30"
                    : "bg-white border-corp-border opacity-60"
                )}
              >
                <div className="flex justify-center mb-1.5">
                  {tier.milestone === 1 && <Star size={18} className={achieved ? "text-accent" : "text-corp-muted"} />}
                  {tier.milestone === 3 && <Sparkles size={18} className={achieved ? "text-accent" : "text-corp-muted"} />}
                  {tier.milestone === 5 && <Trophy size={18} className={achieved ? "text-accent" : "text-corp-muted"} />}
                  {tier.milestone === 10 && <Crown size={18} className={achieved ? "text-accent" : "text-corp-muted"} />}
                </div>
                <p className={cn("text-xs font-medium", achieved ? "text-accent" : "text-corp-muted")}>
                  {tier.milestone} indicação{tier.milestone !== 1 ? "ões" : ""}
                </p>
                <p className={cn("text-[10px] mt-0.5 font-medium", achieved ? "text-corp-muted" : "text-corp-muted")}>
                  {tier.shortLabel}
                </p>
                {achieved && (
                  <Check size={12} className="text-emerald-400 mx-auto mt-1" />
                )}
              </div>
            );
          })}
        </div>

        {/* My earned rewards */}
        {myRewards && myRewards.length > 0 ? (
          <div className="border-t border-corp-border pt-3">
            <p className="text-[11px] text-corp-muted uppercase tracking-wider mb-2">Recompensas Conquistadas</p>
            <div className="space-y-2">
              {myRewards.map((r) => (
                <div key={r.id} className="flex items-center justify-between bg-white border border-corp-border rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <CircleDollarSign size={14} className="text-accent" />
                    <div>
                      <p className="text-sm text-corp-text">{r.label}</p>
                      <p className="text-[10px] text-corp-muted">
                        Conquistada em {new Date(r.earned_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <Badge variant={r.status === "redeemed" ? "success" : r.status === "expired" ? "danger" : "gold"}>
                    {r.status === "earned" ? "Pendente" : r.status === "redeemed" ? "Resgatada" : "Expirada"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-xs text-corp-muted border-t border-corp-border pt-3">
            Indique membros para ganhar bonificações! Cada membro aprovado conta para seu progresso.
          </p>
        )}
      </div>

      {/* Admin: Reward Management */}
      {isAdmin && rewardSummary && (
        <div className="bg-white border border-corp-border rounded-xl overflow-hidden mb-6">
          <div className="px-4 py-3 border-b border-corp-border">
            <h2 className="text-sm font-semibold text-corp-text flex items-center gap-2">
              <Gift size={16} className="text-accent" />
              Gestão de Bonificações
            </h2>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4">
            <div className="bg-white border border-corp-border rounded-lg p-2.5 text-center">
              <p className="text-lg font-bold text-corp-text">{rewardSummary.totalEarned}</p>
              <p className="text-[10px] text-corp-muted">Total Conquistadas</p>
            </div>
            <div className="bg-white border border-corp-border rounded-lg p-2.5 text-center">
              <p className="text-lg font-bold text-accent">{rewardSummary.totalPending}</p>
              <p className="text-[10px] text-corp-muted">Pendentes Resgate</p>
            </div>
            <div className="bg-white border border-corp-border rounded-lg p-2.5 text-center">
              <p className="text-lg font-bold text-emerald-400">{rewardSummary.totalRedeemed}</p>
              <p className="text-[10px] text-corp-muted">Resgatadas</p>
            </div>
            <div className="bg-white border border-corp-border rounded-lg p-2.5 text-center">
              <p className="text-lg font-bold text-corp-text">{rewardSummary.totalDiscountValue}%</p>
              <p className="text-[10px] text-corp-muted">Descontos Pendentes</p>
            </div>
          </div>

          {/* All rewards list */}
          {allRewards && allRewards.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-corp-border">
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-corp-muted uppercase tracking-wider">Membro</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-corp-muted uppercase tracking-wider">Recompensa</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-corp-muted uppercase tracking-wider">Desconto</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-corp-muted uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold text-corp-muted uppercase tracking-wider">Ação</th>
                </tr>
              </thead>
              <tbody>
                {allRewards.map((r, i) => (
                  <tr key={r.id} className={cn("border-b border-corp-border hover:bg-white", i % 2 !== 0 && "bg-gray-50")}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-corp-text">{r.member_name}</p>
                      {r.member_company && <p className="text-[10px] text-corp-muted">{r.member_company}</p>}
                    </td>
                    <td className="px-4 py-3 text-corp-muted text-xs">{r.label}</td>
                    <td className="px-4 py-3 text-accent font-medium">{r.discount_pct}%</td>
                    <td className="px-4 py-3">
                      <Badge variant={r.status === "redeemed" ? "success" : r.status === "expired" ? "danger" : "gold"}>
                        {r.status === "earned" ? "Pendente" : r.status === "redeemed" ? "Resgatada" : "Expirada"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {r.status === "earned" && (
                        <button
                          onClick={() => handleRedeem(r.id)}
                          className="px-3 py-1.5 text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 rounded-lg hover:bg-emerald-500/20 transition-colors"
                        >
                          Resgatar
                        </button>
                      )}
                      {r.status === "redeemed" && r.redeemed_at && (
                        <span className="text-[10px] text-corp-muted">
                          {new Date(r.redeemed_at).toLocaleDateString("pt-BR")}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Admin Stats Section */}
      {isAdmin && stats && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-white border border-corp-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Link2 size={16} className="text-accent" />
                </div>
              </div>
              <p className="text-2xl font-bold text-corp-text">{stats.totalCodes}</p>
              <p className="text-[10px] text-corp-muted uppercase tracking-wider">Total Códigos</p>
            </div>
            <div className="bg-white border border-corp-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Check size={16} className="text-emerald-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-corp-text">{stats.totalUsed}</p>
              <p className="text-[10px] text-corp-muted uppercase tracking-wider">Convertidos</p>
            </div>
            <div className="bg-white border border-corp-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <TrendingUp size={16} className="text-blue-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-corp-text">{stats.conversionRate}%</p>
              <p className="text-[10px] text-corp-muted uppercase tracking-wider">Taxa Conversão</p>
            </div>
            <div className="bg-white border border-corp-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Crown size={16} className="text-accent" />
                </div>
              </div>
              <p className="text-2xl font-bold text-corp-text truncate">
                {stats.topReferrers[0]?.full_name.split(" ")[0] || "—"}
              </p>
              <p className="text-[10px] text-corp-muted uppercase tracking-wider">Top Indicador</p>
            </div>
          </div>

          {/* Leaderboard */}
          {stats.topReferrers.length > 0 && (
            <div className="bg-white border border-corp-border rounded-xl overflow-hidden mb-6">
              <div className="px-4 py-3 border-b border-corp-border">
                <h2 className="text-sm font-semibold text-corp-text flex items-center gap-2">
                  <Crown size={16} className="text-accent" />
                  Ranking de Indicadores
                </h2>
              </div>
              <div className="divide-y divide-corp-border">
                {stats.topReferrers.map((r, i) => {
                  const total = stats.totalUsed || 1;
                  const pct = Math.round((r.count / total) * 100);
                  return (
                    <div key={r.id} className="px-4 py-3 flex items-center gap-4">
                      <div className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                        i === 0 ? "bg-accent/10 text-accent" :
                        i === 1 ? "bg-gray-50 text-corp-muted" :
                        i === 2 ? "bg-amber-500/10 text-amber-400" :
                        "bg-white text-corp-muted"
                      )}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-corp-text truncate">{r.full_name}</p>
                        {r.company && <p className="text-[10px] text-corp-muted truncate">{r.company}</p>}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-accent">{r.count}</p>
                        <p className="text-[10px] text-corp-muted">{pct}%</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Referral Tree */}
          {tree && tree.length > 0 && (
            <div className="bg-white border border-corp-border rounded-xl overflow-hidden mb-6">
              <div className="px-4 py-3 border-b border-corp-border">
                <h2 className="text-sm font-semibold text-corp-text flex items-center gap-2">
                  <Users size={16} className="text-accent" />
                  Árvore de Indicações
                </h2>
              </div>
              <div className="divide-y divide-corp-border">
                {tree.map((node) => (
                  <div key={node.id}>
                    <button
                      onClick={() => toggleTree(node.id)}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white transition-colors text-left"
                    >
                      {expandedTree.has(node.id) ? (
                        <ChevronDown size={14} className="text-corp-muted flex-shrink-0" />
                      ) : (
                        <ChevronRight size={14} className="text-corp-muted flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-corp-text truncate">{node.full_name}</p>
                        {node.company && <p className="text-[10px] text-corp-muted">{node.company}</p>}
                      </div>
                      <Badge variant="gold">{node.referred.length} indicações</Badge>
                    </button>
                    {expandedTree.has(node.id) && node.referred.length > 0 && (
                      <div className="bg-gray-50 border-t border-corp-border">
                        {node.referred.map((ref) => (
                          <div key={ref.id} className="px-4 py-2.5 pl-12 flex items-center gap-2 border-b border-corp-border last:border-0">
                            <ArrowRight size={12} className="text-accent/30 flex-shrink-0" />
                            <p className="text-sm text-corp-muted">{ref.full_name}</p>
                            {ref.company && <span className="text-[10px] text-corp-muted">({ref.company})</span>}
                            <span className="text-[10px] text-corp-muted ml-auto">
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
            <div className="bg-white border border-corp-border rounded-xl overflow-hidden mb-6">
              <div className="px-4 py-3 border-b border-corp-border">
                <h2 className="text-sm font-semibold text-corp-text flex items-center gap-2">
                  <TrendingUp size={16} className="text-accent" />
                  Indicações Recentes
                </h2>
              </div>
              <div className="divide-y divide-corp-border">
                {stats.recentReferrals.map((r) => (
                  <div key={`${r.referrer}-${r.referred}-${r.date}`} className="px-4 py-3 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                    <p className="text-sm text-corp-muted flex-1">
                      <span className="text-corp-text font-medium">{r.referrer}</span>
                      <span className="text-corp-muted mx-2">indicou</span>
                      <span className="text-corp-text font-medium">{r.referred}</span>
                    </p>
                    <span className="text-[10px] text-corp-muted flex-shrink-0">
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
      <div className="bg-white border border-corp-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-corp-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-corp-text">Indicações Manuais</h2>
          <p className="text-xs text-corp-muted">{referrals.length} indicações &middot; {activeCount} convertidas</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4">
          {Object.entries(statusLabel).filter(([key]) => ["pending", "contacted", "registered", "active", "declined"].includes(key)).map(([key, label]) => (
            <div key={key} className="bg-white border border-corp-border rounded-lg p-2.5 text-center">
              <p className="text-lg font-bold text-corp-text">{referrals.filter((r) => r.status === key).length}</p>
              <p className="text-[10px] text-corp-muted">{label}</p>
            </div>
          ))}
        </div>

        {/* List */}
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-corp-border">
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-corp-muted uppercase tracking-wider">Indicado</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-corp-muted uppercase tracking-wider">Indicado Por</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-corp-muted uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-corp-muted uppercase tracking-wider">Data</th>
              {isAdmin && <th className="px-4 py-3 text-right text-[11px] font-semibold text-corp-muted uppercase tracking-wider">Ações</th>}
            </tr>
          </thead>
          <tbody>
            {referrals.map((r, i) => (
              <tr key={r.id} className={cn("border-b border-corp-border hover:bg-white", i % 2 !== 0 && "bg-gray-50")}>
                <td className="px-4 py-3">
                  <p className="font-medium text-corp-text">{r.referred_name}</p>
                  <div className="flex items-center gap-2 text-[11px] text-corp-muted">
                    {r.referred_company && <span className="flex items-center gap-1"><Building2 size={10} />{r.referred_company}</span>}
                    {r.referred_email && <span className="flex items-center gap-1"><Mail size={10} />{r.referred_email}</span>}
                  </div>
                </td>
                <td className="px-4 py-3 text-corp-muted">{r.members?.full_name || "—"}</td>
                <td className="px-4 py-3"><Badge variant={statusVariant[r.status] || "default"}>{statusLabel[r.status] || r.status}</Badge></td>
                <td className="px-4 py-3 text-corp-muted text-xs">{new Date(r.created_at).toLocaleDateString("pt-BR")}</td>
                {isAdmin && (
                  <td className="px-4 py-3 text-right">
                    {r.status === "pending" && (
                      <div className="flex justify-end gap-1">
                        <button onClick={() => handleStatus(r.id, "contacted")} className="px-2 py-1 text-[11px] bg-blue-500/10 text-blue-400 rounded hover:bg-blue-500/20">Contactar</button>
                        <button onClick={() => handleStatus(r.id, "declined")} className="px-2 py-1 text-[11px] bg-red-500/10 text-red-400 rounded hover:bg-red-500/20">Recusar</button>
                      </div>
                    )}
                    {r.status === "contacted" && (
                      <button onClick={() => handleStatus(r.id, "registered")} className="px-2 py-1 text-[11px] bg-accent/10 text-accent rounded hover:bg-accent/20">Registrado</button>
                    )}
                    {r.status === "registered" && (
                      <button onClick={() => handleStatus(r.id, "active")} className="px-2 py-1 text-[11px] bg-emerald-500/10 text-emerald-400 rounded hover:bg-emerald-500/20">Ativar</button>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {referrals.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-corp-muted">Nenhuma indicação manual ainda. Use o código acima para convidar membros!</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Indicar Novo Membro">
        <form onSubmit={handleCreate} className="space-y-4">
          <div><label className="block text-[11px] text-corp-muted uppercase tracking-wider mb-1">Nome *</label>
            <input name="referred_name" required className="w-full px-3 py-2 text-sm bg-white border border-corp-border rounded-lg text-corp-text focus:border-accent/30 focus:outline-none" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-[11px] text-corp-muted uppercase tracking-wider mb-1">Email</label>
              <input name="referred_email" type="email" className="w-full px-3 py-2 text-sm bg-white border border-corp-border rounded-lg text-corp-text focus:border-accent/30 focus:outline-none" /></div>
            <div><label className="block text-[11px] text-corp-muted uppercase tracking-wider mb-1">Telefone</label>
              <input name="referred_phone" className="w-full px-3 py-2 text-sm bg-white border border-corp-border rounded-lg text-corp-text focus:border-accent/30 focus:outline-none" /></div>
          </div>
          <div><label className="block text-[11px] text-corp-muted uppercase tracking-wider mb-1">Empresa</label>
            <input name="referred_company" className="w-full px-3 py-2 text-sm bg-white border border-corp-border rounded-lg text-corp-text focus:border-accent/30 focus:outline-none" /></div>
          <div><label className="block text-[11px] text-corp-muted uppercase tracking-wider mb-1">Notas</label>
            <textarea name="notes" rows={2} className="w-full px-3 py-2 text-sm bg-white border border-corp-border rounded-lg text-corp-text focus:border-accent/30 focus:outline-none resize-none" /></div>
          <div className="flex justify-end gap-3 pt-2 border-t border-corp-border">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-corp-muted hover:text-corp-text hover:bg-gray-50 rounded-lg transition-colors">Cancelar</button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium bg-accent text-white rounded-lg hover:bg-accent-dim transition-colors disabled:opacity-50">
              {loading ? "Enviando..." : "Indicar"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
