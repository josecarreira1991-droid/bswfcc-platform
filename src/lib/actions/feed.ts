"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { ADMIN_ROLES } from "@/lib/utils";
import type { Post, PostCategory, PostComment } from "@/types/database";

async function getCurrentMemberId() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) throw new Error("Unauthorized");

  const { data: member } = await supabase
    .from("members")
    .select("id, role")
    .eq("email", user.email)
    .single();

  if (!member) throw new Error("Member not found");
  return member;
}

// ── Posts ──────────────────────────────────────────────────────────────

export async function getPosts(options?: {
  category?: PostCategory;
  opportunitiesOnly?: boolean;
  limit?: number;
  offset?: number;
}): Promise<{
  posts: Array<Post & { author: { full_name: string; company: string | null; role: string; avatar_url: string | null } }>;
  total: number;
}> {
  const supabase = createClient();
  const limit = options?.limit || 20;
  const offset = options?.offset || 0;

  let query = supabase
    .from("posts")
    .select("*, author:members!posts_author_id_fkey(full_name, company, role, avatar_url)", { count: "exact" })
    .eq("is_visible", true)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (options?.category) {
    query = query.eq("category", options.category);
  }
  if (options?.opportunitiesOnly) {
    query = query.eq("is_opportunity", true);
  }

  const { data, count, error } = await query;
  if (error) throw error;

  return {
    posts: (data || []).map((p) => ({
      ...p,
      author: p.author as unknown as { full_name: string; company: string | null; role: string; avatar_url: string | null },
    })),
    total: count || 0,
  };
}

export async function getPost(postId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*, author:members!posts_author_id_fkey(full_name, company, role, avatar_url)")
    .eq("id", postId)
    .eq("is_visible", true)
    .single();

  if (error) return null;
  return {
    ...data,
    author: data.author as unknown as { full_name: string; company: string | null; role: string; avatar_url: string | null },
  };
}

export async function createPost(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const member = await getCurrentMemberId();
  const supabase = createClient();

  const category = (formData.get("category") as PostCategory) || "geral";
  const isOpportunity = category === "oportunidade" || category === "parceria";

  const { error } = await supabase.from("posts").insert({
    author_id: member.id,
    category,
    title: formData.get("title") as string,
    content: formData.get("content") as string,
    is_opportunity: isOpportunity,
    opportunity_type: isOpportunity ? (formData.get("opportunity_type") as string) || null : null,
    tags: formData.get("tags") ? (formData.get("tags") as string).split(",").map((t) => t.trim()).filter(Boolean) : [],
  });

  if (error) return { success: false, error: error.message };
  revalidatePath("/mural");
  return { success: true };
}

export async function deletePost(postId: string): Promise<{ success: boolean; error?: string }> {
  const member = await getCurrentMemberId();
  const supabase = createClient();

  // Check ownership or admin
  const isAdminUser = (ADMIN_ROLES as readonly string[]).includes(member.role);
  if (!isAdminUser) {
    const { data: post } = await supabase.from("posts").select("author_id").eq("id", postId).single();
    if (!post || post.author_id !== member.id) {
      return { success: false, error: "Sem permissão" };
    }
  }

  const { error } = await supabase.from("posts").delete().eq("id", postId);
  if (error) return { success: false, error: error.message };
  revalidatePath("/mural");
  return { success: true };
}

export async function togglePin(postId: string): Promise<{ success: boolean; error?: string }> {
  const member = await getCurrentMemberId();
  if (!(ADMIN_ROLES as readonly string[]).includes(member.role)) {
    return { success: false, error: "Apenas diretoria pode fixar posts" };
  }

  const supabase = createClient();
  const { data: post } = await supabase.from("posts").select("is_pinned").eq("id", postId).single();
  if (!post) return { success: false, error: "Post não encontrado" };

  const { error } = await supabase
    .from("posts")
    .update({ is_pinned: !post.is_pinned, updated_at: new Date().toISOString() })
    .eq("id", postId);

  if (error) return { success: false, error: error.message };
  revalidatePath("/mural");
  return { success: true };
}

// ── Comments ──────────────────────────────────────────────────────────

export async function getComments(postId: string): Promise<
  Array<PostComment & { author: { full_name: string; company: string | null; role: string; avatar_url: string | null } }>
> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("post_comments")
    .select("*, author:members!post_comments_author_id_fkey(full_name, company, role, avatar_url)")
    .eq("post_id", postId)
    .eq("is_visible", true)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data || []).map((c) => ({
    ...c,
    author: c.author as unknown as { full_name: string; company: string | null; role: string; avatar_url: string | null },
  }));
}

export async function addComment(postId: string, content: string): Promise<{ success: boolean; error?: string }> {
  const member = await getCurrentMemberId();
  const supabase = createClient();

  const { error: commentError } = await supabase.from("post_comments").insert({
    post_id: postId,
    author_id: member.id,
    content,
  });

  if (commentError) return { success: false, error: commentError.message };

  // Increment comments_count on the post
  const { data: post } = await supabase.from("posts").select("comments_count").eq("id", postId).single();
  if (post) {
    await supabase.from("posts").update({ comments_count: post.comments_count + 1 }).eq("id", postId);
  }

  revalidatePath("/mural");
  return { success: true };
}

export async function deleteComment(commentId: string): Promise<{ success: boolean; error?: string }> {
  const member = await getCurrentMemberId();
  const supabase = createClient();
  const isAdminUser = (ADMIN_ROLES as readonly string[]).includes(member.role);

  const { data: comment } = await supabase
    .from("post_comments")
    .select("author_id, post_id")
    .eq("id", commentId)
    .single();

  if (!comment) return { success: false, error: "Comentário não encontrado" };
  if (!isAdminUser && comment.author_id !== member.id) {
    return { success: false, error: "Sem permissão" };
  }

  const { error } = await supabase.from("post_comments").update({ is_visible: false }).eq("id", commentId);
  if (error) return { success: false, error: error.message };

  // Decrement comments_count
  const { data: post } = await supabase.from("posts").select("comments_count").eq("id", comment.post_id).single();
  if (post && post.comments_count > 0) {
    await supabase.from("posts").update({ comments_count: post.comments_count - 1 }).eq("id", comment.post_id);
  }

  revalidatePath("/mural");
  return { success: true };
}

// ── Likes ─────────────────────────────────────────────────────────────

export async function toggleLike(postId: string): Promise<{ liked: boolean; error?: string }> {
  const member = await getCurrentMemberId();
  const supabase = createClient();

  // Check if already liked
  const { data: existing } = await supabase
    .from("post_likes")
    .select("id")
    .eq("post_id", postId)
    .eq("member_id", member.id)
    .single();

  if (existing) {
    // Unlike
    await supabase.from("post_likes").delete().eq("id", existing.id);
    const { data: post } = await supabase.from("posts").select("likes_count").eq("id", postId).single();
    if (post && post.likes_count > 0) {
      await supabase.from("posts").update({ likes_count: post.likes_count - 1 }).eq("id", postId);
    }
    revalidatePath("/mural");
    return { liked: false };
  }

  // Like
  const { error } = await supabase.from("post_likes").insert({ post_id: postId, member_id: member.id });
  if (error) return { liked: false, error: error.message };

  const { data: post } = await supabase.from("posts").select("likes_count").eq("id", postId).single();
  if (post) {
    await supabase.from("posts").update({ likes_count: post.likes_count + 1 }).eq("id", postId);
  }

  revalidatePath("/mural");
  return { liked: true };
}

export async function getMyLikes(postIds: string[]): Promise<Set<string>> {
  if (postIds.length === 0) return new Set();
  const member = await getCurrentMemberId();
  const supabase = createClient();

  const { data } = await supabase
    .from("post_likes")
    .select("post_id")
    .eq("member_id", member.id)
    .in("post_id", postIds);

  return new Set((data || []).map((l) => l.post_id));
}

// ── Feed Stats ────────────────────────────────────────────────────────

export async function getFeedStats() {
  const supabase = createClient();
  const [postsResult, opportunitiesResult] = await Promise.all([
    supabase.from("posts").select("id", { count: "exact", head: true }).eq("is_visible", true),
    supabase.from("posts").select("id", { count: "exact", head: true }).eq("is_visible", true).eq("is_opportunity", true),
  ]);

  return {
    totalPosts: postsResult.count || 0,
    totalOpportunities: opportunitiesResult.count || 0,
  };
}
