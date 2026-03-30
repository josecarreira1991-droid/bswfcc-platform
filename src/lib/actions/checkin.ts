"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { requireAuth } from "./auth-helpers";
import { APP_URL, ADMIN_ROLES } from "@/lib/utils";
import type { EventCheckin } from "@/types/database";

export async function checkInToEvent(eventId: string, memberId: string, method: "qr" | "manual" = "qr") {
  const { supabase, memberId: callerId, memberRole } = await requireAuth();
  // Only allow checking in yourself, or admins checking in others
  if (memberId !== callerId && !(ADMIN_ROLES as readonly string[]).includes(memberRole)) {
    return { error: "Sem permissão para fazer check-in de outro membro" };
  }
  const { error } = await supabase.from("event_checkins").insert({
    event_id: eventId,
    member_id: memberId,
    check_in_method: method,
  });
  if (error) {
    if (error.code === "23505") return { error: "Já realizou check-in neste evento" };
    return { error: error.message };
  }
  revalidatePath("/eventos");
  return { success: true };
}

export async function getEventCheckins(eventId: string) {
  const { supabase } = await requireAuth();
  const { data, error } = await supabase
    .from("event_checkins")
    .select("*, members(full_name, company, email)")
    .eq("event_id", eventId)
    .order("checked_in_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getCheckinCount(eventId: string) {
  const { supabase } = await requireAuth();
  const { count } = await supabase
    .from("event_checkins")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId);
  return count || 0;
}

export function generateEventQRData(eventId: string): string {
  return `${APP_URL}/api/checkin/${eventId}`;
}
