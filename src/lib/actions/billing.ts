"use server";
import { revalidatePath } from "next/cache";
import { requireAuth, requireAdmin } from "./auth-helpers";
import type { MembershipTier, Subscription, Payment } from "@/types/database";

// ─── Tiers (public read for authenticated users) ───

export async function getTiers() {
  const { supabase } = await requireAuth();
  const { data, error } = await supabase
    .from("membership_tiers")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw error;
  return data as MembershipTier[];
}

// ─── Subscriptions ───

export async function getSubscription(memberId: string) {
  const { supabase, memberId: callerId } = await requireAuth();
  // Members can only view their own subscription
  if (memberId !== callerId) {
    const { callerRole } = await requireAdmin();
    void callerRole; // admin check passed
  }
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*, membership_tiers(*)")
    .eq("member_id", memberId)
    .single();
  if (error && error.code !== "PGRST116") throw error;
  return data as (Subscription & { membership_tiers: MembershipTier }) | null;
}

export async function getAllSubscriptions() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*, members(full_name, email, company), membership_tiers(name, slug, price_monthly)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function upsertSubscription(
  memberId: string,
  tierId: string,
  stripeData?: {
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    status?: string;
    periodStart?: string;
    periodEnd?: string;
  }
) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("subscriptions")
    .upsert({
      member_id: memberId,
      tier_id: tierId,
      stripe_customer_id: stripeData?.stripeCustomerId || null,
      stripe_subscription_id: stripeData?.stripeSubscriptionId || null,
      status: stripeData?.status || "active",
      current_period_start: stripeData?.periodStart || null,
      current_period_end: stripeData?.periodEnd || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "member_id" });
  if (error) throw error;
  revalidatePath("/billing");
  revalidatePath("/dashboard");
}

// ─── Payments ───

export async function getPayments(limit = 50) {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("payments")
    .select("*, members(full_name, email)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function getMemberPayments(memberId: string) {
  const { supabase, memberId: callerId } = await requireAuth();
  // Members can only view their own payments
  if (memberId !== callerId) {
    await requireAdmin();
  }
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("member_id", memberId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Payment[];
}

export async function recordPayment(
  memberId: string,
  amount: number,
  status: string,
  stripeData?: {
    subscriptionId?: string;
    paymentIntentId?: string;
    invoiceId?: string;
    description?: string;
  }
) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("payments").insert({
    member_id: memberId,
    subscription_id: stripeData?.subscriptionId || null,
    stripe_payment_intent_id: stripeData?.paymentIntentId || null,
    stripe_invoice_id: stripeData?.invoiceId || null,
    amount,
    status,
    description: stripeData?.description || null,
  });
  if (error) throw error;
  revalidatePath("/billing");
}

// ─── Financial Stats ───

export async function getFinancialStats() {
  const { supabase } = await requireAdmin();

  const [subsResult, paymentsResult, tiersResult] = await Promise.all([
    supabase.from("subscriptions").select("status, tier_id"),
    supabase.from("payments").select("amount, status, created_at").eq("status", "succeeded"),
    supabase.from("membership_tiers").select("id, name, slug, price_monthly"),
  ]);

  const subscriptions = subsResult.data || [];
  const payments = paymentsResult.data || [];
  const tiers = tiersResult.data || [];

  // Build tier lookup for O(1) access
  const tierById = new Map<string, { id: string; name: string; slug: string; price_monthly: number }>(
    tiers.map((t) => [t.id, t])
  );

  // Single pass over subscriptions: counts, MRR, and tier breakdown
  let activeCount = 0;
  let canceledCount = 0;
  let freeCount = 0;
  let mrr = 0;
  const byTier: Record<string, number> = {};

  for (const sub of subscriptions) {
    if (sub.status === "active" || sub.status === "trialing") {
      activeCount++;
      const tier = tierById.get(sub.tier_id);
      if (tier) {
        mrr += tier.price_monthly;
        byTier[tier.name] = (byTier[tier.name] || 0) + 1;
      } else {
        byTier["Unknown"] = (byTier["Unknown"] || 0) + 1;
      }
    } else if (sub.status === "canceled") {
      canceledCount++;
    } else if (sub.status === "free") {
      freeCount++;
    }
  }

  // Single pass over payments: total and this-month revenue
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  let revenueTotal = 0;
  let revenueThisMonth = 0;

  for (const p of payments) {
    revenueTotal += p.amount;
    if (p.created_at >= monthStart) {
      revenueThisMonth += p.amount;
    }
  }

  return {
    mrr,
    revenueThisMonth,
    revenueTotal,
    totalSubscriptions: subscriptions.length,
    activeSubscriptions: activeCount,
    canceledSubscriptions: canceledCount,
    freeMembers: freeCount,
    byTier,
    churnRate: subscriptions.length > 0
      ? Math.round((canceledCount / subscriptions.length) * 100)
      : 0,
  };
}
