"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { calculateMatchScore } from "@/lib/utils";
import type { BusinessProfile, NetworkingSuggestion } from "@/types/database";

export async function generateNetworkingSuggestions(memberId: string) {
  const supabase = createClient();

  const { data: myProfile } = await supabase
    .from("business_profiles")
    .select("*")
    .eq("member_id", memberId)
    .single();

  if (!myProfile) return { error: "Complete seu Business Profile primeiro" };

  const { data: profiles } = await supabase
    .from("business_profiles")
    .select("*")
    .eq("is_visible", true)
    .neq("member_id", memberId);

  if (!profiles || profiles.length === 0) return { suggestions: [] };

  const scored = profiles
    .map((p) => {
      const { score, reasons } = calculateMatchScore(myProfile as BusinessProfile, p as BusinessProfile);
      return { profile: p, score, reasons };
    })
    .filter((s) => s.score > 15)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  const rows = scored.map((s) => ({
    member_id: memberId,
    suggested_member_id: s.profile.member_id,
    score: s.score,
    reasons: s.reasons,
    status: "pending" as const,
  }));
  if (rows.length > 0) {
    await supabase
      .from("networking_suggestions")
      .upsert(rows, { onConflict: "member_id,suggested_member_id" });
  }

  revalidatePath("/networking");
  return { suggestions: scored.length };
}

export async function getMySuggestions(memberId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("networking_suggestions")
    .select("*, members!networking_suggestions_suggested_member_id_fkey(full_name, company, industry, city, avatar_url)")
    .eq("member_id", memberId)
    .in("status", ["pending", "seen"])
    .order("score", { ascending: false })
    .limit(20);
  if (error) throw error;
  return data;
}

export async function updateSuggestionStatus(id: string, status: "seen" | "connected" | "dismissed") {
  const supabase = createClient();
  const { error } = await supabase
    .from("networking_suggestions")
    .update({ status })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/networking");
  return { success: true };
}
