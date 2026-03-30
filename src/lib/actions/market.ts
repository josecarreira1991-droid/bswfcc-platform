"use server";
import { createClient } from "@/lib/supabase/server";

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

export async function getDirectors() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("directors")
    .select("*")
    .order("order_index");
  if (error) throw error;
  return data;
}
