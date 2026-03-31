import { getCurrentMember } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/utils";
import { isStripeConfigured } from "@/lib/services/stripe";
import { getTiers, getFinancialStats, getPayments } from "@/lib/actions/billing";
import BillingDashboard from "@/components/admin/BillingDashboard";

export default async function BillingPage() {
  const member = await getCurrentMember();
  if (!member) redirect("/login");

  const admin = isAdmin(member.role);
  const stripeOk = isStripeConfigured();

  const [tiers, stats, payments] = await Promise.all([
    getTiers().catch(() => []),
    admin ? getFinancialStats().catch(() => ({
      mrr: 0, revenueThisMonth: 0, revenueTotal: 0,
      totalSubscriptions: 0, activeSubscriptions: 0, canceledSubscriptions: 0,
      freeMembers: 0, byTier: {}, churnRate: 0,
    })) : Promise.resolve({
      mrr: 0, revenueThisMonth: 0, revenueTotal: 0,
      totalSubscriptions: 0, activeSubscriptions: 0, canceledSubscriptions: 0,
      freeMembers: 0, byTier: {}, churnRate: 0,
    }),
    admin ? getPayments(20).catch(() => []) : Promise.resolve([]),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-corp-text">Billing & Membership</h1>
        <p className="text-sm text-corp-muted mt-0.5">
          {admin ? "Gestão financeira e planos de membership" : "Gerencie sua assinatura"}
        </p>
      </div>
      <BillingDashboard
        tiers={tiers}
        stats={stats}
        payments={payments as Array<{
          id: string; amount: number; status: string; created_at: string;
          description: string | null; members: { full_name: string; email: string } | null;
        }>}
        isAdmin={admin}
        stripeConfigured={stripeOk}
      />
    </div>
  );
}
