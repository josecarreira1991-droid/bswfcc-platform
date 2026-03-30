"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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
  const supabase = createClient();
  const { error } = await supabase.from("events").insert({
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    date: formData.get("date") as string,
    time: formData.get("time") as string,
    location: formData.get("location") as string,
    type: formData.get("type") as "networking" | "palestra" | "workshop" | "gala" | "almoco" | "outro",
    max_attendees: formData.get("max_attendees") ? Number(formData.get("max_attendees")) : undefined,
    is_public: formData.get("is_public") === "true",
  });
  if (error) return { error: error.message };
  revalidatePath("/eventos");
}

export async function registerForEvent(eventId: string, memberId: string) {
  const supabase = createClient();
  const { error } = await supabase.from("event_registrations").insert({
    event_id: eventId,
    member_id: memberId,
    registered_at: new Date().toISOString(),
    status: "confirmado",
  });
  if (error) return { error: error.message };
  revalidatePath("/eventos");
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
