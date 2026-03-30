import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { broadcastMessage } from "@/lib/services/waha";
import { isAdmin } from "@/lib/utils";

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: caller } = await supabase
    .from("members")
    .select("role")
    .eq("email", user.email!)
    .single();

  if (!caller || !isAdmin(caller.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { message, filter } = body;

  if (!message) {
    return NextResponse.json({ error: "Missing message" }, { status: 400 });
  }

  // Get target members based on filter
  let query = supabase.from("members").select("id, phone, full_name").eq("status", "ativo").not("phone", "is", null);

  if (filter?.role) query = query.eq("role", filter.role);
  if (filter?.industry) query = query.eq("industry", filter.industry);

  const { data: members } = await query;
  if (!members || members.length === 0) {
    return NextResponse.json({ error: "No members with phone numbers found" }, { status: 404 });
  }

  const numbers = members.map((m) => m.phone!).filter(Boolean);

  // Broadcast
  const results = await broadcastMessage(numbers, message);

  // Log notifications
  for (const member of members) {
    const result = results.find((r) => r.number === member.phone);
    await supabase.from("notification_log").insert({
      member_id: member.id,
      channel: "whatsapp",
      content: message,
      status: result?.success ? "sent" : "failed",
      error_message: result?.error || null,
    });
  }

  const sent = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  return NextResponse.json({ success: true, sent, failed, total: numbers.length });
}
