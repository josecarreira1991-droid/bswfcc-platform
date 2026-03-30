"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Referral, ReferralReward, ReferralRewardType } from "@/types/database";
import { ADMIN_ROLES } from "@/lib/utils";

// ── Helpers ──────────────────────────────────────────────────────────

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 8;
const MAX_CODE_ATTEMPTS = 10;

function generateCode(): string {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_CHARS.charAt(Math.floor(Math.random() * CODE_CHARS.length));
  }
  return code;
}

async function requireAdmin(): Promise<{ supabase: ReturnType<typeof createClient>; callerId: string } | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return null;

  const { data: caller } = await supabase
    .from("members")
    .select("id, role")
    .eq("email", user.email)
    .single();

  if (!caller || !(ADMIN_ROLES as readonly string[]).includes(caller.role)) return null;
  return { supabase, callerId: caller.id };
}

// ── Legacy referral functions (used by ReferralsView) ────────────────

export async function getReferrals(memberId?: string) {
  const supabase = createClient();
  let query = supabase
    .from("referrals")
    .select("*, members!referrals_referrer_id_fkey(full_name, company)")
    .order("created_at", { ascending: false });
  if (memberId) query = query.eq("referrer_id", memberId);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createReferral(referrerId: string, formData: FormData) {
  const supabase = createClient();
  const { error } = await supabase.from("referrals").insert({
    referrer_id: referrerId,
    referred_name: formData.get("referred_name") as string,
    referred_email: (formData.get("referred_email") as string) || null,
    referred_phone: (formData.get("referred_phone") as string) || null,
    referred_company: (formData.get("referred_company") as string) || null,
    notes: (formData.get("notes") as string) || null,
    status: "pending",
  });
  if (error) return { error: error.message };
  revalidatePath("/referrals");
  return { success: true };
}

export async function updateReferralStatus(id: string, status: Referral["status"]) {
  const supabase = createClient();
  const { error } = await supabase
    .from("referrals")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/referrals");
  return { success: true };
}

// ── Referral CODE system ─────────────────────────────────────────────

export async function generateReferralCode(memberId: string): Promise<{ code: string } | { error: string }> {
  const supabase = createClient();

  let code = generateCode();
  let attempts = 0;
  while (attempts < MAX_CODE_ATTEMPTS) {
    const { data: existing } = await supabase
      .from("referral_codes")
      .select("id")
      .eq("code", code)
      .single();

    if (!existing) break;
    code = generateCode();
    attempts++;
  }

  if (attempts >= MAX_CODE_ATTEMPTS) {
    return { error: "Não foi possível gerar um código único. Tente novamente." };
  }

  const { error } = await supabase.from("referral_codes").insert({
    member_id: memberId,
    code,
    is_active: true,
  });

  if (error) return { error: error.message };
  revalidatePath("/referrals");
  return { code };
}

export async function validateReferralCode(code: string): Promise<{
  valid: boolean;
  referrer?: { id: string; full_name: string; company: string | null };
}> {
  const supabase = createClient();
  const { data } = await supabase
    .from("referral_codes")
    .select("id, member_id, is_active, members!referral_codes_member_id_fkey(id, full_name, company)")
    .eq("code", code.toUpperCase().trim())
    .eq("is_active", true)
    .single();

  if (!data || !data.members) {
    return { valid: false };
  }

  const member = data.members as unknown as { id: string; full_name: string; company: string | null };

  return {
    valid: true,
    referrer: {
      id: member.id,
      full_name: member.full_name,
      company: member.company,
    },
  };
}

export async function useReferralCode(code: string, newMemberId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const { data: codeData, error: fetchError } = await supabase
    .from("referral_codes")
    .select("id, member_id")
    .eq("code", code.toUpperCase().trim())
    .eq("is_active", true)
    .single();

  if (fetchError || !codeData) {
    return { success: false, error: "Código inválido ou já utilizado." };
  }

  const { error: updateError } = await supabase
    .from("referral_codes")
    .update({ is_active: false, used_by: newMemberId, used_at: new Date().toISOString() })
    .eq("id", codeData.id);

  if (updateError) return { success: false, error: updateError.message };

  await Promise.all([
    supabase.rpc("increment_referral_count", { member_uuid: codeData.member_id }),
    supabase.from("members").update({ referred_by: codeData.member_id }).eq("id", newMemberId),
  ]);

  await generateReferralCode(codeData.member_id);

  revalidatePath("/referrals");
  return { success: true };
}

export async function getMyReferralCode(memberId: string): Promise<string | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("referral_codes")
    .select("code")
    .eq("member_id", memberId)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  return data?.code || null;
}

