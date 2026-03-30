"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Referral } from "@/types/database";

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

export async function getReferralStats() {
  const supabase = createClient();
  const { data } = await supabase.from("referrals").select("referrer_id, status");
  if (!data) return { total: 0, byStatus: {} as Record<string, number>, topReferrers: [] as string[] };

  const byStatus: Record<string, number> = {};
  const byReferrer: Record<string, number> = {};
  data.forEach((r) => {
    byStatus[r.status] = (byStatus[r.status] || 0) + 1;
    byReferrer[r.referrer_id] = (byReferrer[r.referrer_id] || 0) + 1;
  });

  return { total: data.length, byStatus, topReferrers: Object.entries(byReferrer).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id]) => id) };
}
