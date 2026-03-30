"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { MembershipTier, Subscription, Payment } from "@/types/database";

// ─── Tiers ───

export async function getTiers() {
  const supabase = createClient();
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
  const supabase = createClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*, membership_tiers(*)")
    .eq("member_id", memberId)
    .single();
  if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows
  return data as (Subscription & { membership_tiers: MembershipTier }) | null;
}

export async function getAllSubscriptions() {
  const supabase = createClient();
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
  const supabase = createClient();
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
  const supabase = createClient();
  const { data, error } = await supabase
    .from("payments")
    .select("*, members(full_name, email)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function getMemberPayments(memberId: string) {
  const supabase = createClient();
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
  const supabase = createClient();
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
  const supabase = createClient();

  const [subsResult, paymentsResult, tiersResult] = await Promise.all([
    supabase.from("subscriptions").select("status, tier_id"),
    supabase.from("payments").select("amount, status, created_at").eq("status", "succeeded"),
    supabase.from("membership_tiers").select("id, name, slug, price_monthly"),
  ]);

  const subscriptions = subsResult.data || [];
  const payments = paymentsResult.data || [];
  const tiers = tiersResult.data || [];

  // Active subs
  const activeSubs = subscriptions.filter((s) => s.status === "active" || s.status === "trialing");
  const canceledSubs = subscriptions.filter((s) => s.status === "canceled");
  const freeSubs = subscriptions.filter((s) => s.status === "free");

  // MRR calculation
  let mrr = 0;
  for (const sub of activeSubs) {
    const tier = tiers.find((t) => t.id === sub.tier_id);
    if (tier) mrr += tier.price_monthly;
  }

  // Revenue this month
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const revenueThisMonth = payments
    .filter((p) => p.created_at >= monthStart)
    .reduce((sum, p) => sum + p.amount, 0);

  // Revenue all time
  const revenueTotal = payments.reduce((sum, p) => sum + p.amount, 0);

  // Subs by tier
  const byTier: Record<string, number> = {};
  for (const sub of activeSubs) {
    const tier = tiers.find((t) => t.id === sub.tier_id);
    const name = tier?.name || "Unknown";
    byTier[name] = (byTier[name] || 0) + 1;
  }

  return {
    mrr,
    revenueThisMonth,
    revenueTotal,
    totalSubscriptions: subscriptions.length,
    activeSubscriptions: activeSubs.length,
    canceledSubscriptions: canceledSubs.length,
    freeMembers: freeSubs.length,
    byTier,
    churnRate: subscriptions.length > 0
      ? Math.round((canceledSubs.length / subscriptions.length) * 100)
      : 0,
  };
}
