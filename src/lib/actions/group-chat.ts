"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentMember } from "@/lib/actions/auth";
import { revalidatePath } from "next/cache";
import { ADMIN_ROLES } from "@/lib/utils";
import type { ChatChannel, ChatMessage } from "@/types/database";

// ─── Channels ───

export async function getChannels(): Promise<ChatChannel[]> {
  const member = await getCurrentMember();
  if (!member) throw new Error("Unauthorized");

  const supabase = createClient();

  const { data, error } = await supabase
    .from("chat_channels")
    .select("*")
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data || []) as ChatChannel[];
}

export async function createChannel(
  name: string,
  description: string
): Promise<ChatChannel> {
  const member = await getCurrentMember();
  if (!member) throw new Error("Unauthorized");

  const isAdmin = ADMIN_ROLES.includes(member.role as (typeof ADMIN_ROLES)[number]);
  if (!isAdmin) throw new Error("Only admins can create channels");

  const supabase = createClient();

  // Prevent duplicate channel names
  const trimmedName = name.trim();
  const { data: existing } = await supabase
    .from("chat_channels")
    .select("id")
    .ilike("name", trimmedName)
    .limit(1);

  if (existing && existing.length > 0) {
    throw new Error(`Canal "${trimmedName}" já existe`);
  }

  const { data, error } = await supabase
    .from("chat_channels")
    .insert({
      name: trimmedName,
      description: description.trim() || null,
      created_by: member.id,
    })
    .select()
    .single();

  if (error) throw error;

  revalidatePath("/grupo");
  return data as ChatChannel;
}

// ─── Messages ───

export async function getChannelMessages(
  channelId: string,
  limit = 50
): Promise<ChatMessage[]> {
  const member = await getCurrentMember();
  if (!member) throw new Error("Unauthorized");

  const supabase = createClient();

  const { data: messages, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("channel_id", channelId)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) throw error;
  if (!messages || messages.length === 0) return [];

  // Get sender info
  const senderIds = Array.from(
    new Set(messages.map((m: { sender_id: string }) => m.sender_id))
  );
  const { data: senders } = await supabase
    .from("members")
    .select("id, full_name, company, role")
    .in("id", senderIds);

  const senderMap = new Map(
    (senders || []).map(
      (s: { id: string; full_name: string; company: string | null; role: string }) => [
        s.id,
        s,
      ]
    )
  );

  return messages.map((msg: ChatMessage) => ({
    ...msg,
    sender: senderMap.get(msg.sender_id) || {
      full_name: "Membro",
      company: null,
      role: "membro",
    },
  }));
}

export async function sendChannelMessage(
  channelId: string,
  content: string | null,
  mediaUrl?: string | null,
  mediaType?: string | null,
  mediaName?: string | null
): Promise<ChatMessage> {
  const member = await getCurrentMember();
  if (!member) throw new Error("Unauthorized");
  if (!content?.trim() && !mediaUrl) throw new Error("Message cannot be empty");

  const supabase = createClient();

  const insertData: Record<string, unknown> = {
    channel_id: channelId,
    sender_id: member.id,
    content: content?.trim() || null,
  };

  if (mediaUrl) {
    insertData.media_url = mediaUrl;
    insertData.media_type = mediaType || null;
    insertData.media_name = mediaName || null;
  }

  const { data, error } = await supabase
    .from("chat_messages")
    .insert(insertData)
    .select()
    .single();

  if (error) throw error;

  revalidatePath("/grupo");

  return {
    ...data,
    sender: {
      full_name: member.full_name,
      company: member.company,
      role: member.role,
    },
  } as ChatMessage;
}

// ─── Delete Message ───

export async function deleteChannelMessage(messageId: string) {
  const member = await getCurrentMember();
  if (!member) throw new Error("Unauthorized");

  const supabase = createClient();

  // Only allow deleting own messages (or admin can delete any)
  const { data: msg } = await supabase
    .from("chat_messages")
    .select("sender_id")
    .eq("id", messageId)
    .single();

  if (!msg) throw new Error("Message not found");

  const isOwn = msg.sender_id === member.id;
  const isAdmin = (ADMIN_ROLES as readonly string[]).includes(member.role);

  if (!isOwn && !isAdmin) throw new Error("Forbidden");

  const { error } = await supabase
    .from("chat_messages")
    .delete()
    .eq("id", messageId);

  if (error) throw error;

  revalidatePath("/grupo");
}

