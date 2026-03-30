"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Send,
  MessageCircle,
  Search,
  Users,
  Plus,
  ChevronLeft,
  X,
  Paperclip,
  Film,
  FileText,
  Download,
  Trash2,
} from "lucide-react";
import {
  getMessages,
  sendMessage,
  getOrCreateConversation,
  getAvailableMembers,
  deleteDirectMessage,
} from "@/lib/actions/chat";
import { cn, ROLE_LABELS } from "@/lib/utils";
import type { DirectConversation, DirectMessage } from "@/types/database";

interface DirectChatViewProps {
  conversations: DirectConversation[];
  currentMemberId: string;
}

interface AvailableMember {
  id: string;
  full_name: string;
  company: string | null;
  role: string;
}

export default function DirectChatView({ conversations, currentMemberId }: DirectChatViewProps) {
  const router = useRouter();
  const [convList, setConvList] = useState<DirectConversation[]>(conversations);
  const [selected, setSelected] = useState<DirectConversation | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewConvModal, setShowNewConvModal] = useState(false);
  const [availableMembers, setAvailableMembers] = useState<AvailableMember[]>([]);
  const [memberSearch, setMemberSearch] = useState("");
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [attachment, setAttachment] = useState<{ file: File; preview: string | null; mediaType: "image" | "video" | "file" } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [hoveredMessage, setHoveredMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectConversation = useCallback(async (conv: DirectConversation) => {
    setSelected(conv);
    setMobileShowChat(true);
    setLoading(true);
    try {
      const msgs = await getMessages(conv.id);
      setMessages(msgs);
      // Clear unread count locally
      setConvList((prev) =>
        prev.map((c) => (c.id === conv.id ? { ...c, unread_count: 0 } : c))
      );
    } catch {
      toast.error("Erro ao carregar mensagens");
    }
    setLoading(false);
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Poll for new messages when conversation is selected
  useEffect(() => {
    if (!selected) return;
    const interval = setInterval(async () => {
      try {
        const msgs = await getMessages(selected.id);
        setMessages(msgs);
      } catch {
        /* silent */
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [selected]);

  // Refresh conversation list every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 30000);
    return () => clearInterval(interval);
  }, [router]);

  // Sync props with local state
  useEffect(() => {
    setConvList(conversations);
  }, [conversations]);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Limite: 10MB");
      return;
    }
    let mediaType: "image" | "video" | "file" = "file";
    let preview: string | null = null;
    if (file.type.startsWith("image/")) {
      mediaType = "image";
      preview = URL.createObjectURL(file);
    } else if (file.type.startsWith("video/")) {
      mediaType = "video";
    }
    setAttachment({ file, preview, mediaType });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function clearAttachment() {
    if (attachment?.preview) URL.revokeObjectURL(attachment.preview);
    setAttachment(null);
  }

  async function handleSend() {
    if ((!newMessage.trim() && !attachment) || !selected || sending) return;
    setSending(true);
    try {
      let mediaUrl: string | undefined;
      let mediaType: string | undefined;
      let mediaName: string | undefined;

      if (attachment) {
        setUploading(true);
        try {
          const { createClient: createBrowserClient } = await import("@/lib/supabase/client");
          const supabase = createBrowserClient();
          const path = `${Date.now()}-${attachment.file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
          const { error: uploadError } = await supabase.storage
            .from("chat-media")
            .upload(path, attachment.file, { upsert: true });
          if (uploadError) throw uploadError;
          const { data: urlData } = supabase.storage.from("chat-media").getPublicUrl(path);
          mediaUrl = urlData.publicUrl;
          mediaType = attachment.mediaType;
          mediaName = attachment.file.name;
        } catch (err) {
          toast.error(`Erro no upload: ${err instanceof Error ? err.message : "Falha"}`);
          setSending(false);
          setUploading(false);
          return;
        }
        setUploading(false);
      }

      await sendMessage(selected.id, newMessage.trim() || "", mediaUrl, mediaType, mediaName);
      const msgText = newMessage.trim();
      setNewMessage("");
      clearAttachment();
      // Refresh messages
      const msgs = await getMessages(selected.id);
      setMessages(msgs);
      // Update last message in list
      setConvList((prev) =>
        prev.map((c) =>
          c.id === selected.id
            ? { ...c, last_message: msgText || (mediaName ? `[${mediaType === "image" ? "Imagem" : mediaType === "video" ? "Video" : "Arquivo"}]` : ""), last_message_at: new Date().toISOString() }
            : c
        )
      );
    } catch {
      toast.error("Erro ao enviar mensagem");
    }
    setSending(false);
  }

  async function handleDeleteMessage(messageId: string) {
    if (!window.confirm("Apagar mensagem?")) return;
    try {
      await deleteDirectMessage(messageId);
      if (selected) {
        const msgs = await getMessages(selected.id);
        setMessages(msgs);
      }
    } catch {
      toast.error("Erro ao apagar mensagem");
    }
  }

  async function openNewConvModal() {
    setShowNewConvModal(true);
    setLoadingMembers(true);
    try {
      const members = await getAvailableMembers();
      setAvailableMembers(members);
    } catch {
      toast.error("Erro ao carregar membros");
    }
    setLoadingMembers(false);
  }

  async function startConversation(memberId: string) {
    try {
      const conv = await getOrCreateConversation(memberId);
      setShowNewConvModal(false);
      setMemberSearch("");
      // Add to list if not already there
      setConvList((prev) => {
        const exists = prev.find((c) => c.id === conv.id);
        if (exists) return prev;
        return [conv, ...prev];
      });
      // Select the conversation
      selectConversation(conv);
      router.refresh();
    } catch {
      toast.error("Erro ao criar conversa");
    }
  }

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  const formatConvTime = (ts: string) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 86400000) return formatTime(ts);
    if (diff < 172800000) return "Ontem";
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const filteredConversations = convList.filter((conv) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const name = conv.other_member?.full_name?.toLowerCase() || "";
    const company = conv.other_member?.company?.toLowerCase() || "";
    return name.includes(term) || company.includes(term);
  });

  const filteredMembers = availableMembers.filter((m) => {
    if (!memberSearch) return true;
    const term = memberSearch.toLowerCase();
    return (
      m.full_name.toLowerCase().includes(term) ||
      (m.company || "").toLowerCase().includes(term)
    );
  });

  return (
    <>
      <div className="flex h-[calc(100vh-8rem)] bg-[#0D1B2A] border border-slate-700/50 rounded-xl overflow-hidden">
        {/* Conversation List */}
        <div
          className={cn(
            "w-full sm:w-80 border-r border-slate-700/50 flex flex-col flex-shrink-0",
            mobileShowChat ? "hidden sm:flex" : "flex"
          )}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-medium text-white">Conversas</h3>
                <p className="text-[11px] text-slate-500">
                  {convList.length} conversa{convList.length !== 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={openNewConvModal}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium bg-gold/10 text-gold border border-gold/20 rounded-lg hover:bg-gold/20 transition-colors"
              >
                <Plus size={13} />
                Nova Conversa
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar conversa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:border-gold/40 focus:outline-none"
              />
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => selectConversation(conv)}
                  className={cn(
                    "w-full flex items-start gap-3 px-4 py-3 text-left border-b border-slate-800/30 hover:bg-slate-800/30 transition-colors",
                    selected?.id === conv.id && "bg-gold/5 border-l-2 border-l-gold"
                  )}
                >
                  <div className="w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center flex-shrink-0">
                    <span className="text-gold text-xs font-semibold">
                      {getInitials(conv.other_member?.full_name || "?")}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-white truncate">
                        {conv.other_member?.full_name || "Membro"}
                      </p>
                      <span className="text-[10px] text-slate-500 flex-shrink-0">
                        {formatConvTime(conv.last_message_at)}
                      </span>
                    </div>
                    {conv.other_member?.company && (
                      <p className="text-[10px] text-slate-500 truncate">{conv.other_member.company}</p>
                    )}
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-[11px] text-slate-500 truncate">
                        {conv.last_message || "Nova conversa"}
                      </p>
                      {(conv.unread_count || 0) > 0 && (
                        <span className="ml-1 w-5 h-5 bg-gold rounded-full text-[10px] font-bold text-navy flex items-center justify-center flex-shrink-0">
                          {(conv.unread_count || 0) > 9 ? "9+" : conv.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <MessageCircle size={32} className="text-slate-600 mb-3" />
                <p className="text-sm text-slate-500">Nenhuma conversa</p>
                <p className="text-[11px] text-slate-600 text-center mt-1">
                  Inicie uma conversa com outro membro da c&acirc;mara
                </p>
                <button
                  onClick={openNewConvModal}
                  className="mt-3 flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-gold/10 text-gold border border-gold/20 rounded-lg hover:bg-gold/20 transition-colors"
                >
                  <Plus size={13} />
                  Nova Conversa
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div
          className={cn(
            "flex-1 flex flex-col",
            !mobileShowChat ? "hidden sm:flex" : "flex"
          )}
        >
          {selected ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setMobileShowChat(false);
                      setSelected(null);
                    }}
                    className="sm:hidden text-slate-400 hover:text-white p-1"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <div className="w-9 h-9 rounded-full bg-gold/15 flex items-center justify-center">
                    <span className="text-gold text-xs font-semibold">
                      {getInitials(selected.other_member?.full_name || "?")}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {selected.other_member?.full_name || "Membro"}
                    </p>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1.5">
                      {selected.other_member?.company && (
                        <span>{selected.other_member.company}</span>
                      )}
                      {selected.other_member?.company && selected.other_member?.role && (
                        <span className="text-slate-700">|</span>
                      )}
                      <span>{ROLE_LABELS[selected.other_member?.role || ""] || selected.other_member?.role}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin w-5 h-5 border-2 border-gold/30 border-t-gold rounded-full" />
                  </div>
                ) : messages.length > 0 ? (
                  messages.map((msg) => {
                    const isMine = msg.sender_id === currentMemberId;
                    return (
                      <div
                        key={msg.id}
                        className={cn("flex", isMine ? "justify-end" : "justify-start")}
                        onMouseEnter={() => setHoveredMessage(msg.id)}
                        onMouseLeave={() => setHoveredMessage(null)}
                      >
                        <div className="relative max-w-[75%]">
                          <div
                            className={cn(
                              "rounded-xl px-3.5 py-2.5",
                              isMine
                                ? "bg-gold/15 border border-gold/20"
                                : "bg-slate-800/60 border border-slate-700/30"
                            )}
                          >
                            {!isMine && msg.sender?.full_name && (
                              <p className="text-[10px] text-slate-400 mb-0.5 font-medium">
                                {msg.sender.full_name}
                              </p>
                            )}
                            {/* Media rendering */}
                            {msg.media_url && msg.media_type === "image" && (
                              <button onClick={() => setFullscreenImage(msg.media_url)} className="mt-1 block">
                                <img src={msg.media_url} alt={msg.media_name || "Imagem"} className="max-w-sm w-full rounded-lg border border-slate-700/30 hover:opacity-90 transition-opacity cursor-pointer" />
                              </button>
                            )}
                            {msg.media_url && msg.media_type === "video" && (
                              <video src={msg.media_url} controls className="max-w-sm w-full rounded-lg border border-slate-700/30 mt-1" />
                            )}
                            {msg.media_url && msg.media_type === "file" && (
                              <a href={msg.media_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 mt-1 px-3 py-2 bg-slate-800/50 border border-slate-700/30 rounded-lg hover:bg-slate-800/80 transition-colors max-w-sm">
                                <FileText size={16} className="text-gold flex-shrink-0" />
                                <span className="text-xs text-slate-300 truncate">{msg.media_name || "Arquivo"}</span>
                                <Download size={14} className="text-slate-500 flex-shrink-0 ml-auto" />
                              </a>
                            )}
                            {msg.content && (
                              <p className="text-sm text-white whitespace-pre-wrap break-words">
                                {msg.content}
                              </p>
                            )}
                            <p
                              className={cn(
                                "text-[10px] mt-1",
                                isMine ? "text-gold/50 text-right" : "text-slate-600"
                              )}
                            >
                              {formatTime(msg.created_at)}
                            </p>
                          </div>
                          {/* Delete button on hover (own messages only) */}
                          {isMine && hoveredMessage === msg.id && (
                            <button
                              onClick={() => handleDeleteMessage(msg.id)}
                              className="absolute top-1 -left-8 p-1 rounded-md bg-slate-800/80 border border-slate-700/50 text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-colors"
                              title="Apagar mensagem"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-sm text-slate-500">Nenhuma mensagem nesta conversa</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Attachment preview */}
              {attachment && (
                <div className="px-4 py-2 border-t border-slate-700/30 bg-slate-800/30">
                  <div className="flex items-center gap-3">
                    {attachment.mediaType === "image" && attachment.preview ? (
                      <img src={attachment.preview} alt="Preview" className="h-16 rounded-lg border border-slate-700/30 object-cover" />
                    ) : attachment.mediaType === "video" ? (
                      <div className="flex items-center gap-2 px-3 py-2 bg-slate-700/30 rounded-lg">
                        <Film size={16} className="text-gold" />
                        <span className="text-xs text-slate-300 truncate max-w-[200px]">{attachment.file.name}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-2 bg-slate-700/30 rounded-lg">
                        <FileText size={16} className="text-gold" />
                        <span className="text-xs text-slate-300 truncate max-w-[200px]">{attachment.file.name}</span>
                      </div>
                    )}
                    <button onClick={clearAttachment} className="p-1 text-slate-400 hover:text-red-400 transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Message Input */}
              <div className="px-4 py-3 border-t border-slate-700/50">
                <div className="flex items-end gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2.5 text-slate-400 hover:text-gold transition-colors"
                    title="Anexar arquivo"
                  >
                    <Paperclip size={18} />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/mp4,video/quicktime,.pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Escreva uma mensagem..."
                    rows={1}
                    className="flex-1 px-3 py-2.5 text-sm bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:border-gold/40 focus:outline-none resize-none"
                  />
                  <button
                    onClick={handleSend}
                    disabled={(!newMessage.trim() && !attachment) || sending}
                    className="p-2.5 bg-gold text-navy rounded-xl hover:bg-light-gold transition-colors disabled:opacity-30"
                  >
                    {uploading ? (
                      <div className="animate-spin w-4 h-4 border-2 border-navy/30 border-t-navy rounded-full" />
                    ) : (
                      <Send size={16} />
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center">
              <MessageCircle size={40} className="text-slate-700 mb-3" />
              <p className="text-sm text-slate-500">Selecione uma conversa ou inicie uma nova</p>
              <p className="text-[11px] text-slate-600 mt-1">
                Converse diretamente com membros da c&acirc;mara
              </p>
              <button
                onClick={openNewConvModal}
                className="mt-4 flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-gold/10 text-gold border border-gold/20 rounded-lg hover:bg-gold/20 transition-colors"
              >
                <Plus size={13} />
                Nova Conversa
              </button>
            </div>
          )}
        </div>
      </div>

      {/* New Conversation Modal */}
      {showNewConvModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#0D1B2A] border border-slate-700/50 rounded-xl w-full max-w-md max-h-[70vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-gold" />
                <h3 className="text-sm font-medium text-white">Nova Conversa</h3>
              </div>
              <button
                onClick={() => {
                  setShowNewConvModal(false);
                  setMemberSearch("");
                }}
                className="text-slate-400 hover:text-white p-1"
              >
                <X size={16} />
              </button>
            </div>

            {/* Search */}
            <div className="px-4 py-3 border-b border-slate-700/50">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Buscar por nome ou empresa..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  autoFocus
                  className="w-full pl-8 pr-3 py-2 text-xs bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:border-gold/40 focus:outline-none"
                />
              </div>
            </div>

            {/* Member List */}
            <div className="flex-1 overflow-y-auto">
              {loadingMembers ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-5 h-5 border-2 border-gold/30 border-t-gold rounded-full" />
                </div>
              ) : filteredMembers.length > 0 ? (
                filteredMembers.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => startConversation(m.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left border-b border-slate-800/30 hover:bg-slate-800/30 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-gold/15 flex items-center justify-center flex-shrink-0">
                      <span className="text-gold text-xs font-semibold">
                        {getInitials(m.full_name)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">{m.full_name}</p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {m.company && <span>{m.company} &middot; </span>}
                        {ROLE_LABELS[m.role] || m.role}
                      </p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 px-4">
                  <Users size={24} className="text-slate-600 mb-2" />
                  <p className="text-sm text-slate-500">Nenhum membro encontrado</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Image Viewer */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setFullscreenImage(null)}
        >
          <button
            onClick={() => setFullscreenImage(null)}
            className="absolute top-4 right-4 text-white/60 hover:text-white p-2"
          >
            <X size={24} />
          </button>
          <img
            src={fullscreenImage}
            alt="Imagem completa"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
