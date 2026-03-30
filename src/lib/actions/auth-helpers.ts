"use server";
import { createClient } from "@/lib/supabase/server";
import { ADMIN_ROLES } from "@/lib/utils";

/** Requires authenticated user — returns supabase client + member data */
export async function requireAuth() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) throw new Error("Unauthorized");
  const { data: member } = await supabase
    .from("members")
    .select("id, role, email")
    .eq("email", user.email)
    .single();
  if (!member) throw new Error("Member not found");
  return { supabase, memberId: member.id, memberRole: member.role, memberEmail: member.email };
}

/** Requires authenticated admin — returns supabase client + admin data */
export async function requireAdmin() {
  const { supabase, memberId, memberRole } = await requireAuth();
  if (!(ADMIN_ROLES as readonly string[]).includes(memberRole)) {
    throw new Error("Forbidden: admin role required");
  }
  return { supabase, callerId: memberId, callerRole: memberRole };
}
