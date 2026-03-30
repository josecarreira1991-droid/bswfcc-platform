"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Report } from "@/types/database";

import { ADMIN_ROLES } from "@/lib/utils";

async function requireAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) throw new Error("Unauthorized");
  const { data: caller } = await supabase
    .from("members")
    .select("id, role")
    .eq("email", user.email)
    .single();
  if (!caller || !(ADMIN_ROLES as readonly string[]).includes(caller.role)) throw new Error("Forbidden");
  return { supabase, callerId: caller.id };
}

export async function getReports(type?: string) {
  const supabase = createClient();
  let query = supabase
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  if (type) query = query.eq("type", type);
  const { data, error } = await query;
  if (error) throw error;
  return data as Report[];
}

export async function generateMembersReport() {
  const { supabase, callerId } = await requireAdmin();

  const { data: members } = await supabase
    .from("members")
    .select("full_name, email, role, status, company, industry, city, created_at");

  if (!members) throw new Error("No members data");

  const total = members.length;
  const byStatus: Record<string, number> = {};
  const byRole: Record<string, number> = {};
  const byIndustry: Record<string, number> = {};
  const byCity: Record<string, number> = {};
  const byMonth: Record<string, number> = {};

  members.forEach((m) => {
    byStatus[m.status] = (byStatus[m.status] || 0) + 1;
    byRole[m.role] = (byRole[m.role] || 0) + 1;
    if (m.industry) byIndustry[m.industry] = (byIndustry[m.industry] || 0) + 1;
    if (m.city) byCity[m.city] = (byCity[m.city] || 0) + 1;
    const month = m.created_at.slice(0, 7);
    byMonth[month] = (byMonth[month] || 0) + 1;
  });

  const reportData = { total, byStatus, byRole, byIndustry, byCity, byMonth, generatedAt: new Date().toISOString() };

  const { data: report, error } = await supabase
    .from("reports")
    .insert({
      title: `Relatório de Membros — ${new Date().toLocaleDateString("pt-BR")}`,
      type: "members",
      generated_by: callerId,
      data: reportData,
    })
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/relatorios");
  return report as Report;
}

export async function generateEventsReport() {
  const { supabase, callerId } = await requireAdmin();

  const { data: events } = await supabase.from("events").select("*");
  const { data: registrations } = await supabase
    .from("event_registrations")
    .select("event_id, status");

  if (!events) throw new Error("No events data");

  const today = new Date().toISOString().split("T")[0];
  const upcoming = events.filter((e) => e.date >= today).length;
  const past = events.filter((e) => e.date < today).length;
  const byType: Record<string, number> = {};
  events.forEach((e) => {
    byType[e.type] = (byType[e.type] || 0) + 1;
  });

  const regsByEvent: Record<string, number> = {};
  (registrations || []).forEach((r) => {
    if (r.status === "confirmado") {
      regsByEvent[r.event_id] = (regsByEvent[r.event_id] || 0) + 1;
    }
  });

  const avgAttendance = Object.values(regsByEvent).length > 0
    ? Math.round(Object.values(regsByEvent).reduce((a, b) => a + b, 0) / Object.values(regsByEvent).length)
    : 0;

  const reportData = {
    total: events.length, upcoming, past, byType, avgAttendance,
    totalRegistrations: (registrations || []).filter((r) => r.status === "confirmado").length,
    generatedAt: new Date().toISOString(),
  };

  const { data: report, error } = await supabase
    .from("reports")
    .insert({
      title: `Relatório de Eventos — ${new Date().toLocaleDateString("pt-BR")}`,
      type: "events",
      generated_by: callerId,
      data: reportData,
    })
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/relatorios");
  return report as Report;
}

export async function generateFinancialReport() {
  const { supabase, callerId } = await requireAdmin();

  const [subsResult, paymentsResult, tiersResult] = await Promise.all([
    supabase.from("subscriptions").select("status, tier_id, created_at"),
    supabase.from("payments").select("amount, status, created_at"),
    supabase.from("membership_tiers").select("id, name, price_monthly"),
  ]);

  const subs = subsResult.data || [];
  const payments = paymentsResult.data || [];
  const tiers = tiersResult.data || [];

  const activeSubs = subs.filter((s) => s.status === "active").length;
  let mrr = 0;
  subs.filter((s) => s.status === "active").forEach((s) => {
    const tier = tiers.find((t) => t.id === s.tier_id);
    if (tier) mrr += tier.price_monthly;
  });

  const successPayments = payments.filter((p) => p.status === "succeeded");
  const totalRevenue = successPayments.reduce((sum, p) => sum + p.amount, 0);

  const revenueByMonth: Record<string, number> = {};
  successPayments.forEach((p) => {
    const month = p.created_at.slice(0, 7);
    revenueByMonth[month] = (revenueByMonth[month] || 0) + p.amount;
  });

  const reportData = {
    mrr, totalRevenue, activeSubs,
    totalPayments: payments.length,
    successfulPayments: successPayments.length,
    failedPayments: payments.filter((p) => p.status === "failed").length,
    revenueByMonth,
    generatedAt: new Date().toISOString(),
  };

  const { data: report, error } = await supabase
    .from("reports")
    .insert({
      title: `Relatório Financeiro — ${new Date().toLocaleDateString("pt-BR")}`,
      type: "financial",
      generated_by: callerId,
      data: reportData,
    })
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/relatorios");
  return report as Report;
}
