"use server";
import { createClient } from "@/lib/supabase/server";
import { ADMIN_ROLES } from "@/lib/utils";

export async function requireAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const { data: caller } = await supabase
    .from("members")
    .select("id, role")
    .eq("email", user.email!)
    .single();
  if (!caller || !(ADMIN_ROLES as readonly string[]).includes(caller.role)) {
    throw new Error("Forbidden: admin role required");
  }
  return { supabase, callerId: caller.id, callerRole: caller.role };
}
