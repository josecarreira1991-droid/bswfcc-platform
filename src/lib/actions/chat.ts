"use server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentMember } from "@/lib/actions/auth";
import { revalidatePath } from "next/cache";
import type { DirectConversation, DirectMessage } from "@/types/database";

// ─── Conversations ───

export async function getMyConversations(): Promise<DirectConversation[]> {
  const member = await getCurrentMember();
  if (!member) throw new Error("Unauthorized");

  const supabase = createClient();

  // Get all conversations where this member is a participant
  const { data: conversations, error } = await supabase
    .from("direct_conversations")
    .select("*")
    .or(`participant_1.eq.${member.id},participant_2.eq.${member.id}`)
    .order("last_message_at", { ascending: false });

  if (error) throw error;
  if (!conversations || conversations.length === 0) return [];

  // Collect all other participant IDs
  const otherIds = conversations.map((c) =>
    c.participant_1 === member.id ? c.participant_2 : c.participant_1
  );

  // Fetch other member details
  const { data: members } = await supabase
    .from("members")
    .select("id, full_name, company, role")
    .in("id", otherIds);

  const memberMap = new Map(
    (members || []).map((m: { id: string; full_name: string; company: string | null; role: string }) => [m.id, m])
  );

  // Fetch all unread messages in a single batch query
  const convIds = conversations.map((c) => c.id);

  const { data: unreadMessages } = await supabase
    .from("direct_messages")
    .select("conversation_id")
    .in("conversation_id", convIds)
    .neq("sender_id", member.id)
    .is("read_at", null);

  // Build a map of convId → unread count
  const unreadMap = new Map<string, number>();
  for (const msg of unreadMessages || []) {
    unreadMap.set(msg.conversation_id, (unreadMap.get(msg.conversation_id) || 0) + 1);
  }

  return conversations.map((conv) => {
    const otherId = conv.participant_1 === member.id ? conv.participant_2 : conv.participant_1;
    return {
      ...conv,
      other_member: memberMap.get(otherId) || {
        id: otherId,
        full_name: "Membro",
        company: null,
        role: "membro",
      },
      unread_count: unreadMap.get(conv.id) || 0,
    };
  });
}

export async function getOrCreateConversation(otherMemberId: string): Promise<DirectConversation> {
  const member = await getCurrentMember();
  if (!member) throw new Error("Unauthorized");
  if (member.id === otherMemberId) throw new Error("Cannot message yourself");

  const supabase = createClient();

  // Always put smaller UUID as participant_1 for consistency
  const p1 = member.id < otherMemberId ? member.id : otherMemberId;
  const p2 = member.id < otherMemberId ? otherMemberId : member.id;

  // Try to find existing
  const { data: existing } = await supabase
    .from("direct_conversations")
    .select("*")
    .eq("participant_1", p1)
    .eq("participant_2", p2)
    .single();

  if (existing) {
    // Fetch other member info
    const { data: otherMember } = await supabase
      .from("members")
      .select("id, full_name, company, role")
      .eq("id", otherMemberId)
      .single();

    return {
      ...existing,
      other_member: otherMember || { id: otherMemberId, full_name: "Membro", company: null, role: "membro" },
      unread_count: 0,
    } as DirectConversation;
  }

  // Create new
  const { data, error } = await supabase
    .from("direct_conversations")
    .insert({ participant_1: p1, participant_2: p2 })
    .select()
    .single();

  if (error) throw error;

  // Fetch other member info
  const { data: otherMember } = await supabase
    .from("members")
    .select("id, full_name, company, role")
    .eq("id", otherMemberId)
    .single();

  revalidatePath("/chat");

  return {
    ...data,
    other_member: otherMember || { id: otherMemberId, full_name: "Membro", company: null, role: "membro" },
    unread_count: 0,
  } as DirectConversation;
}

// ─── Messages ───

