import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { extractPhoneFromChatId } from "@/lib/services/waha";

// Use service role for webhook processing (no user auth context)
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const event = body.event;

    if (event === "message" || event === "message.any") {
      await handleIncomingMessage(body);
    } else if (event === "session.status") {
      await handleSessionStatus(body);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Waha Webhook] Error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

async function handleIncomingMessage(payload: Record<string, unknown>) {
  const supabase = getServiceClient();

  const msg = payload.payload as Record<string, unknown>;
  if (!msg) return;

  const from = (msg.from as string) || "";
  const messageBody = (msg.body as string) || "";
  const messageId = (msg.id as string) || "";
  const isFromMe = msg.fromMe === true;

  // Skip outgoing messages (already saved when we send)
  if (isFromMe) return;

  const phoneNumber = extractPhoneFromChatId(from);
  if (!phoneNumber) return;

  // Find or create conversation
  const { data: conversation } = await supabase
    .from("conversations")
    .select("id, member_id")
    .eq("whatsapp_number", phoneNumber)
    .single();

  let conversationId: string;

  if (conversation) {
    conversationId = conversation.id;
  } else {
    // Try to match with a member by phone
    const { data: member } = await supabase
      .from("members")
      .select("id, full_name")
      .eq("phone", phoneNumber)
      .single();

    const { data: newConv, error } = await supabase
      .from("conversations")
      .insert({
        whatsapp_number: phoneNumber,
        member_id: member?.id || null,
        member_name: member?.full_name || null,
        status: "open",
      })
      .select("id")
      .single();

    if (error || !newConv) {
      console.error("[Waha Webhook] Failed to create conversation:", error);
      return;
    }
    conversationId = newConv.id;
  }

  // Save the inbound message
  await supabase.from("messages").insert({
    conversation_id: conversationId,
    direction: "inbound",
    content: messageBody,
    content_type: "text",
    whatsapp_message_id: messageId,
    sender_name: (msg.notifyName as string) || null,
    is_from_bot: false,
    status: "delivered",
  });

  // Check if bot auto-reply is enabled
  const { data: botConfig } = await supabase
    .from("bot_config")
    .select("*")
    .limit(1)
    .single();

  if (botConfig?.is_active && botConfig?.auto_reply_enabled) {
    // Check working hours if configured
    if (botConfig.working_hours_only) {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      if (currentTime < botConfig.working_hours_start || currentTime > botConfig.working_hours_end) {
        return; // Outside working hours, don't auto-reply
      }
    }

    // Delayed import to avoid circular deps and keep webhook fast for non-bot messages
    const { generateBotResponse } = await import("@/lib/services/bot");
    const { sendTextMessage } = await import("@/lib/services/waha");

    // Get recent conversation history for context
    const { data: recentMessages } = await supabase
      .from("messages")
      .select("direction, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .limit(6);

    const history = (recentMessages || [])
      .reverse()
      .slice(0, -1) // Exclude the message we just saved (it's the current one)
      .map((m) => ({
        role: (m.direction === "inbound" ? "user" : "assistant") as "user" | "assistant",
        content: m.content,
      }));

    // Add delay before responding
    if (botConfig.auto_reply_delay_ms > 0) {
      await new Promise((r) => setTimeout(r, botConfig.auto_reply_delay_ms));
    }

    const botReply = await generateBotResponse(
      messageBody,
      phoneNumber,
      history,
      botConfig.system_prompt || undefined
    );

    // Send via WhatsApp
    try {
      const waResult = await sendTextMessage(phoneNumber, botReply);

      // Save bot reply
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        direction: "outbound",
        content: botReply,
        content_type: "text",
        whatsapp_message_id: waResult?.id || null,
        sender_name: "BSWFCC Bot",
        is_from_bot: true,
        status: "sent",
      });
    } catch (err) {
      console.error("[Waha Webhook] Bot reply failed:", err);
    }
  }
}

async function handleSessionStatus(payload: Record<string, unknown>) {
  const supabase = getServiceClient();
  const session = payload.payload as Record<string, unknown>;
  if (!session) return;

  const status = (session.status as string) || "disconnected";
  const name = (session.name as string) || "bswfcc";

  // Upsert session status
  const { data: existing } = await supabase
    .from("waha_sessions")
    .select("id")
    .eq("session_name", name)
    .single();

  if (existing) {
    await supabase
      .from("waha_sessions")
      .update({ status, last_ping: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", existing.id);
  } else {
    await supabase.from("waha_sessions").insert({
      session_name: name,
      status,
      last_ping: new Date().toISOString(),
    });
  }
}
