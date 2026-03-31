"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentMember } from "@/lib/actions/auth";

/**
 * Upload a file to Supabase Storage from the server side.
 * This avoids mixed-content blocking (HTTPS page → HTTP Supabase)
 * by routing the upload through the Next.js server action.
 */
export async function uploadChatMedia(
  formData: FormData
): Promise<{ url: string; error?: never } | { url?: never; error: string }> {
  const member = await getCurrentMember();
  if (!member) return { error: "Unauthorized" };

  const file = formData.get("file") as File | null;
  if (!file) return { error: "Nenhum arquivo enviado" };

  if (file.size > 10 * 1024 * 1024) {
    return { error: "Arquivo muito grande. Limite: 10MB" };
  }

  // Validate file type (allowlist)
  const ALLOWED_TYPES = [
    "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml",
    "video/mp4", "video/quicktime",
    "application/pdf",
  ];
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: "Tipo de arquivo não permitido. Use imagens, vídeos ou PDFs." };
  }

  const supabase = createClient();

  // Generate a unique filename (timestamp + sanitized original name)
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const path = `${Date.now()}-${safeName}`;

  // Convert File to ArrayBuffer for server-side upload
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error: uploadError } = await supabase.storage
    .from("chat-media")
    .upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return { error: uploadError.message };
  }

  const { data: urlData } = supabase.storage
    .from("chat-media")
    .getPublicUrl(path);

  return { url: urlData.publicUrl };
}
