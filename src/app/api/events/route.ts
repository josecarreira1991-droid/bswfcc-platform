import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const searchParams = request.nextUrl.searchParams;
  const upcoming = searchParams.get("upcoming") === "true";

  let query = supabase.from("events").select("*").order("date", { ascending: true });
  if (upcoming) {
    const today = new Date().toISOString().split("T")[0];
    query = query.gte("date", today);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

const ADMIN_ROLES = ["presidente", "vice_presidente", "secretario", "tesoureiro", "diretor_tecnologia", "diretor_marketing"];

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: caller } = await supabase
    .from("members")
    .select("role")
    .eq("email", user.email!)
    .single();

  if (!caller || !ADMIN_ROLES.includes(caller.role)) {
    return NextResponse.json({ error: "Forbidden: admin role required" }, { status: 403 });
  }

  const body = await request.json();
  const { title, description, date, time, location, type, max_attendees, is_public } = body;

  if (!title || !date) {
    return NextResponse.json({ error: "title and date are required" }, { status: 400 });
  }

  const { data, error } = await supabase.from("events").insert({
    title: String(title),
    description: description ? String(description) : null,
    date: String(date),
    time: time ? String(time) : null,
    location: location ? String(location) : null,
    type: type ? String(type) : "outro",
    max_attendees: max_attendees ? Number(max_attendees) : null,
    is_public: typeof is_public === "boolean" ? is_public : true,
  }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 201 });
}
