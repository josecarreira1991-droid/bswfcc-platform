import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const searchParams = request.nextUrl.searchParams;
  const role = searchParams.get("role");
  const status = searchParams.get("status");

  let query = supabase.from("members").select("*").order("created_at", { ascending: false });
  if (role) query = query.eq("role", role);
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

const ALLOWED_MEMBER_UPDATE_FIELDS = ["full_name", "phone", "company", "industry", "city", "linkedin", "bio", "avatar_url"] as const;
const ADMIN_ROLES = ["presidente", "vice_presidente", "secretario", "tesoureiro", "diretor_tecnologia"];

export async function PATCH(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { id } = body;

  if (!id) return NextResponse.json({ error: "Member ID required" }, { status: 400 });

  const { data: caller } = await supabase
    .from("members")
    .select("role")
    .eq("email", user.email!)
    .single();

  if (!caller || !ADMIN_ROLES.includes(caller.role)) {
    return NextResponse.json({ error: "Forbidden: admin role required" }, { status: 403 });
  }

  const sanitized: Record<string, unknown> = {};
  for (const key of ALLOWED_MEMBER_UPDATE_FIELDS) {
    if (key in body) sanitized[key] = body[key];
  }

  if (Object.keys(sanitized).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const { data, error } = await supabase.from("members").update(sanitized).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}
