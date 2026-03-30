"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "./auth-helpers";
import type { Document } from "@/types/database";

export async function getDocuments(category?: string) {
  const supabase = createClient();
  let query = supabase.from("documents").select("*").order("is_pinned", { ascending: false }).order("created_at", { ascending: false });
  if (category && category !== "all") query = query.eq("category", category);
  const { data, error } = await query;
  if (error) throw error;
  return data as Document[];
}

export async function createDocument(formData: FormData) {
  const { supabase, callerId } = await requireAdmin();
  const tags = (formData.get("tags") as string || "").split(",").map((s) => s.trim()).filter(Boolean);

  const { error } = await supabase.from("documents").insert({
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || null,
    category: formData.get("category") as string,
    file_url: (formData.get("file_url") as string) || null,
    file_type: (formData.get("file_type") as string) || null,
    access_level: (formData.get("access_level") as string) || "member",
    uploaded_by: callerId,
    is_pinned: formData.get("is_pinned") === "true",
    tags,
  });
  if (error) return { error: error.message };
  revalidatePath("/documentos");
  return { success: true };
}

export async function deleteDocument(id: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("documents").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/documentos");
  return { success: true };
}

export async function incrementDownload(id: string) {
  const supabase = createClient();
  const { data: doc, error: fetchErr } = await supabase
    .from("documents")
    .select("download_count")
    .eq("id", id)
    .single();
  if (fetchErr || !doc) return;
  const { error } = await supabase
    .from("documents")
    .update({ download_count: (doc.download_count || 0) + 1 })
    .eq("id", id);
  if (error) console.error("incrementDownload error:", error.message);
}
