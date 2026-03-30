"use server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { MemberRole } from "@/types/database";

export async function login(formData: FormData) {
  const supabase = createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  const rawRedirect = formData.get("redirect") as string;
  const safeRedirect = rawRedirect && rawRedirect.startsWith("/") && !rawRedirect.startsWith("//")
    ? rawRedirect
    : "/dashboard";
  revalidatePath("/", "layout");
  redirect(safeRedirect);
}

export async function register(formData: FormData) {
  const supabase = createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("full_name") as string;
  const requestedRole = formData.get("role") as string;
  const ALLOWED_SELF_REGISTER_ROLES: MemberRole[] = ["membro", "parceiro_estrategico", "voluntario"];
  const role: MemberRole = ALLOWED_SELF_REGISTER_ROLES.includes(requestedRole as MemberRole)
    ? (requestedRole as MemberRole)
    : "membro";
  const company = formData.get("company") as string;
  const phone = formData.get("phone") as string;
  const city = formData.get("city") as string;
  const industry = formData.get("industry") as string;

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, role },
    },
  });

  if (authError) {
    return { error: authError.message };
  }

  if (authData.user) {
    const { error: profileError } = await supabase.from("members").insert({
      full_name: fullName,
      email,
      phone: phone || undefined,
      role,
      status: "pendente",
      company: company || undefined,
      industry: industry || undefined,
      city: city || undefined,
    });

    if (profileError) {
      // Cleanup orphaned auth user to prevent stuck login state
      await supabase.auth.signOut();
      return { error: "Erro ao criar perfil. Tente novamente." };
    }
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function getSession() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentMember() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: member } = await supabase
    .from("members")
    .select("*")
    .eq("email", user.email!)
    .single();

  return member;
}
