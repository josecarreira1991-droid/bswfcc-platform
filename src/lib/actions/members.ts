"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Member } from "@/types/database";

export async function getMembers() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getMembersByRole(role: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("role", role)
    .eq("status", "ativo")
    .order("full_name");
  if (error) throw error;
  return data;
}

export async function getMemberStats() {
  const supabase = createClient();
  const { data: members } = await supabase.from("members").select("role, status");
  if (!members) return { total: 0, ativos: 0, pendentes: 0, byRole: {} as Record<string, number> };

  const ativos = members.filter((m) => m.status === "ativo").length;
  const pendentes = members.filter((m) => m.status === "pendente").length;
  const byRole: Record<string, number> = {};
  members.forEach((m) => {
    byRole[m.role] = (byRole[m.role] || 0) + 1;
  });

  return { total: members.length, ativos, pendentes, byRole };
}

export async function updateMember(id: string, updates: Partial<Member>) {
  const supabase = createClient();
  const { error } = await supabase.from("members").update(updates).eq("id", id);
  if (error) throw error;
  revalidatePath("/membros");
}

export async function approveMember(id: string) {
  return updateMember(id, { status: "ativo" });
}