export async function getReferralStats() {
  const supabase = createClient();

  const [{ data: codes }, { data: members }] = await Promise.all([
    supabase
      .from("referral_codes")
      .select("id, member_id, code, is_active, used_by, used_at, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("members")
      .select("id, full_name, company, referred_by, referral_count, created_at")
      .order("referral_count", { ascending: false }),
  ]);

  if (!codes || !members) {
    return {
      totalCodes: 0,
      totalUsed: 0,
      conversionRate: 0,
      topReferrers: [] as Array<{ id: string; full_name: string; company: string | null; count: number }>,
      recentReferrals: [] as Array<{ referrer: string; referred: string; date: string }>,
    };
  }

  const usedCodes = codes.filter((c) => c.used_by !== null);
  const totalCodes = codes.length;
  const totalUsed = usedCodes.length;
  const conversionRate = totalCodes > 0 ? Math.round((totalUsed / totalCodes) * 100) : 0;

  const topReferrers = members
    .filter((m) => m.referral_count > 0)
    .slice(0, 10)
    .map((m) => ({
      id: m.id,
      full_name: m.full_name,
      company: m.company,
      count: m.referral_count,
    }));

  const memberMap = new Map(members.map((m) => [m.id, m.full_name]));

  const recentReferrals = usedCodes
    .filter((c) => c.used_at)
    .sort((a, b) => new Date(b.used_at!).getTime() - new Date(a.used_at!).getTime())
    .slice(0, 20)
    .map((c) => ({
      referrer: memberMap.get(c.member_id) || "Desconhecido",
      referred: memberMap.get(c.used_by!) || "Desconhecido",
      date: c.used_at!,
    }));

  return { totalCodes, totalUsed, conversionRate, topReferrers, recentReferrals };
}

export async function getReferralTree(): Promise<
  Array<{
    id: string;
    full_name: string;
    company: string | null;
    referral_count: number;
    referred: Array<{ id: string; full_name: string; company: string | null; created_at: string }>;
  }>
> {
  const supabase = createClient();

  const { data: members } = await supabase
    .from("members")
    .select("id, full_name, company, referred_by, referral_count, created_at")
    .order("referral_count", { ascending: false });

  if (!members) return [];

  const referrerMap = new Map<string, Array<{ id: string; full_name: string; company: string | null; created_at: string }>>();

  members.forEach((m) => {
    if (m.referred_by) {
      const existing = referrerMap.get(m.referred_by) || [];
      existing.push({ id: m.id, full_name: m.full_name, company: m.company, created_at: m.created_at });
      referrerMap.set(m.referred_by, existing);
    }
  });

  return members
    .filter((m) => m.referral_count > 0 || referrerMap.has(m.id))
    .map((m) => ({
      id: m.id,
      full_name: m.full_name,
      company: m.company,
      referral_count: m.referral_count,
      referred: referrerMap.get(m.id) || [],
    }));
}

export async function getMyReferrals(memberId: string): Promise<
  Array<{ id: string; full_name: string; company: string | null; status: string; created_at: string }>
> {
  const supabase = createClient();
  const { data } = await supabase
    .from("members")
    .select("id, full_name, company, status, created_at")
    .eq("referred_by", memberId)
    .order("created_at", { ascending: false });

  return data || [];
}

// ── Referral Rewards / Bonificação ────────────────────────────────────

const REWARD_TIERS: Array<{
  milestone: number;
  type: ReferralRewardType;
  label: string;
  discount_pct: number;
}> = [
  { milestone: 1, type: "discount_10", label: "10% de desconto na próxima anuidade", discount_pct: 10 },
  { milestone: 3, type: "discount_20", label: "20% de desconto na próxima anuidade", discount_pct: 20 },
  { milestone: 5, type: "vip_ambassador", label: "VIP Ambassador + 50% na anuidade", discount_pct: 50 },
  { milestone: 10, type: "lifetime_ambassador", label: "Lifetime Ambassador + anuidade grátis", discount_pct: 100 },
];

export async function getRewardTiers() {
  return REWARD_TIERS;
}

export async function checkAndGrantRewards(referrerId: string): Promise<ReferralReward | null> {
  const auth = await requireAdmin();
  if (!auth) return null;
  const { supabase } = auth;

  const { count } = await supabase
    .from("members")
    .select("id", { count: "exact", head: true })
    .eq("referred_by", referrerId)
    .eq("status", "ativo");

  const approvedCount = count || 0;

  const qualifiedTier = [...REWARD_TIERS]
    .reverse()
    .find((t) => approvedCount >= t.milestone);

  if (!qualifiedTier) return null;

  const { data: existingRewards } = await supabase
    .from("referral_rewards")
    .select("reward_type, milestone")
    .eq("member_id", referrerId);

  const alreadyHas = (existingRewards || []).some(
    (r) => r.milestone >= qualifiedTier.milestone
  );

  if (alreadyHas) return null;

  const { data: reward, error } = await supabase
    .from("referral_rewards")
    .insert({
      member_id: referrerId,
      reward_type: qualifiedTier.type,
      status: "earned",
      milestone: qualifiedTier.milestone,
      discount_pct: qualifiedTier.discount_pct,
      label: qualifiedTier.label,
    })
    .select()
    .single();

  if (error) {
    console.error("Error granting reward:", error);
    return null;
  }

  revalidatePath("/referrals");
  return reward as ReferralReward;
}

export async function getMyRewards(memberId: string): Promise<ReferralReward[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("referral_rewards")
    .select("*")
    .eq("member_id", memberId)
    .order("milestone", { ascending: true });

  return (data || []) as ReferralReward[];
}

export async function getAllRewards(): Promise<
  Array<ReferralReward & { member_name: string; member_company: string | null }>
> {
  const supabase = createClient();
  const { data } = await supabase
    .from("referral_rewards")
    .select("*, members!referral_rewards_member_id_fkey(full_name, company)")
    .order("earned_at", { ascending: false });

  return (data || []).map((r) => {
    const member = r.members as unknown as { full_name: string; company: string | null } | null;
    return {
      ...r,
      member_name: member?.full_name || "Desconhecido",
      member_company: member?.company || null,
    };
  }) as Array<ReferralReward & { member_name: string; member_company: string | null }>;
}

export async function redeemReward(rewardId: string): Promise<{ success: boolean; error?: string }> {
  const auth = await requireAdmin();
  if (!auth) return { success: false, error: "Apenas diretoria pode resgatar bonificações" };
  const { supabase, callerId } = auth;

  const { error } = await supabase
    .from("referral_rewards")
    .update({
      status: "redeemed",
      redeemed_at: new Date().toISOString(),
      redeemed_by: callerId,
    })
    .eq("id", rewardId)
    .eq("status", "earned");

  if (error) return { success: false, error: error.message };
  revalidatePath("/referrals");
  return { success: true };
}

export async function getRewardSummary(): Promise<{
  totalEarned: number;
  totalRedeemed: number;
  totalPending: number;
  totalDiscountValue: number;
}> {
  const supabase = createClient();
  const { data } = await supabase
    .from("referral_rewards")
    .select("status, discount_pct");

  const rewards = data || [];
  const summary = rewards.reduce(
    (acc, r) => {
      if (r.status === "redeemed") acc.totalRedeemed++;
      if (r.status === "earned") {
        acc.totalPending++;
        acc.totalDiscountValue += r.discount_pct;
      }
      return acc;
    },
    { totalRedeemed: 0, totalPending: 0, totalDiscountValue: 0 },
  );

  return { totalEarned: rewards.length, ...summary };
}
