"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

import { ADMIN_ROLES } from "@/lib/utils";

async function requireAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: caller } = await supabase
    .from("members")
    .select("role")
    .eq("email", user.email!)
    .single();

  if (!caller || !(ADMIN_ROLES as readonly string[]).includes(caller.role)) {
    throw new Error("Forbidden: admin role required");
  }
  return { supabase };
}

export async function getMarketData() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("market_data")
    .select("*")
    .order("category");
  if (error) throw error;
  return data;
}

export async function getMarketDataByCategory(category: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("market_data")
    .select("*")
    .eq("category", category)
    .order("indicator");
  if (error) throw error;
  return data;
}

export async function createMarketData(formData: FormData) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase.from("market_data").insert({
    indicator: formData.get("indicator") as string,
    value: formData.get("value") as string,
    category: formData.get("category") as string,
    source: (formData.get("source") as string) || null,
    updated_at: new Date().toISOString(),
  });
  if (error) return { error: error.message };
  revalidatePath("/mercado");
  return { success: true };
}

export async function updateMarketData(id: string, formData: FormData) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("market_data")
    .update({
      indicator: formData.get("indicator") as string,
      value: formData.get("value") as string,
      category: formData.get("category") as string,
      source: (formData.get("source") as string) || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/mercado");
  return { success: true };
}

export async function deleteMarketData(id: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("market_data").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/mercado");
  return { success: true };
}

export async function getDirectors() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("directors")
    .select("*")
    .order("order_index");
  if (error) throw error;
  return data;
}
