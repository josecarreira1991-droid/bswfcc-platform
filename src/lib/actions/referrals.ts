"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Referral } from "@/types/database";

// ── Legacy referral functions (keep for backwards compat) ──────────────

export async function getReferrals(memberId?: string) {
  const supabase = createClient();
  let query = supabase.from("referrals").select("*, members!referrals_referrer_id_fkey(full_name, company)").order("created_at", { ascending: false });
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

// ── New referral CODE system ───────────────────────────────────────────

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function generateReferralCode(memberId: string): Promise<{ code: string } | { error: string }> {
  const supabase = createClient();

  // Deactivate any existing active codes for this member
  await supabase
    .from("referral_codes")
    .update({ is_active: false })
    .eq("member_id", memberId)
    .eq("is_active", true);

  // Generate a unique code with retry
  let code = generateCode();
  let attempts = 0;
  while (attempts < 10) {
    const { data: existing } = await supabase
      .from("referral_codes")
      .select("id")
      .eq("code", code)
      .single();

    if (!existing) break;
    code = generateCode();
    attempts++;
  }

  if (attempts >= 10) {
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

  // Mark the code as used
  const { data: codeData, error: fetchError } = await supabase
    .from("referral_codes")
    .select("id, member_id")
    .eq("code", code.toUpperCase().trim())
    .eq("is_active", true)
    .single();

  if (fetchError || !codeData) {
    return { success: false, error: "Código inválido ou já utilizado." };
  }

  // Deactivate the code
  const { error: updateError } = await supabase
    .from("referral_codes")
    .update({
      is_active: false,
      used_by: newMemberId,
      used_at: new Date().toISOString(),
    })
    .eq("id", codeData.id);

  if (updateError) return { success: false, error: updateError.message };

  // Increment referral_count on the referring member
  const { data: referrer } = await supabase
    .from("members")
    .select("referral_count")
    .eq("id", codeData.member_id)
    .single();

  const currentCount = referrer?.referral_count || 0;
  await supabase
    .from("members")
    .update({ referral_count: currentCount + 1 })
    .eq("id", codeData.member_id);

  // Set referred_by on the new member
  await supabase
    .from("members")
    .update({ referred_by: codeData.member_id })
    .eq("id", newMemberId);

  // Generate a new code for the referring member (code rotation)
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

  // Get all used referral codes with member info
  const { data: codes } = await supabase
    .from("referral_codes")
    .select("id, member_id, code, is_active, used_by, used_at, created_at")
    .order("created_at", { ascending: false });

  // Get all members with referral info
  const { data: members } = await supabase
    .from("members")
    .select("id, full_name, company, referred_by, referral_count, created_at")
    .order("referral_count", { ascending: false });

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
    .sort((a, b) => b.referral_count - a.referral_count)
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
