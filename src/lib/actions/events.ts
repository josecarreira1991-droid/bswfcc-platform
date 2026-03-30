"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

import { ADMIN_ROLES } from "@/lib/utils";
import { requireAdmin } from "@/lib/actions/auth-helpers";

export async function getEvents() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("date", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getUpcomingEvents(limit = 5) {
  const supabase = createClient();
  const today = new Date().toISOString().split("T")[0];
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .gte("date", today)
    .order("date", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function createEvent(formData: FormData) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase.from("events").insert({
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || null,
    date: formData.get("date") as string,
    time: (formData.get("time") as string) || null,
    location: (formData.get("location") as string) || null,
    type: formData.get("type") as "networking" | "palestra" | "workshop" | "gala" | "almoco" | "outro",
    max_attendees: formData.get("max_attendees") ? Number(formData.get("max_attendees")) : null,
    is_public: formData.get("is_public") === "true",
  });
  if (error) return { error: error.message };
  revalidatePath("/eventos");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateEvent(id: string, formData: FormData) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("events")
    .update({
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || null,
      date: formData.get("date") as string,
      time: (formData.get("time") as string) || null,
      location: (formData.get("location") as string) || null,
      type: formData.get("type") as "networking" | "palestra" | "workshop" | "gala" | "almoco" | "outro",
      max_attendees: formData.get("max_attendees") ? Number(formData.get("max_attendees")) : null,
      is_public: formData.get("is_public") === "true",
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/eventos");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteEvent(id: string) {
  const { supabase } = await requireAdmin();

  // Delete registrations first
  await supabase.from("event_registrations").delete().eq("event_id", id);

  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/eventos");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function registerForEvent(eventId: string, memberId: string) {
  const supabase = createClient();
  // Verify authenticated user matches memberId (prevent registering others)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { error: "Unauthorized" };
  const { data: caller } = await supabase.from("members").select("id, role").eq("email", user.email).single();
  if (!caller) return { error: "Membro não encontrado" };
  if (caller.id !== memberId && !(ADMIN_ROLES as readonly string[]).includes(caller.role)) {
    return { error: "Sem permissão para inscrever outro membro" };
  }
  const { error } = await supabase.from("event_registrations").insert({
    event_id: eventId,
    member_id: memberId,
    registered_at: new Date().toISOString(),
    status: "confirmado",
  });
  if (error) return { error: error.message };
  revalidatePath("/eventos");
  return { success: true };
}

export async function getEventRegistrations(eventId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("event_registrations")
    .select("*, members(*)")
    .eq("event_id", eventId)
    .eq("status", "confirmado");
  if (error) throw error;
  return data;
}

export async function getEventRegistrationCount(eventId: string) {
  const supabase = createClient();
  const { count, error } = await supabase
    .from("event_registrations")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId)
    .eq("status", "confirmado");
  if (error) return 0;
  return count || 0;
}
