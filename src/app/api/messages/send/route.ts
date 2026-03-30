import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendTextMessage } from "@/lib/services/waha";

const ADMIN_ROLES = ["presidente", "vice_presidente", "secretario", "tesoureiro", "diretor_tecnologia"];

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: caller } = await supabase
    .from("members")
    .select("role, full_name")
    .eq("email", user.email!)
    .single();

  if (!caller || !ADMIN_ROLES.includes(caller.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { conversationId, content } = body;

  if (!conversationId || !content) {
    return NextResponse.json({ error: "Missing conversationId or content" }, { status: 400 });
  }

  // Get conversation to find WhatsApp number
  const { data: conversation } = await supabase
    .from("conversations")
    .select("whatsapp_number")
    .eq("id", conversationId)
    .single();

  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  try {
    // Send via WhatsApp
    const waResult = await sendTextMessage(conversation.whatsapp_number, content);

    // Save to database
    const { data: message, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        direction: "outbound",
        content,
        content_type: "text",
        whatsapp_message_id: waResult?.id || null,
        sender_name: caller.full_name,
        is_from_bot: false,
        status: "sent",
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, message });
  } catch (err) {
    console.error("[Send Message] Error:", err);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
