"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  CreditCard, TrendingUp, Users, AlertTriangle,
  ExternalLink, Check, Crown,
} from "lucide-react";
import { formatCurrency } from "@/lib/services/stripe";
import { cn } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import type { MembershipTier } from "@/types/database";

interface BillingDashboardProps {
  tiers: MembershipTier[];
  stats: {
    mrr: number;
    revenueThisMonth: number;
    revenueTotal: number;
    totalSubscriptions: number;
    activeSubscriptions: number;
    canceledSubscriptions: number;
    freeMembers: number;
    byTier: Record<string, number>;
    churnRate: number;
  };
  payments: Array<{
    id: string;
    amount: number;
    status: string;
    created_at: string;
    description: string | null;
    members: { full_name: string; email: string } | null;
  }>;
  isAdmin: boolean;
  stripeConfigured: boolean;
}

export default function BillingDashboard({ tiers, stats, payments, isAdmin, stripeConfigured }: BillingDashboardProps) {
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  async function handleCheckout(priceId: string) {
    setCheckoutLoading(priceId);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || "Erro ao criar checkout");
      }
    } catch {
      toast.error("Erro ao processar");
    }
    setCheckoutLoading(null);
  }

  async function handlePortal() {
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || "Erro ao abrir portal");
      }
    } catch {
      toast.error("Erro ao processar");
    }
  }

  return (
    <div className="space-y-6">
      {/* Stripe Status */}
      {!stripeConfigured && (
        <div className="bg-amber-500/10 border border-amber-500/15 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-400">Stripe não configurado</p>
            <p className="text-xs text-corp-muted mt-1">
              Configure STRIPE_SECRET_KEY e STRIPE_WEBHOOK_SECRET nas env vars. A conta Stripe deve ser criada pela diretoria da BSWFCC (501(c)(6) nonprofit).
            </p>
          </div>
        </div>
      )}

      {/* Financial Stats (Admin only) */}
      {isAdmin && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "MRR", value: formatCurrency(stats.mrr), icon: TrendingUp, color: "text-accent" },
              { label: "Receita Mês", value: formatCurrency(stats.revenueThisMonth), icon: CreditCard, color: "text-emerald-400" },
              { label: "Assinantes Ativos", value: stats.activeSubscriptions, icon: Users, color: "text-blue-400" },
              { label: "Churn Rate", value: `${stats.churnRate}%`, icon: AlertTriangle, color: stats.churnRate > 10 ? "text-red-400" : "text-corp-muted" },
            ].map((stat) => (
              <div key={stat.label} className="bg-corp-card border border-corp-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-corp-muted uppercase tracking-wider">{stat.label}</span>
                  <stat.icon size={14} className="text-corp-muted/40" strokeWidth={1.5} />
                </div>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Subs by Tier */}
          {Object.keys(stats.byTier).length > 0 && (
            <div className="bg-corp-card border border-corp-border rounded-xl p-5">
              <h3 className="text-sm font-medium text-corp-muted mb-3">Assinantes por Plano</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(stats.byTier).map(([tier, count]) => (
                  <div key={tier} className="text-center">
                    <p className="text-lg font-bold text-corp-text">{count}</p>
                    <p className="text-[11px] text-corp-muted">{tier}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Membership Tiers */}
      <div>
        <h2 className="text-sm font-medium text-corp-muted mb-3">Planos de Membership</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={cn(
                "bg-corp-card border rounded-xl p-5 relative",
                tier.slug === "business" ? "border-accent/30" : "border-corp-border"
              )}
            >
              {tier.slug === "business" && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                  <Badge variant="gold">Popular</Badge>
                </div>
              )}
              <div className="mb-4">
                <h3 className="text-base font-semibold text-corp-text">{tier.name}</h3>
                <p className="text-[11px] text-corp-muted mt-0.5">{tier.description}</p>
              </div>
              <div className="mb-4">
                <span className="text-2xl font-bold text-accent">
                  {tier.price_monthly === 0 ? "Free" : formatCurrency(tier.price_monthly)}
                </span>
                {tier.price_monthly > 0 && (
                  <span className="text-xs text-corp-muted">/mês</span>
                )}
              </div>
              <ul className="space-y-2 mb-5">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-corp-muted">
                    <Check size={12} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              {tier.price_monthly > 0 && stripeConfigured && tier.stripe_price_id_monthly && (
                <button
                  onClick={() => handleCheckout(tier.stripe_price_id_monthly!)}
                  disabled={checkoutLoading === tier.stripe_price_id_monthly}
                  className="w-full px-4 py-2 text-sm font-medium bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
                >
                  {checkoutLoading === tier.stripe_price_id_monthly ? "Processando..." : "Assinar"}
                </button>
              )}
              {tier.price_monthly === 0 && (
                <div className="w-full px-4 py-2 text-sm text-center text-corp-muted border border-corp-border rounded-lg">
                  Plano atual
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Payments (Admin) */}
      {isAdmin && payments.length > 0 && (
        <div className="bg-corp-card border border-corp-border rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-corp-border">
            <h3 className="text-sm font-medium text-corp-muted">Últimos Pagamentos</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-corp-border">
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-corp-muted uppercase tracking-wider">Membro</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-corp-muted uppercase tracking-wider">Valor</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-corp-muted uppercase tracking-wider">Status</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-corp-muted uppercase tracking-wider">Data</th>
                </tr>
              </thead>
              <tbody>
                {payments.slice(0, 10).map((p, i) => (
                  <tr
                    key={p.id}
                    className={cn(
                      "border-b border-corp-border",
                      i % 2 === 0 ? "bg-transparent" : "bg-white/[0.03]"
                    )}
                  >
                    <td className="px-4 py-2.5 text-corp-text">{p.members?.full_name || "—"}</td>
                    <td className="px-4 py-2.5 text-accent font-medium">{formatCurrency(p.amount)}</td>
                    <td className="px-4 py-2.5">
                      <Badge variant={p.status === "succeeded" ? "success" : p.status === "failed" ? "danger" : "warning"}>
                        {p.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 text-corp-muted text-xs">
                      {new Date(p.created_at).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