// ─── Update / Delete Channel ───

export async function updateChannel(
  channelId: string,
  name: string,
  description: string
) {
  const member = await getCurrentMember();
  if (
    !member ||
    !(ADMIN_ROLES as readonly string[]).includes(member.role)
  )
    throw new Error("Forbidden");

  const supabase = createClient();

  const { error } = await supabase
    .from("chat_channels")
    .update({ name, description: description || null })
    .eq("id", channelId);

  if (error) throw error;

  revalidatePath("/grupo");
}

export async function deleteChannel(channelId: string) {
  const member = await getCurrentMember();
  if (
    !member ||
    !(ADMIN_ROLES as readonly string[]).includes(member.role)
  )
    throw new Error("Forbidden");

  const supabase = createClient();

  // Don't allow deleting the default channel
  const { data } = await supabase
    .from("chat_channels")
    .select("is_default")
    .eq("id", channelId)
    .single();

  if (data?.is_default) throw new Error("Cannot delete default channel");

  const { error } = await supabase
    .from("chat_channels")
    .delete()
    .eq("id", channelId);

  if (error) throw error;

  revalidatePath("/grupo");
}

// ─── Media Upload ───

export async function uploadMedia(formData: FormData): Promise<string> {
  const member = await getCurrentMember();
  if (!member) throw new Error("Unauthorized");

  const supabase = createClient();
  const file = formData.get("file") as File;

  if (!file) throw new Error("No file provided");

  // 10MB limit
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("File size exceeds 10MB limit");
  }

  // Validate file type
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    "video/mp4",
    "video/quicktime",
    "application/pdf",
  ];

  if (!allowedTypes.includes(file.type)) {
    throw new Error("File type not allowed");
  }

  const bucket = "chat-media";
  const ext = file.name.split(".").pop() || "bin";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file);

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
  return urlData.publicUrl;
}

// ─── Reactions ───

export type ReactionGroup = {
  emoji: string;
  count: number;
  members: string[]; // member IDs who reacted
};

export async function getMessageReactions(
  messageIds: string[]
): Promise<Record<string, ReactionGroup[]>> {
  const member = await getCurrentMember();
  if (!member) throw new Error("Unauthorized");
  if (messageIds.length === 0) return {};

  const supabase = createClient();

  const { data, error } = await supabase
    .from("message_reactions")
    .select("message_id, emoji, member_id")
    .in("message_id", messageIds);

  if (error) throw error;

  // Group by message_id → emoji → member list
  const result: Record<string, ReactionGroup[]> = {};

  for (const row of data || []) {
    if (!result[row.message_id]) result[row.message_id] = [];

    const group = result[row.message_id].find((g) => g.emoji === row.emoji);
    if (group) {
      group.count++;
      group.members.push(row.member_id);
    } else {
      result[row.message_id].push({
        emoji: row.emoji,
        count: 1,
        members: [row.member_id],
      });
    }
  }

  return result;
}

export async function toggleReaction(
  messageId: string,
  emoji: string
): Promise<{ added: boolean }> {
  const member = await getCurrentMember();
  if (!member) throw new Error("Unauthorized");

  const supabase = createClient();

  // Check if reaction already exists
  const { data: existing } = await supabase
    .from("message_reactions")
    .select("id")
    .eq("message_id", messageId)
    .eq("member_id", member.id)
    .eq("emoji", emoji)
    .limit(1);

  if (existing && existing.length > 0) {
    // Remove reaction
    await supabase
      .from("message_reactions")
      .delete()
      .eq("message_id", messageId)
      .eq("member_id", member.id)
      .eq("emoji", emoji);
    return { added: false };
  } else {
    // Add reaction
    const { error } = await supabase.from("message_reactions").insert({
      message_id: messageId,
      member_id: member.id,
      emoji,
    });
    if (error) throw error;
    return { added: true };
  }
}
