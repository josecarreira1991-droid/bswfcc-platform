import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest, { params }: { params: { eventId: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", `/api/checkin/${params.eventId}`);
    return NextResponse.redirect(loginUrl);
  }

  const { data: member } = await supabase
    .from("members")
    .select("id, full_name")
    .eq("email", user.email!)
    .single();

  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  // Check event exists
  const { data: event } = await supabase
    .from("events")
    .select("id, title")
    .eq("id", params.eventId)
    .single();

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  // Attempt check-in
  const { error } = await supabase.from("event_checkins").insert({
    event_id: params.eventId,
    member_id: member.id,
    check_in_method: "qr",
  });

  if (error) {
    if (error.code === "23505") {
      // Already checked in — redirect to success
      const url = new URL(`/eventos?checkin=duplicate&event=${encodeURIComponent(event.title)}`, request.url);
      return NextResponse.redirect(url);
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const url = new URL(`/eventos?checkin=success&event=${encodeURIComponent(event.title)}`, request.url);
  return NextResponse.redirect(url);
}
