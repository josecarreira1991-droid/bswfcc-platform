"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Member, MemberRole, MemberStatus } from "@/types/database";

const ADMIN_ROLES = ["presidente", "vice_presidente", "secretario", "tesoureiro", "diretor_tecnologia"];

async function requireAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: caller } = await supabase
    .from("members")
    .select("role")
    .eq("email", user.email!)
    .single();

  if (!caller || !ADMIN_ROLES.includes(caller.role)) {
    throw new Error("Forbidden: admin role required");
  }
  return { supabase, caller };
}

export async function getMembers() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("members")
    .select("id, full_name, role, status, company, industry, city, linkedin, bio, avatar_url, created_at, email, phone")
    .eq("status", "ativo")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Member[];
}

export async function getAllMembers() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Member[];
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
  const { data: members } = await supabase.from("members").select("role, status, industry");
  if (!members) return { total: 0, ativos: 0, pendentes: 0, inativos: 0, byRole: {} as Record<string, number>, byIndustry: {} as Record<string, number> };

  const ativos = members.filter((m) => m.status === "ativo").length;
  const pendentes = members.filter((m) => m.status === "pendente").length;
  const inativos = members.filter((m) => m.status === "inativo").length;
  const byRole: Record<string, number> = {};
  const byIndustry: Record<string, number> = {};
  members.forEach((m) => {
    byRole[m.role] = (byRole[m.role] || 0) + 1;
    if (m.industry) {
      byIndustry[m.industry] = (byIndustry[m.industry] || 0) + 1;
    }
  });

  return { total: members.length, ativos, pendentes, inativos, byRole, byIndustry };
}

export async function updateMember(id: string, updates: Partial<Member>) {
  const { supabase, caller } = await requireAdmin();

  const ALLOWED_FIELDS = ["full_name", "phone", "company", "industry", "city", "linkedin", "bio", "avatar_url", "status", "role"];
  const PROTECTED_ROLES = ["presidente", "vice_presidente", "secretario", "tesoureiro"];
  const sanitized: Record<string, unknown> = {};
  for (const key of ALLOWED_FIELDS) {
    if (key in updates) sanitized[key] = updates[key as keyof typeof updates];
  }

  if ("role" in sanitized && PROTECTED_ROLES.includes(sanitized.role as string)) {
    if (caller.role !== "presidente") {
      throw new Error("Only the presidente can assign executive roles");
    }
  }

  const { error } = await supabase.from("members").update(sanitized).eq("id", id);
  if (error) throw error;
  revalidatePath("/membros");
  revalidatePath("/dashboard");
}

export async function approveMember(id: string) {
  return updateMember(id, { status: "ativo" as MemberStatus });
}

export async function rejectMember(id: string) {
  return updateMember(id, { status: "inativo" as MemberStatus });
}

export async function updateMyProfile(updates: Record<string, unknown>) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: member } = await supabase
    .from("members")
    .select("id")
    .eq("email", user.email!)
    .single();

  if (!member) throw new Error("Member not found");

  const SAFE_FIELDS = ["full_name", "phone", "company", "industry", "city", "linkedin", "bio", "avatar_url", "website", "linkedin_url", "instagram", "facebook"];
  const sanitized: Record<string, unknown> = {};
  for (const key of SAFE_FIELDS) {
    if (key in updates) sanitized[key] = updates[key];
  }

  const { error } = await supabase.from("members").update(sanitized).eq("id", member.id);
  if (error) throw error;
  revalidatePath("/perfil");
}

export async function addMember(formData: FormData) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase.from("members").insert({
    full_name: formData.get("full_name") as string,
    email: formData.get("email") as string,
    phone: (formData.get("phone") as string) || null,
    role: (formData.get("role") as MemberRole) || "membro",
    status: "ativo" as MemberStatus,
    company: (formData.get("company") as string) || null,
    industry: (formData.get("industry") as string) || null,
    city: (formData.get("city") as string) || null,
    linkedin: (formData.get("linkedin") as string) || null,
    bio: (formData.get("bio") as string) || null,
  });

  if (error) return { error: error.message };
  revalidatePath("/membros");
  revalidatePath("/dashboard");
  return { success: true };
}
