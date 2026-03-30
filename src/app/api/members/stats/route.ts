import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: members, error } = await supabase.from("members").select("role, status, industry, city");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const total = members.length;
  const ativos = members.filter((m) => m.status === "ativo").length;
  const pendentes = members.filter((m) => m.status === "pendente").length;

  const byRole: Record<string, number> = {};
  const byIndustry: Record<string, number> = {};
  const byCity: Record<string, number> = {};

  members.forEach((m) => {
    byRole[m.role] = (byRole[m.role] || 0) + 1;
    if (m.industry) byIndustry[m.industry] = (byIndustry[m.industry] || 0) + 1;
    if (m.city) byCity[m.city] = (byCity[m.city] || 0) + 1;
  });

  return NextResponse.json({ total, ativos, pendentes, byRole, byIndustry, byCity });
}
