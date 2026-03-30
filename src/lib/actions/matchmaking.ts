"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { requireAuth } from "./auth-helpers";
import { ADMIN_ROLES } from "@/lib/utils";
import type { BusinessProfile, MatchRequest } from "@/types/database";

export async function getBusinessProfile(memberId: string) {
  const { supabase } = await requireAuth();
  const { data } = await supabase
    .from("business_profiles")
    .select("*")
    .eq("member_id", memberId)
    .single();
  return data as BusinessProfile | null;
}

export async function getVisibleProfiles() {
  const { supabase } = await requireAuth();
  const { data, error } = await supabase
    .from("business_profiles")
    .select("*, members(full_name, company, industry, city, avatar_url)")
    .eq("is_visible", true)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function upsertBusinessProfile(memberId: string, formData: FormData) {
  const { supabase, memberId: callerId, memberRole } = await requireAuth();
  if (memberId !== callerId && !(ADMIN_ROLES as readonly string[]).includes(memberRole)) {
    return { error: "Sem permissão para editar perfil de outro membro" };
  }
  const splitTags = (val: string) => val.split(",").map((s) => s.trim()).filter(Boolean);

  const profile = {
    member_id: memberId,
    business_name: (formData.get("business_name") as string) || null,
    business_type: (formData.get("business_type") as string) || null,
    description: (formData.get("description") as string) || null,
    services_offered: splitTags(formData.get("services_offered") as string || ""),
    services_needed: splitTags(formData.get("services_needed") as string || ""),
    target_industries: splitTags(formData.get("target_industries") as string || ""),
    languages: splitTags(formData.get("languages") as string || "en,pt"),
    website: (formData.get("website") as string) || null,
    year_established: formData.get("year_established") ? Number(formData.get("year_established")) : null,
    employee_count: (formData.get("employee_count") as string) || null,
    looking_for: splitTags(formData.get("looking_for") as string || ""),
    tags: splitTags(formData.get("tags") as string || ""),
    is_visible: formData.get("is_visible") !== "false",
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("business_profiles")
    .upsert(profile, { onConflict: "member_id" });
  if (error) return { error: error.message };
  revalidatePath("/matchmaking");
  return { success: true };
}

export async function sendMatchRequest(fromId: string, toId: string, message?: string, score?: number, reason?: string) {
  const { supabase, memberId: callerId } = await requireAuth();
  if (fromId !== callerId) return { error: "Sem permissão" };

  // Use upsert to handle re-sending to the same member (e.g., after declined)
  const { error } = await supabase.from("match_requests").upsert(
    {
      from_member_id: fromId,
      to_member_id: toId,
      message: message || null,
      match_score: score || null,
      match_reason: reason || null,
      status: "pending",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "from_member_id,to_member_id" }
  );
  if (error) return { error: error.message };
  revalidatePath("/matchmaking");
  return { success: true };
}

export async function respondToMatch(requestId: string, status: "accepted" | "declined") {
  const { supabase } = await requireAuth();
  const { error } = await supabase
    .from("match_requests")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", requestId);
  if (error) return { error: error.message };
  revalidatePath("/matchmaking");
  return { success: true };
}

export async function getMyMatchRequests(memberId: string) {
  const { supabase, memberId: callerId } = await requireAuth();
  if (memberId !== callerId) throw new Error("Forbidden");
  const [sent, received] = await Promise.all([
    supabase.from("match_requests").select("*, members!match_requests_to_member_id_fkey(full_name, company)").eq("from_member_id", memberId).order("created_at", { ascending: false }),
    supabase.from("match_requests").select("*, members!match_requests_from_member_id_fkey(full_name, company)").eq("to_member_id", memberId).order("created_at", { ascending: false }),
  ]);
  return { sent: sent.data || [], received: received.data || [] };
}

