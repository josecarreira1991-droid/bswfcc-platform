"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "./auth-helpers";
import type { Poll, PollOption } from "@/types/database";

export async function getPolls(status?: string) {
  const supabase = createClient();
  let query = supabase.from("polls").select("*").order("created_at", { ascending: false });
  if (status && status !== "all") query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw error;
  return data as Poll[];
}

export async function getPollWithOptions(pollId: string) {
  const supabase = createClient();
  const [pollResult, optionsResult] = await Promise.all([
    supabase.from("polls").select("*").eq("id", pollId).single(),
    supabase.from("poll_options").select("*").eq("poll_id", pollId).order("sort_order"),
  ]);
  if (pollResult.error) throw pollResult.error;
  return { poll: pollResult.data as Poll, options: (optionsResult.data || []) as PollOption[] };
}

export async function getPollResults(pollId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("poll_votes")
    .select("option_id, member_id")
    .eq("poll_id", pollId);
  if (error) throw error;

  const voteCounts: Record<string, number> = {};
  (data || []).forEach((v) => {
    voteCounts[v.option_id] = (voteCounts[v.option_id] || 0) + 1;
  });
  const totalVoters = new Set((data || []).map((v) => v.member_id)).size;

  return { voteCounts, totalVoters };
}

export async function createPoll(formData: FormData) {
  const { supabase, callerId } = await requireAdmin();

  const optionsRaw = (formData.get("options") as string || "").split("\n").map((s) => s.trim()).filter(Boolean);
  if (optionsRaw.length < 2) return { error: "Mínimo 2 opções" };

  const { data: poll, error } = await supabase
    .from("polls")
    .insert({
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || null,
      type: (formData.get("type") as string) || "single",
      status: (formData.get("status") as string) || "draft",
      created_by: callerId,
      starts_at: (formData.get("starts_at") as string) || null,
      ends_at: (formData.get("ends_at") as string) || null,
      is_anonymous: formData.get("is_anonymous") === "true",
    })
    .select()
    .single();

  if (error) return { error: error.message };

  const options = optionsRaw.map((label, i) => ({
    poll_id: poll.id,
    label,
    sort_order: i,
  }));
  await supabase.from("poll_options").insert(options);

  revalidatePath("/votacoes");
  return { success: true, pollId: poll.id };
}

export async function vote(pollId: string, optionId: string, memberId: string) {
  const supabase = createClient();

  const [{ data: poll }, { data: existing }] = await Promise.all([
    supabase.from("polls").select("type").eq("id", pollId).single(),
    supabase.from("poll_votes").select("id").eq("poll_id", pollId).eq("member_id", memberId),
  ]);

  if (!poll) return { error: "Poll not found" };
  if (poll.type === "single" && existing && existing.length > 0) {
    return { error: "Você já votou nesta enquete" };
  }

  const { error } = await supabase.from("poll_votes").insert({
    poll_id: pollId,
    option_id: optionId,
    member_id: memberId,
  });
  if (error) return { error: error.message };
  revalidatePath("/votacoes");
  return { success: true };
}

export async function updatePollStatus(pollId: string, status: Poll["status"]) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("polls").update({ status }).eq("id", pollId);
  if (error) return { error: error.message };
  revalidatePath("/votacoes");
  return { success: true };
}
