import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";
import type { Member, EventRegistration } from "@/types/database";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: memberData } = await supabase
    .from("members")
    .select("*")
    .eq("email", user.email!)
    .single();

  const member = memberData as Member | null;
  if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });

  const { data: existingData } = await supabase
    .from("event_registrations")
    .select("*")
    .eq("event_id", params.id)
    .eq("member_id", member.id)
    .maybeSingle();

  if (existingData) return NextResponse.json({ error: "Already registered" }, { status: 409 });

  const { data, error } = await supabase.from("event_registrations").insert({
    event_id: params.id,
    member_id: member.id,
    registered_at: new Date().toISOString(),
    status: "confirmado" as const,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 201 });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("event_registrations")
    .select("*")
    .eq("event_id", params.id)
    .eq("status", "confirmado");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}