export async function getMessages(conversationId: string, limit = 100): Promise<DirectMessage[]> {
  const member = await getCurrentMember();
  if (!member) throw new Error("Unauthorized");

  const supabase = createClient();

  // Verify the member is a participant of this conversation
  const { data: conv } = await supabase
    .from("direct_conversations")
    .select("participant_1, participant_2")
    .eq("id", conversationId)
    .single();

  if (!conv || (conv.participant_1 !== member.id && conv.participant_2 !== member.id)) {
    throw new Error("Forbidden");
  }

  // Get messages with sender info
  const { data: messages, error } = await supabase
    .from("direct_messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) throw error;
  if (!messages || messages.length === 0) return [];

  // Get sender names
  const senderIds = Array.from(new Set(messages.map((m: { sender_id: string }) => m.sender_id)));
  const { data: senders } = await supabase
    .from("members")
    .select("id, full_name, company")
    .in("id", senderIds);

  const senderMap = new Map(
    (senders || []).map((s: { id: string; full_name: string; company: string | null }) => [s.id, s])
  );

  return messages.map((msg: DirectMessage) => ({
    ...msg,
    sender: senderMap.get(msg.sender_id) || { full_name: "Membro", company: null },
  }));
}

export async function markConversationAsRead(conversationId: string): Promise<void> {
  const member = await getCurrentMember();
  if (!member) throw new Error("Unauthorized");

  const supabase = createClient();

  // Verify the member is a participant of this conversation
  const { data: conv } = await supabase
    .from("direct_conversations")
    .select("participant_1, participant_2")
    .eq("id", conversationId)
    .single();

  if (!conv || (conv.participant_1 !== member.id && conv.participant_2 !== member.id)) {
    throw new Error("Forbidden");
  }

  // Mark unread messages from OTHER person as read
  await supabase
    .from("direct_messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .neq("sender_id", member.id)
    .is("read_at", null);
}

export async function sendMessage(
  conversationId: string,
  content: string,
  mediaUrl?: string,
  mediaType?: string,
  mediaName?: string
): Promise<DirectMessage> {
  const member = await getCurrentMember();
  if (!member) throw new Error("Unauthorized");
  if (!content.trim() && !mediaUrl) throw new Error("Message cannot be empty");

  const supabase = createClient();

  // Verify the member is a participant
  const { data: conv } = await supabase
    .from("direct_conversations")
    .select("participant_1, participant_2")
    .eq("id", conversationId)
    .single();

  if (!conv || (conv.participant_1 !== member.id && conv.participant_2 !== member.id)) {
    throw new Error("Forbidden");
  }

  const insertData: Record<string, unknown> = {
    conversation_id: conversationId,
    sender_id: member.id,
    content: content.trim() || null,
  };

  if (mediaUrl) {
    insertData.media_url = mediaUrl;
    insertData.media_type = mediaType || null;
    insertData.media_name = mediaName || null;
  }

  const { data, error } = await supabase
    .from("direct_messages")
    .insert(insertData)
    .select()
    .single();

  if (error) throw error;

  revalidatePath("/chat");

  return {
    ...data,
    sender: { full_name: member.full_name, company: member.company },
  } as DirectMessage;
}

// ─── Delete Message ───

export async function deleteDirectMessage(messageId: string) {
  const member = await getCurrentMember();
  if (!member) throw new Error("Unauthorized");

  const supabase = createClient();

  const { data: msg } = await supabase
    .from("direct_messages")
    .select("sender_id")
    .eq("id", messageId)
    .single();

  if (!msg) throw new Error("Message not found");
  if (msg.sender_id !== member.id) throw new Error("Forbidden");

  const { error } = await supabase
    .from("direct_messages")
    .delete()
    .eq("id", messageId);

  if (error) throw error;

  revalidatePath("/chat");
}

// ─── Members ───

export async function getAvailableMembers() {
  const member = await getCurrentMember();
  if (!member) throw new Error("Unauthorized");

  const supabase = createClient();

  const { data, error } = await supabase
    .from("members")
    .select("id, full_name, company, role")
    .eq("status", "ativo")
    .neq("id", member.id)
    .order("full_name");

  if (error) throw error;
  return data || [];
}

// ─── Unread Count (for sidebar badge) ───

export async function getUnreadCount(): Promise<number> {
  const member = await getCurrentMember();
  if (!member) return 0;

  const supabase = createClient();

  // Get all conversation IDs where this member is a participant
  const { data: conversations } = await supabase
    .from("direct_conversations")
    .select("id")
    .or(`participant_1.eq.${member.id},participant_2.eq.${member.id}`);

  if (!conversations || conversations.length === 0) return 0;

  const convIds = conversations.map((c: { id: string }) => c.id);

  const { count } = await supabase
    .from("direct_messages")
    .select("*", { count: "exact", head: true })
    .in("conversation_id", convIds)
    .neq("sender_id", member.id)
    .is("read_at", null);

  return count || 0;
}
