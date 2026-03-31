"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Send,
  Hash,
  Plus,
  ChevronLeft,
  X,
  Paperclip,
  Image,
  Film,
  FileText,
  Users2,
  Download,
  Trash2,
  Settings,
  Edit3,
  SmilePlus,
} from "lucide-react";
import {
  getChannels,
  getChannelMessages,
  sendChannelMessage,
  createChannel,
  deleteChannelMessage,
  updateChannel,
  deleteChannel,
  getMessageReactions,
  toggleReaction,
} from "@/lib/actions/group-chat";
import type { ReactionGroup } from "@/lib/actions/group-chat";
import { uploadChatMedia } from "@/lib/actions/upload";
import { cn, ROLE_LABELS, ADMIN_ROLES, formatTime, getInitials } from "@/lib/utils";
import type { ChatChannel, ChatMessage } from "@/types/database";

const REACTION_EMOJIS = ["👍", "❤️", "😂", "🔥", "👏", "🎯"];

interface GroupChatViewProps {
  channels: ChatChannel[];
  currentMemberId: string;
  currentMemberRole: string;
  currentMemberName: string;
  currentMemberCompany: string | null;
}

interface AttachedFile {
  file: File;
  preview: string | null;
  mediaType: "image" | "video" | "file";
}

export default function GroupChatView({
  channels,
  currentMemberId,
  currentMemberRole,
  currentMemberName,
  currentMemberCompany,
}: GroupChatViewProps) {
  const [channelList, setChannelList] = useState<ChatChannel[]>(channels);
  const [selected, setSelected] = useState<ChatChannel | null>(
    channels.find((c) => c.is_default) || channels[0] || null
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [showNewChannelModal, setShowNewChannelModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelDesc, setNewChannelDesc] = useState("");
  const [creatingChannel, setCreatingChannel] = useState(false);
  const [attachment, setAttachment] = useState<AttachedFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [hoveredMessage, setHoveredMessage] = useState<string | null>(null);
  const [showEditChannelModal, setShowEditChannelModal] = useState(false);
  const [editChannelName, setEditChannelName] = useState("");
  const [editChannelDesc, setEditChannelDesc] = useState("");
  const [savingChannel, setSavingChannel] = useState(false);
  const [showChannelMenu, setShowChannelMenu] = useState(false);
  const [reactions, setReactions] = useState<Record<string, ReactionGroup[]>>({});
  const [reactionPickerFor, setReactionPickerFor] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const isAdmin = ADMIN_ROLES.includes(
    currentMemberRole as (typeof ADMIN_ROLES)[number]
  );

  const loadReactions = useCallback(async (msgIds: string[]) => {
    if (msgIds.length === 0) return;
    try {
      const r = await getMessageReactions(msgIds);
      setReactions((prev) => ({ ...prev, ...r }));
    } catch { /* silent */ }
  }, []);

  const selectChannel = useCallback(async (channel: ChatChannel) => {
    setSelected(channel);
    setMobileShowChat(true);
    setLoading(true);
    try {
      const msgs = await getChannelMessages(channel.id);
      setMessages(msgs);
      loadReactions(msgs.map((m) => m.id));
    } catch {
      toast.error("Erro ao carregar mensagens");
    }
    setLoading(false);
  }, [loadReactions]);

  // Auto-select default channel on mount
  useEffect(() => {
    if (selected) {
      selectChannel(selected);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Poll for new messages every 15 seconds
  useEffect(() => {
    if (!selected) return;
    const interval = setInterval(async () => {
      try {
        const msgs = await getChannelMessages(selected.id);
        setMessages((prev) => {
          if (prev.length === msgs.length && prev[prev.length - 1]?.id === msgs[msgs.length - 1]?.id) {
            return prev;
          }
          loadReactions(msgs.map((m) => m.id));
          return msgs;
        });
      } catch {
        /* silent */
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [selected, loadReactions]);

  // Sync channels from props
  useEffect(() => {
    setChannelList(channels);
  }, [channels]);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // 10MB check
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

    // Reset the input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function clearAttachment() {
    if (attachment?.preview) {
      URL.revokeObjectURL(attachment.preview);
    }
    setAttachment(null);
  }

  async function handleSend() {
    if ((!newMessage.trim() && !attachment) || !selected || sending) return;
    setSending(true);

    try {
      let mediaUrl: string | null = null;
      let mediaType: string | null = null;
      let mediaName: string | null = null;

      // Upload file via server action (avoids HTTPS→HTTP mixed content blocking)
      if (attachment) {
        setUploading(true);
        const fd = new FormData();
        fd.append("file", attachment.file);
        const result = await uploadChatMedia(fd);
        if (result.error) throw new Error(result.error);
        mediaUrl = result.url!;
        mediaType = attachment.mediaType;
        mediaName = attachment.file.name;
      }

      await sendChannelMessage(
        selected.id,
        newMessage.trim() || null,
        mediaUrl,
        mediaType,
        mediaName
      );

      setNewMessage("");

      // Refresh messages
      const msgs = await getChannelMessages(selected.id);
      setMessages(msgs);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao enviar mensagem";
      if (msg.includes("storage") || msg.includes("upload") || msg.includes("bucket")) {
        toast.error("Erro ao enviar arquivo. Tente novamente.");
      } else {
        toast.error(msg);
      }
    } finally {
      setSending(false);
      setUploading(false);
      clearAttachment();
    }
  }

  async function handleCreateChannel() {
    if (!newChannelName.trim() || creatingChannel) return;
    setCreatingChannel(true);
    try {
      const channel = await createChannel(newChannelName, newChannelDesc);
      setChannelList((prev) => [...prev, channel]);
      setShowNewChannelModal(false);
      setNewChannelName("");
      setNewChannelDesc("");
      selectChannel(channel);

      // Refresh channel list
      const updatedChannels = await getChannels();
      setChannelList(updatedChannels);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao criar canal"
      );
    }
    setCreatingChannel(false);
  }

  async function handleDeleteMessage(messageId: string) {
    if (!window.confirm("Apagar mensagem?")) return;
    try {
      await deleteChannelMessage(messageId);
      if (selected) {
        const msgs = await getChannelMessages(selected.id);
        setMessages(msgs);
      }
    } catch {
      toast.error("Erro ao apagar mensagem");
    }
  }

  async function handleReaction(messageId: string, emoji: string) {
    setReactionPickerFor(null);
    try {
      const result = await toggleReaction(messageId, emoji);
      // Optimistically update
      setReactions((prev) => {
        const current = [...(prev[messageId] || [])];
        const idx = current.findIndex((g) => g.emoji === emoji);
        if (result.added) {
          if (idx >= 0) {
            current[idx] = { ...current[idx], count: current[idx].count + 1, members: [...current[idx].members, currentMemberId] };
          } else {
            current.push({ emoji, count: 1, members: [currentMemberId] });
          }
        } else {
          if (idx >= 0) {
            if (current[idx].count <= 1) {
              current.splice(idx, 1);
            } else {
              current[idx] = { ...current[idx], count: current[idx].count - 1, members: current[idx].members.filter((m) => m !== currentMemberId) };
            }
          }
        }
        return { ...prev, [messageId]: current };
      });
    } catch {
      toast.error("Erro ao reagir");
    }
  }

  async function handleEditChannel() {
    if (!selected || !editChannelName.trim() || savingChannel) return;
    setSavingChannel(true);
    try {
      await updateChannel(selected.id, editChannelName.trim(), editChannelDesc.trim());
      setSelected({ ...selected, name: editChannelName.trim(), description: editChannelDesc.trim() || null });
      setChannelList((prev) =>
        prev.map((c) =>
          c.id === selected.id
            ? { ...c, name: editChannelName.trim(), description: editChannelDesc.trim() || null }
            : c
        )
      );
      setShowEditChannelModal(false);
      toast.success("Canal atualizado");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao atualizar canal");
    }
    setSavingChannel(false);
  }

  async function handleDeleteChannel() {
    if (!selected) return;
    if (!window.confirm(`Excluir o canal "${selected.name}"? Esta ação não pode ser desfeita.`)) return;
    try {
      await deleteChannel(selected.id);
      setChannelList((prev) => prev.filter((c) => c.id !== selected.id));
      setSelected(null);
      setMobileShowChat(false);
      router.push("/grupo");
      toast.success("Canal excluído");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao excluir canal");
    }
  }

  function renderMedia(msg: ChatMessage) {
    if (!msg.media_url) return null;

    if (msg.media_type === "image") {
      return (
        <div className="mt-1.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={msg.media_url}
            alt={msg.media_name || "Imagem"}
            className="max-w-sm w-full rounded-lg border border-corp-border hover:opacity-90 transition-opacity cursor-pointer"
            onClick={() => setFullscreenImage(msg.media_url)}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
            }}
          />
          <a href={msg.media_url} target="_blank" rel="noopener noreferrer" className="hidden flex items-center gap-2 px-3 py-2 bg-white/[0.05] border border-corp-border rounded-lg text-xs text-corp-muted hover:text-accent transition-colors max-w-sm">
            {msg.media_name || "Imagem"} — Abrir em nova aba
          </a>
        </div>
      );
    }

    if (msg.media_type === "video") {
      return (
        <video
          src={msg.media_url}
          controls
          className="max-w-sm w-full rounded-lg border border-corp-border mt-1.5"
        />
      );
    }

    // File (PDF, etc.)
    return (
      <a
        href={msg.media_url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 mt-1.5 px-3 py-2 bg-white/[0.05] border border-corp-border rounded-lg hover:bg-white/[0.08] transition-colors max-w-sm"
      >
        <FileText size={16} className="text-accent flex-shrink-0" />
        <span className="text-xs text-corp-muted truncate">
          {msg.media_name || "Arquivo"}
        </span>
        <Download size={14} className="text-corp-muted flex-shrink-0 ml-auto" />
      </a>
    );
  }

  return (
    <>
      <div className="flex h-[calc(100vh-8rem)] bg-corp-card border border-corp-border rounded-xl overflow-hidden">
        {/* Channel List — sidebar */}
        <div
          className={cn(
            "w-full sm:w-72 bg-dark-navy border-r border-corp-border flex flex-col flex-shrink-0",
            mobileShowChat ? "hidden sm:flex" : "flex"
          )}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-corp-border">
            <div className="flex items-center justify-between mb-1">
              <div>
                <h3 className="text-sm font-medium text-corp-text flex items-center gap-1.5">
                  <Users2 size={15} className="text-accent" />
                  Canais
                </h3>
                <p className="text-[11px] text-corp-muted">
                  {channelList.length} canal{channelList.length !== 1 ? "is" : ""}
                </p>
              </div>
              {isAdmin && (
                <button
                  onClick={() => setShowNewChannelModal(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium bg-accent/10 text-accent border border-accent/20 rounded-lg hover:bg-accent/20 transition-colors"
                >
                  <Plus size={13} />
                  Novo Canal
                </button>
              )}
            </div>
          </div>

          {/* Channel list */}
          <div className="flex-1 overflow-y-auto">
            {channelList.length > 0 ? (
              channelList.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => selectChannel(channel)}
                  className={cn(
                    "w-full flex items-start gap-3 px-4 py-3 text-left border-b border-corp-border hover:bg-white/[0.03] transition-colors",
                    selected?.id === channel.id &&
                      "bg-accent/10 border-l-2 border-l-accent"
                  )}
                >
                  <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Hash size={16} className="text-accent" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-corp-text truncate">
                      {channel.name}
                    </p>
                    {channel.description && (
                      <p className="text-[10px] text-corp-muted truncate">
                        {channel.description}
                      </p>
                    )}
                  </div>
                </button>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <Hash size={32} className="text-corp-muted mb-3" />
                <p className="text-sm text-corp-muted">Nenhum canal</p>
                <p className="text-[11px] text-corp-muted text-center mt-1">
                  Canais de grupo ser&atilde;o listados aqui
                </p>
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
              <div className="flex items-center justify-between px-4 py-3 border-b border-corp-border">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setMobileShowChat(false);
                    }}
                    className="sm:hidden text-corp-muted hover:text-corp-text p-1"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Hash size={16} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-corp-text">
                      {selected.name}
                    </p>
                    {selected.description && (
                      <p className="text-[10px] text-corp-muted">
                        {selected.description}
                      </p>
                    )}
                  </div>
                </div>
                {isAdmin && (
                  <div className="relative">
                    <button
                      onClick={() => setShowChannelMenu((v) => !v)}
                      className="p-2 text-corp-muted hover:text-corp-text transition-colors rounded-lg hover:bg-white/[0.03]"
                    >
                      <Settings size={16} />
                    </button>
                    {showChannelMenu && (
                      <div className="absolute right-0 top-full mt-1 w-40 bg-corp-card border border-corp-border rounded-lg shadow-lg z-20 py-1">
                        <button
                          onClick={() => {
                            setEditChannelName(selected.name);
                            setEditChannelDesc(selected.description || "");
                            setShowEditChannelModal(true);
                            setShowChannelMenu(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-corp-muted hover:bg-white/[0.05] hover:text-corp-text transition-colors"
                        >
                          <Edit3 size={13} />
                          Editar
                        </button>
                        {!selected.is_default && (
                          <button
                            onClick={() => {
                              setShowChannelMenu(false);
                              handleDeleteChannel();
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 size={13} />
                            Excluir
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full" />
                  </div>
                ) : messages.length > 0 ? (
                  messages.map((msg) => {
                    const isMine = msg.sender_id === currentMemberId;
                    const canDelete = isMine || isAdmin;
                    return (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex group",
                          isMine ? "justify-end" : "justify-start"
                        )}
                        onMouseEnter={() => setHoveredMessage(msg.id)}
                        onMouseLeave={() => { setHoveredMessage(null); setReactionPickerFor(null); }}
                      >
                        {/* Avatar for others */}
                        {!isMine && (
                          <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                            <span className="text-accent text-[10px] font-semibold">
                              {getInitials(
                                msg.sender?.full_name || "?"
                              )}
                            </span>
                          </div>
                        )}
                        <div className="max-w-[75%]">
                          {/* Sender name above bubble for others */}
                          {!isMine && (
                            <p className="text-[11px] text-accent font-medium mb-0.5">{msg.sender?.full_name || "Membro"}</p>
                          )}
                          <div className="relative">
                            <div
                              className={cn(
                                "rounded-xl px-3.5 py-2.5",
                                isMine
                                  ? "bg-accent text-white"
                                  : "bg-white/[0.05] text-corp-text"
                              )}
                            >
                              {!isMine && msg.sender && (
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  {msg.sender.company && (
                                    <p className="text-[9px] text-corp-muted">
                                      {msg.sender.company}
                                    </p>
                                  )}
                                  {msg.sender.company && (
                                    <span className="text-[9px] text-corp-muted">
                                      |
                                    </span>
                                  )}
                                  <span className="text-[9px] px-1.5 py-0.5 bg-white/[0.08] text-corp-muted rounded-full">
                                    {ROLE_LABELS[msg.sender.role] ||
                                      msg.sender.role}
                                  </span>
                                </div>
                              )}

                              {/* Media */}
                              {renderMedia(msg)}

                              {/* Text content */}
                              {msg.content && (
                                <p className={cn("text-sm whitespace-pre-wrap break-words", isMine ? "text-white" : "text-corp-text")}>
                                  {msg.content}
                                </p>
                              )}

                              <p
                                className={cn(
                                  "text-[10px] mt-1",
                                  isMine
                                    ? "text-white/50 text-right"
                                    : "text-corp-muted"
                                )}
                              >
                                {formatTime(msg.created_at)}
                              </p>
                            </div>
                            {/* Action buttons on hover */}
                            {hoveredMessage === msg.id && (
                              <div className={cn(
                                "absolute top-1 flex items-center gap-0.5",
                                isMine ? "-left-16" : "-right-16"
                              )}>
                                <button
                                  onClick={() => setReactionPickerFor(reactionPickerFor === msg.id ? null : msg.id)}
                                  className="p-1 rounded-md bg-corp-card border border-corp-border text-corp-muted hover:text-accent hover:border-accent/20 transition-colors"
                                  title="Reagir"
                                >
                                  <SmilePlus size={12} />
                                </button>
                                {canDelete && (
                                  <button
                                    onClick={() => handleDeleteMessage(msg.id)}
                                    className="p-1 rounded-md bg-corp-card border border-corp-border text-corp-muted hover:text-red-400 hover:border-red-500/20 transition-colors"
                                    title="Apagar mensagem"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                )}
                              </div>
                            )}
                            {/* Reaction picker */}
                            {reactionPickerFor === msg.id && (
                              <div className={cn(
                                "absolute -bottom-8 z-10 flex items-center gap-0.5 bg-corp-card border border-corp-border rounded-full px-1.5 py-1 shadow-lg",
                                isMine ? "right-0" : "left-0"
                              )}>
                                {REACTION_EMOJIS.map((emoji) => (
                                  <button
                                    key={emoji}
                                    onClick={() => handleReaction(msg.id, emoji)}
                                    className="hover:scale-125 transition-transform px-1 text-base"
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          {/* Reaction display */}
                          {reactions[msg.id] && reactions[msg.id].length > 0 && (
                            <div className={cn("flex flex-wrap gap-1 mt-1", isMine ? "justify-end" : "justify-start")}>
                              {reactions[msg.id].map((r) => (
                                <button
                                  key={r.emoji}
                                  onClick={() => handleReaction(msg.id, r.emoji)}
                                  className={cn(
                                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-colors",
                                    r.members.includes(currentMemberId)
                                      ? "bg-accent/10 border-accent/20 text-accent"
                                      : "bg-white/[0.05] border-corp-border text-corp-muted hover:border-accent/20"
                                  )}
                                >
                                  <span>{r.emoji}</span>
                                  <span className="text-[10px] font-medium">{r.count}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-sm text-corp-muted">
                      Nenhuma mensagem neste canal
                    </p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Attachment preview */}
              {attachment && (
                <div className="px-4 py-2 border-t border-corp-border bg-white/[0.03]">
                  <div className="flex items-center gap-3">
                    {attachment.mediaType === "image" && attachment.preview ? (
                      <img
                        src={attachment.preview}
                        alt="Preview"
                        className="h-16 rounded-lg border border-corp-border object-cover"
                      />
                    ) : attachment.mediaType === "video" ? (
                      <div className="flex items-center gap-2 px-3 py-2 bg-white/[0.05] rounded-lg">
                        <Film size={16} className="text-accent" />
                        <span className="text-xs text-corp-muted truncate max-w-[200px]">
                          {attachment.file.name}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-2 bg-white/[0.05] rounded-lg">
                        <FileText size={16} className="text-accent" />
                        <span className="text-xs text-corp-muted truncate max-w-[200px]">
                          {attachment.file.name}
                        </span>
                      </div>
                    )}
                    <button
                      onClick={clearAttachment}
                      className="p-1 text-corp-muted hover:text-red-400 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Message Input */}
              <div className="px-4 py-3 border-t border-corp-border bg-corp-card">
                <div className="flex items-end gap-2">
                  {/* Attach button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2.5 text-corp-muted hover:text-accent transition-colors"
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
                    className="flex-1 px-3 py-2.5 text-sm bg-white/[0.03] border border-corp-border rounded-xl text-corp-text placeholder-corp-muted focus:border-accent/30 focus:outline-none resize-none"
                  />
                  <button
                    onClick={handleSend}
                    disabled={
                      (!newMessage.trim() && !attachment) || sending
                    }
                    className="p-2.5 bg-accent text-white rounded-xl hover:bg-accent-dim transition-colors disabled:opacity-30"
                  >
                    {uploading ? (
                      <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                    ) : (
                      <Send size={16} />
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center">
              <Hash size={40} className="text-corp-muted mb-3" />
              <p className="text-sm text-corp-muted">
                Selecione um canal para conversar
              </p>
              <p className="text-[11px] text-corp-muted mt-1">
                Converse com todos os membros da c&acirc;mara
              </p>
            </div>
          )}
        </div>
      </div>

      {/* New Channel Modal */}
      {showNewChannelModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-corp-card border border-corp-border rounded-xl w-full max-w-md flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-corp-border">
              <div className="flex items-center gap-2">
                <Hash size={16} className="text-accent" />
                <h3 className="text-sm font-medium text-corp-text">Novo Canal</h3>
              </div>
              <button
                onClick={() => {
                  setShowNewChannelModal(false);
                  setNewChannelName("");
                  setNewChannelDesc("");
                }}
                className="text-corp-muted hover:text-corp-text p-1"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <div className="px-4 py-4 space-y-3">
              <div>
                <label className="text-[11px] text-corp-muted font-medium mb-1 block">
                  Nome do Canal
                </label>
                <input
                  type="text"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  placeholder="Ex: Eventos, Marketing..."
                  autoFocus
                  className="w-full px-3 py-2 text-sm bg-white/[0.03] border border-corp-border rounded-lg text-corp-text placeholder-corp-muted focus:border-accent/30 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] text-corp-muted font-medium mb-1 block">
                  Descri&ccedil;&atilde;o (opcional)
                </label>
                <input
                  type="text"
                  value={newChannelDesc}
                  onChange={(e) => setNewChannelDesc(e.target.value)}
                  placeholder="Sobre o que é este canal..."
                  className="w-full px-3 py-2 text-sm bg-white/[0.03] border border-corp-border rounded-lg text-corp-text placeholder-corp-muted focus:border-accent/30 focus:outline-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 px-4 py-3 border-t border-corp-border">
              <button
                onClick={() => {
                  setShowNewChannelModal(false);
                  setNewChannelName("");
                  setNewChannelDesc("");
                }}
                className="px-3 py-2 text-xs text-corp-muted hover:text-corp-text hover:bg-white/[0.05] rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateChannel}
                disabled={!newChannelName.trim() || creatingChannel}
                className="px-4 py-2 text-xs font-medium bg-accent text-white rounded-lg hover:bg-accent-dim transition-colors disabled:opacity-30"
              >
                {creatingChannel ? "Criando..." : "Criar Canal"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Channel Modal */}
      {showEditChannelModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-corp-card border border-corp-border rounded-xl w-full max-w-md flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-corp-border">
              <div className="flex items-center gap-2">
                <Edit3 size={16} className="text-accent" />
                <h3 className="text-sm font-medium text-corp-text">Editar Canal</h3>
              </div>
              <button
                onClick={() => setShowEditChannelModal(false)}
                className="text-corp-muted hover:text-corp-text p-1"
              >
                <X size={16} />
              </button>
            </div>
            <div className="px-4 py-4 space-y-3">
              <div>
                <label className="text-[11px] text-corp-muted font-medium mb-1 block">
                  Nome do Canal
                </label>
                <input
                  type="text"
                  value={editChannelName}
                  onChange={(e) => setEditChannelName(e.target.value)}
                  autoFocus
                  className="w-full px-3 py-2 text-sm bg-white/[0.03] border border-corp-border rounded-lg text-corp-text placeholder-corp-muted focus:border-accent/30 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] text-corp-muted font-medium mb-1 block">
                  Descri&ccedil;&atilde;o (opcional)
                </label>
                <input
                  type="text"
                  value={editChannelDesc}
                  onChange={(e) => setEditChannelDesc(e.target.value)}
                  placeholder="Sobre o que é este canal..."
                  className="w-full px-3 py-2 text-sm bg-white/[0.03] border border-corp-border rounded-lg text-corp-text placeholder-corp-muted focus:border-accent/30 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 px-4 py-3 border-t border-corp-border">
              <button
                onClick={() => setShowEditChannelModal(false)}
                className="px-3 py-2 text-xs text-corp-muted hover:text-corp-text hover:bg-white/[0.05] rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleEditChannel}
                disabled={!editChannelName.trim() || savingChannel}
                className="px-4 py-2 text-xs font-medium bg-accent text-white rounded-lg hover:bg-accent-dim transition-colors disabled:opacity-30"
              >
                {savingChannel ? "Salvando..." : "Salvar"}
              </button>
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
