"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  MessageSquarePlus,
  Pin,
  Heart,
  MessageCircle,
  Trash2,
  Send,
  Filter,
  Briefcase,
  Megaphone,
  Handshake,
  Calendar,
  MessageSquare,
  Tag,
  ChevronDown,
  ChevronUp,
  Search,
  X,
} from "lucide-react";
import { createPost, deletePost, togglePin, addComment, deleteComment, toggleLike } from "@/lib/actions/feed";
import { cn, ROLE_LABELS, ADMIN_ROLES } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import type { Member, Post, PostCategory, PostComment } from "@/types/database";

const CATEGORY_CONFIG: Record<PostCategory, { label: string; icon: typeof Megaphone; color: string }> = {
  anuncio: { label: "Anúncio", icon: Megaphone, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  oportunidade: { label: "Oportunidade", icon: Briefcase, color: "text-gold bg-gold/10 border-gold/20" },
  parceria: { label: "Parceria", icon: Handshake, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  evento: { label: "Evento", icon: Calendar, color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
  discussao: { label: "Discussão", icon: MessageSquare, color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
  geral: { label: "Geral", icon: Tag, color: "text-slate-400 bg-slate-500/10 border-slate-500/20" },
};

type PostWithAuthor = Post & { author: { full_name: string; company: string | null; role: string; avatar_url: string | null } };
type CommentWithAuthor = PostComment & { author: { full_name: string; company: string | null; role: string; avatar_url: string | null } };

interface FeedViewProps {
  posts: PostWithAuthor[];
  totalPosts: number;
  currentMember: Member;
  isAdmin: boolean;
  likedPostIds: string[];
  feedStats: { totalPosts: number; totalOpportunities: number };
  initialComments?: Record<string, CommentWithAuthor[]>;
}

export default function FeedView({ posts, totalPosts, currentMember, isAdmin, likedPostIds, feedStats, initialComments }: FeedViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showNewPost, setShowNewPost] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  const [comments, setComments] = useState<Record<string, CommentWithAuthor[]>>(initialComments || {});
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [likedSet, setLikedSet] = useState<Set<string>>(new Set(likedPostIds));
  const [activeFilter, setActiveFilter] = useState<PostCategory | "all" | "oportunidades">("all");
  const [searchTerm, setSearchTerm] = useState("");

  async function handleCreatePost(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      const result = await createPost(form);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Post publicado!");
        setShowNewPost(false);
        router.refresh();
      }
    } catch {
      toast.error("Erro de conexão. Tente novamente.");
    }
    setLoading(false);
  }

  async function handleDelete(postId: string) {
    if (!confirm("Tem certeza que deseja excluir este post?")) return;
    try {
      const result = await deletePost(postId);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Post excluído");
        router.refresh();
      }
    } catch {
      toast.error("Erro de conexão. Tente novamente.");
    }
  }

  async function handlePin(postId: string) {
    try {
      const result = await togglePin(postId);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Post atualizado");
        router.refresh();
      }
    } catch {
      toast.error("Erro de conexão. Tente novamente.");
    }
  }

  async function handleLike(postId: string) {
    try {
      const result = await toggleLike(postId);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      setLikedSet((prev) => {
        const next = new Set(prev);
        if (result.liked) next.add(postId);
        else next.delete(postId);
        return next;
      });
      startTransition(() => router.refresh());
    } catch {
      toast.error("Erro de conexão. Tente novamente.");
    }
  }

  async function handleComment(postId: string) {
    const text = commentText[postId]?.trim();
    if (!text) return;
    try {
      const result = await addComment(postId, text);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      setCommentText((prev) => ({ ...prev, [postId]: "" }));
      toast.success("Comentário adicionado");
      router.refresh();
    } catch {
      toast.error("Erro de conexão. Tente novamente.");
    }
  }

  async function handleDeleteComment(commentId: string) {
    try {
      const result = await deleteComment(commentId);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Comentário removido");
        router.refresh();
      }
    } catch {
      toast.error("Erro de conexão. Tente novamente.");
    }
  }

  function toggleExpand(postId: string) {
    setExpandedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  }

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "agora";
    if (mins < 60) return `${mins}min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d`;
    return new Date(dateStr).toLocaleDateString("pt-BR");
  }

  const filteredPosts = posts.filter((p) => {
    if (activeFilter === "oportunidades") return p.is_opportunity;
    if (activeFilter !== "all") return p.category === activeFilter;
    return true;
  }).filter((p) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return p.title.toLowerCase().includes(term) || p.content.toLowerCase().includes(term) || p.author.full_name.toLowerCase().includes(term);
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">Mural</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {feedStats.totalPosts} publicações · {feedStats.totalOpportunities} oportunidades
          </p>
        </div>
        <button
          onClick={() => setShowNewPost(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gold text-navy rounded-lg hover:bg-light-gold transition-colors"
        >
          <MessageSquarePlus size={16} /> Nova Publicação
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button
          onClick={() => setActiveFilter("all")}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors",
            activeFilter === "all"
              ? "bg-gold/10 text-gold border-gold/20"
              : "text-slate-400 border-slate-700/50 hover:text-white hover:border-slate-600"
          )}
        >
          Todos
        </button>
        <button
          onClick={() => setActiveFilter("oportunidades")}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors",
            activeFilter === "oportunidades"
              ? "bg-gold/10 text-gold border-gold/20"
              : "text-slate-400 border-slate-700/50 hover:text-white hover:border-slate-600"
          )}
        >
          Oportunidades
        </button>
        {(Object.keys(CATEGORY_CONFIG) as PostCategory[]).map((cat) => {
          const config = CATEGORY_CONFIG[cat];
          return (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors",
                activeFilter === cat
                  ? config.color
                  : "text-slate-400 border-slate-700/50 hover:text-white hover:border-slate-600"
              )}
            >
              {config.label}
            </button>
          );
        })}

        <div className="relative ml-auto">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-xs bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder:text-slate-500 focus:border-gold/40 focus:outline-none w-48"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {filteredPosts.length === 0 && (
          <div className="bg-[#0D1B2A] border border-slate-700/50 rounded-xl p-12 text-center">
            <MessageSquarePlus size={32} className="mx-auto text-slate-600 mb-3" />
            <p className="text-slate-400 text-sm">Nenhuma publicação encontrada.</p>
            <p className="text-slate-500 text-xs mt-1">Seja o primeiro a publicar!</p>
          </div>
        )}

        {filteredPosts.map((post) => {
          const catConfig = CATEGORY_CONFIG[post.category];
          const CatIcon = catConfig.icon;
          const isExpanded = expandedPosts.has(post.id);
          const isLiked = likedSet.has(post.id);
          const isAuthor = post.author_id === currentMember.id;
          const postComments = comments[post.id] || initialComments?.[post.id] || [];
          const isLeadership = (ADMIN_ROLES as readonly string[]).includes(post.author.role);

          return (
            <div
              key={post.id}
              className={cn(
                "bg-[#0D1B2A] border rounded-xl overflow-hidden transition-all",
                post.is_pinned ? "border-gold/30 ring-1 ring-gold/10" : "border-slate-700/50"
              )}
            >
              {/* Post Header */}
              <div className="px-5 pt-4 pb-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Avatar */}
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold",
                      isLeadership ? "bg-gold/20 text-gold" : "bg-slate-700/50 text-slate-300"
                    )}>
                      {post.author.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white truncate">{post.author.full_name}</p>
                        {isLeadership && (
                          <Badge variant="gold">{ROLE_LABELS[post.author.role] || post.author.role}</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        {post.author.company && <span>{post.author.company}</span>}
                        <span>· {timeAgo(post.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {post.is_pinned && (
                      <Pin size={14} className="text-gold" />
                    )}
                    <div className={cn("px-2 py-0.5 rounded-md border text-[10px] font-medium", catConfig.color)}>
                      {catConfig.label}
                    </div>
                  </div>
                </div>

                {/* Post Content */}
                <div className="mt-3">
                  <h3 className="text-base font-semibold text-white">{post.title}</h3>
                  {post.is_opportunity && post.opportunity_type && (
                    <Badge variant={post.opportunity_type === "oferta" ? "success" : "warning"} className="mt-1">
                      {post.opportunity_type === "oferta" ? "Ofereço" : "Procuro"}
                    </Badge>
                  )}
                  <p className="text-sm text-slate-300 mt-2 whitespace-pre-wrap leading-relaxed">
                    {post.content.length > 300 && !isExpanded
                      ? post.content.slice(0, 300) + "..."
                      : post.content}
                  </p>
                  {post.content.length > 300 && (
                    <button onClick={() => toggleExpand(post.id)} className="text-gold text-xs mt-1 hover:underline">
                      {isExpanded ? "Ver menos" : "Ver mais"}
                    </button>
                  )}
                </div>

                {/* Tags */}
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {post.tags.map((tag) => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 bg-slate-800/50 text-slate-400 rounded-md border border-slate-700/30">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions Bar */}
              <div className="px-5 py-2.5 border-t border-slate-800/50 flex items-center gap-4">
                <button
                  onClick={() => handleLike(post.id)}
                  className={cn(
                    "flex items-center gap-1.5 text-xs transition-colors",
                    isLiked ? "text-red-400" : "text-slate-500 hover:text-red-400"
                  )}
                >
                  <Heart size={15} fill={isLiked ? "currentColor" : "none"} />
                  {post.likes_count > 0 && <span>{post.likes_count}</span>}
                </button>

                <button
                  onClick={() => toggleExpand(post.id)}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-white transition-colors"
                >
                  <MessageCircle size={15} />
                  {post.comments_count > 0 && <span>{post.comments_count}</span>}
                </button>

                <div className="ml-auto flex items-center gap-2">
                  {isAdmin && (
                    <button
                      onClick={() => handlePin(post.id)}
                      className={cn(
                        "p-1.5 rounded-lg text-xs transition-colors",
                        post.is_pinned ? "text-gold bg-gold/10" : "text-slate-500 hover:text-gold hover:bg-gold/5"
                      )}
                      title={post.is_pinned ? "Desafixar" : "Fixar"}
                    >
                      <Pin size={14} />
                    </button>
                  )}
                  {(isAdmin || isAuthor) && (
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Comments Section */}
              {isExpanded && (
                <div className="border-t border-slate-800/50 bg-slate-900/20">
                  {/* Existing comments */}
                  {postComments.length > 0 && (
                    <div className="divide-y divide-slate-800/30">
                      {postComments.map((c) => (
                        <div key={c.id} className="px-5 py-3 flex items-start gap-3">
                          <div className="w-7 h-7 rounded-full bg-slate-700/50 flex items-center justify-center flex-shrink-0 text-[10px] font-semibold text-slate-300">
                            {c.author.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-white">{c.author.full_name}</span>
                              <span className="text-[10px] text-slate-500">{timeAgo(c.created_at)}</span>
                            </div>
                            <p className="text-xs text-slate-300 mt-0.5">{c.content}</p>
                          </div>
                          {(isAdmin || c.author_id === currentMember.id) && (
                            <button
                              onClick={() => handleDeleteComment(c.id)}
                              className="text-slate-600 hover:text-red-400 transition-colors flex-shrink-0"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add comment */}
                  <div className="px-5 py-3 flex items-center gap-2 border-t border-slate-800/30">
                    <input
                      type="text"
                      placeholder="Escreva um comentário..."
                      value={commentText[post.id] || ""}
                      onChange={(e) => setCommentText((prev) => ({ ...prev, [post.id]: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === "Enter") handleComment(post.id); }}
                      className="flex-1 px-3 py-2 text-xs bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder:text-slate-500 focus:border-gold/40 focus:outline-none"
                    />
                    <button
                      onClick={() => handleComment(post.id)}
                      disabled={!commentText[post.id]?.trim()}
                      className="p-2 bg-gold/10 text-gold rounded-lg hover:bg-gold/20 transition-colors disabled:opacity-30"
                    >
                      <Send size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* New Post Modal */}
      <Modal open={showNewPost} onClose={() => setShowNewPost(false)} title="Nova Publicação" size="lg">
        <form onSubmit={handleCreatePost} className="space-y-4">
          {/* Category */}
          <div>
            <label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-2">Categoria</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(CATEGORY_CONFIG) as PostCategory[]).map((cat) => {
                const config = CATEGORY_CONFIG[cat];
                const CatIcon = config.icon;
                return (
                  <label
                    key={cat}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors text-xs",
                      "has-[:checked]:bg-gold/10 has-[:checked]:border-gold/30 has-[:checked]:text-gold",
                      "border-slate-700/50 text-slate-400 hover:border-slate-600"
                    )}
                  >
                    <input type="radio" name="category" value={cat} defaultChecked={cat === "geral"} className="hidden" />
                    <CatIcon size={14} />
                    {config.label}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Título *</label>
            <input
              name="title"
              required
              placeholder="Título da publicação"
              className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder:text-slate-500 focus:border-gold/40 focus:outline-none"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Conteúdo *</label>
            <textarea
              name="content"
              required
              rows={5}
              placeholder="Compartilhe uma oportunidade, anúncio ou discussão com os membros..."
              className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder:text-slate-500 focus:border-gold/40 focus:outline-none resize-none"
            />
          </div>

          {/* Opportunity Type */}
          <div>
            <label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Tipo de Oportunidade (se aplicável)</label>
            <select
              name="opportunity_type"
              className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:border-gold/40 focus:outline-none"
            >
              <option value="">Não é oportunidade</option>
              <option value="oferta">Ofereço (serviço/produto/parceria)</option>
              <option value="procura">Procuro (fornecedor/parceiro/serviço)</option>
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Tags (separadas por vírgula)</label>
            <input
              name="tags"
              placeholder="Ex: importação, construção, contabilidade"
              className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder:text-slate-500 focus:border-gold/40 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-700/50">
            <button type="button" onClick={() => setShowNewPost(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white rounded-lg transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium bg-gold text-navy rounded-lg hover:bg-light-gold transition-colors disabled:opacity-50">
              {loading ? "Publicando..." : "Publicar"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
