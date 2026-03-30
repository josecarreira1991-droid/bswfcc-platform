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

  const { data, error } = await supabase
    .from("chat_channels")
    .insert({
      name: name.trim(),
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
