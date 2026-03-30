"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "./auth-helpers";
import type { BotConfig } from "@/types/database";

export async function getBotConfig(): Promise<BotConfig | null> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("bot_config")
    .select("*")
    .limit(1)
    .single();
  if (error) return null;
  return data as BotConfig;
}

export async function updateBotConfig(updates: Partial<BotConfig>) {
  const { supabase } = await requireAdmin();

  const ALLOWED: (keyof BotConfig)[] = [
    "is_active", "model", "system_prompt", "max_tokens",
    "temperature", "auto_reply_enabled", "auto_reply_delay_ms",
    "working_hours_only", "working_hours_start", "working_hours_end",
  ];

  const sanitized: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const key of ALLOWED) {
    if (key in updates) sanitized[key] = updates[key];
  }

  const { error } = await supabase
    .from("bot_config")
    .upsert(sanitized, { onConflict: "id", ignoreDuplicates: false });
  if (error) return { error: error.message };

  revalidatePath("/configuracoes");
  return { success: true };
}
