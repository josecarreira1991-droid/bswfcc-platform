"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Conversation, Message, MessageTemplate } from "@/types/database";

import { ADMIN_ROLES } from "@/lib/utils";

async function requireAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) throw new Error("Unauthorized");
  const { data: caller } = await supabase
    .from("members")
    .select("role")
    .eq("email", user.email)
    .single();
  if (!caller || !(ADMIN_ROLES as readonly string[]).includes(caller.role)) throw new Error("Forbidden");
  return { supabase };
}

// ─── Conversations ───

export async function getConversations(status?: string) {
  const supabase = createClient();
  let query = supabase
    .from("conversations")
    .select("*")
    .order("last_message_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data as Conversation[];
}

export async function getConversation(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Conversation;
}

export async function getOrCreateConversation(whatsappNumber: string, memberName?: string, memberId?: string) {
  const supabase = createClient();

  // Try to find existing
  const { data: existing } = await supabase
    .from("conversations")
    .select("*")
    .eq("whatsapp_number", whatsappNumber)
    .single();

  if (existing) return existing as Conversation;

  // Create new
  const { data, error } = await supabase
    .from("conversations")
    .insert({
      whatsapp_number: whatsappNumber,
      member_name: memberName || null,
      member_id: memberId || null,
      status: "open",
    })
    .select()
    .single();

  if (error) throw error;
  return data as Conversation;
}

export async function updateConversationStatus(id: string, status: "open" | "closed" | "archived") {
  await requireAdmin();
  const supabase = createClient();
  const { error } = await supabase
    .from("conversations")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/inbox");
}

export async function markConversationRead(id: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("conversations")
    .update({ unread_count: 0, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/inbox");
}

// ─── Messages ───

export async function getMessages(conversationId: string, limit = 50) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return data as Message[];
}

export async function saveMessage(
  conversationId: string,
  content: string,
  direction: "inbound" | "outbound",
  options?: {
    contentType?: string;
    whatsappMessageId?: string;
    senderName?: string;
    isFromBot?: boolean;
    metadata?: Record<string, unknown>;
  }
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      direction,
      content,
      content_type: options?.contentType || "text",
      whatsapp_message_id: options?.whatsappMessageId || null,
      sender_name: options?.senderName || null,
      is_from_bot: options?.isFromBot || false,
      metadata: options?.metadata || {},
      status: direction === "outbound" ? "pending" : "delivered",
    })
    .select()
    .single();
  if (error) throw error;
  return data as Message;
}

// ─── Templates ───

export async function getTemplates() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("message_templates")
    .select("*")
    .eq("is_active", true)
    .order("category");
  if (error) throw error;
  return data as MessageTemplate[];
}

export async function getAllTemplates() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("message_templates")
    .select("*")
    .order("category");
  if (error) throw error;
  return data as MessageTemplate[];
}

export async function createTemplate(formData: FormData) {
  await requireAdmin();
  const supabase = createClient();
  const variables = (formData.get("variables") as string || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

  const { error } = await supabase.from("message_templates").insert({
    name: formData.get("name") as string,
    category: formData.get("category") as string,
    content: formData.get("content") as string,
    variables,
  });
  if (error) return { error: error.message };
  revalidatePath("/inbox");
  return { success: true };
}

export async function deleteTemplate(id: string) {
  await requireAdmin();
  const supabase = createClient();
  const { error } = await supabase.from("message_templates").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/inbox");
  return { success: true };
}

// ─── Notification Log ───

export async function logNotification(
  memberId: string | null,
  channel: "whatsapp" | "email" | "both",
  content: string,
  options?: {
    templateId?: string;
    subject?: string;
    metadata?: Record<string, unknown>;
  }
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("notification_log")
    .insert({
      member_id: memberId,
      channel,
      content,
      template_id: options?.templateId || null,
      subject: options?.subject || null,
      metadata: options?.metadata || {},
      status: "pending",
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getNotificationLog(limit = 50) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("notification_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}
