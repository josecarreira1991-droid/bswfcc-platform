import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { startSession, stopSession } from "@/lib/services/waha";

const ADMIN_ROLES = ["presidente", "vice_presidente", "secretario", "tesoureiro", "diretor_tecnologia"];

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
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { action } = body;

  try {
    if (action === "start") {
      const result = await startSession();
      return NextResponse.json({ success: true, result });
    } else if (action === "stop") {
      const result = await stopSession();
      return NextResponse.json({ success: true, result });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
