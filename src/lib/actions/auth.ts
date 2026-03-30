"use server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
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

  // New extended fields
  const website = formData.get("website") as string;
  const linkedinUrl = formData.get("linkedin_url") as string;
  const instagram = formData.get("instagram") as string;
  const facebook = formData.get("facebook") as string;
  const ein = formData.get("ein") as string;
  const bio = formData.get("bio") as string;
  const servicesRaw = formData.get("services_offered") as string;
  const servicesOffered = servicesRaw
    ? servicesRaw.split(",").map((s) => s.trim()).filter(Boolean)
    : null;
  const tierSlug = (formData.get("tier_slug") as string) || "community";
  const referralCode = formData.get("referral_code") as string;

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
    const { data: memberData, error: profileError } = await supabase.from("members").insert({
      full_name: fullName,
      email,
      phone: phone || undefined,
      role,
      status: "pendente",
      company: company || undefined,
      industry: industry || undefined,
      city: city || undefined,
      website: website || undefined,
      linkedin_url: linkedinUrl || undefined,
      instagram: instagram || undefined,
      facebook: facebook || undefined,
      ein: ein || undefined,
      bio: bio || undefined,
      services_offered: servicesOffered || undefined,
      tier_slug: tierSlug,
    }).select("id").single();

    if (profileError) {
      // Delete orphaned auth user using service_role to prevent stuck registration
      try {
        const adminClient = createServiceClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        await adminClient.auth.admin.deleteUser(authData.user!.id);
      } catch {
        // Fallback: at minimum sign out the broken session
        await supabase.auth.signOut();
      }
      return { error: "Erro ao criar perfil. Tente novamente." };
    }

    // Process referral code if provided
    if (referralCode && memberData?.id) {
      const { useReferralCode, generateReferralCode } = await import("@/lib/actions/referrals");
      await useReferralCode(referralCode, memberData.id);
      await generateReferralCode(memberData.id);
    } else if (memberData?.id) {
      // Generate a referral code for the new member even without referral
      const { generateReferralCode } = await import("@/lib/actions/referrals");
      await generateReferralCode(memberData.id);
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
  if (!user || !user.email) return null;

  const { data: member } = await supabase
    .from("members")
    .select("*")
    .eq("email", user.email)
    .single();

  return member;
}
