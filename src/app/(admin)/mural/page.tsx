import { getCurrentMember } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/utils";
import { getPosts, getMyLikes, getFeedStats, getComments } from "@/lib/actions/feed";
import FeedView from "@/components/admin/FeedView";

export default async function MuralPage() {
  const member = await getCurrentMember();
  if (!member) redirect("/login");

  const admin = isAdmin(member.role);

  const [{ posts, total }, feedStats] = await Promise.all([
    getPosts({ limit: 50 }),
    getFeedStats(),
  ]);

  const postIds = posts.map((p) => p.id);
  const [likedPostIds, ...commentArrays] = await Promise.all([
    getMyLikes(postIds).then((set) => Array.from(set)),
    ...posts.filter((p) => p.comments_count > 0).map((p) => getComments(p.id).then((c) => ({ id: p.id, comments: c }))),
  ]);

  const initialComments: Record<string, Array<{ id: string; post_id: string; author_id: string; content: string; is_visible: boolean; created_at: string; author: { full_name: string; company: string | null; role: string; avatar_url: string | null } }>> = {};
  for (const item of commentArrays as Array<{ id: string; comments: Array<{ id: string; post_id: string; author_id: string; content: string; is_visible: boolean; created_at: string; author: { full_name: string; company: string | null; role: string; avatar_url: string | null } }> }>) {
    initialComments[item.id] = item.comments;
  }

  return (
    <FeedView
      posts={posts}
      totalPosts={total}
      currentMember={member}
      isAdmin={admin}
      likedPostIds={likedPostIds as string[]}
      feedStats={feedStats}
      initialComments={initialComments}
    />
  );
}
