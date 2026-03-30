"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
} from "lucide-react";
import {
  getChannels,
  getChannelMessages,
  sendChannelMessage,
  createChannel,
} from "@/lib/actions/group-chat";
import { cn, ROLE_LABELS, ADMIN_ROLES } from "@/lib/utils";
import type { ChatChannel, ChatMessage } from "@/types/database";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = ADMIN_ROLES.includes(
    currentMemberRole as (typeof ADMIN_ROLES)[number]
  );

  const selectChannel = useCallback(async (channel: ChatChannel) => {
    setSelected(channel);
    setMobileShowChat(true);
    setLoading(true);
    try {
      const msgs = await getChannelMessages(channel.id);
      setMessages(msgs);
    } catch {
      toast.error("Erro ao carregar mensagens");
    }
    setLoading(false);
  }, []);

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

  // Poll for new messages every 5 seconds
  useEffect(() => {
    if (!selected) return;
    const interval = setInterval(async () => {
      try {
        const msgs = await getChannelMessages(selected.id);
        setMessages(msgs);
      } catch {
        /* silent */
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [selected]);

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

      // Upload file client-side directly to Supabase Storage
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
          toast.error(
            `Erro no upload: ${err instanceof Error ? err.message : "Falha no envio"}`
          );
          setSending(false);
          setUploading(false);
          return;
        }
        setUploading(false);
      }

      await sendChannelMessage(
        selected.id,
        newMessage.trim() || null,
        mediaUrl,
        mediaType,
        mediaName
      );

      setNewMessage("");
      clearAttachment();

      // Refresh messages
      const msgs = await getChannelMessages(selected.id);
      setMessages(msgs);
    } catch {
      toast.error("Erro ao enviar mensagem");
    }
    setSending(false);
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

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  function renderMedia(msg: ChatMessage) {
    if (!msg.media_url) return null;

    if (msg.media_type === "image") {
      return (
        <button
          onClick={() => setFullscreenImage(msg.media_url)}
          className="mt-1.5 block"
        >
          <img
            src={msg.media_url}
            alt={msg.media_name || "Imagem"}
            className="max-w-sm w-full rounded-lg border border-slate-700/30 hover:opacity-90 transition-opacity cursor-pointer"
          />
        </button>
      );
    }

    if (msg.media_type === "video") {
      return (
        <video
          src={msg.media_url}
          controls
          className="max-w-sm w-full rounded-lg border border-slate-700/30 mt-1.5"
        />
      );
    }

    // File (PDF, etc.)
    return (
      <a
        href={msg.media_url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 mt-1.5 px-3 py-2 bg-slate-800/50 border border-slate-700/30 rounded-lg hover:bg-slate-800/80 transition-colors max-w-sm"
      >
        <FileText size={16} className="text-gold flex-shrink-0" />
        <span className="text-xs text-slate-300 truncate">
          {msg.media_name || "Arquivo"}
        </span>
        <Download size={14} className="text-slate-500 flex-shrink-0 ml-auto" />
      </a>
    );
  }

  return (
    <>
      <div className="flex h-[calc(100vh-8rem)] bg-[#0D1B2A] border border-slate-700/50 rounded-xl overflow-hidden">
        {/* Channel List */}
        <div
          className={cn(
            "w-full sm:w-72 border-r border-slate-700/50 flex flex-col flex-shrink-0",
            mobileShowChat ? "hidden sm:flex" : "flex"
          )}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-700/50">
            <div className="flex items-center justify-between mb-1">
              <div>
                <h3 className="text-sm font-medium text-white flex items-center gap-1.5">
                  <Users2 size={15} className="text-gold" />
                  Canais
                </h3>
                <p className="text-[11px] text-slate-500">
                  {channelList.length} canal{channelList.length !== 1 ? "is" : ""}
                </p>
              </div>
              {isAdmin && (
                <button
                  onClick={() => setShowNewChannelModal(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium bg-gold/10 text-gold border border-gold/20 rounded-lg hover:bg-gold/20 transition-colors"
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
                    "w-full flex items-start gap-3 px-4 py-3 text-left border-b border-slate-800/30 hover:bg-slate-800/30 transition-colors",
                    selected?.id === channel.id &&
                      "bg-gold/5 border-l-2 border-l-gold"
                  )}
                >
                  <div className="w-9 h-9 rounded-lg bg-gold/15 flex items-center justify-center flex-shrink-0">
                    <Hash size={16} className="text-gold" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white truncate">
                      {channel.name}
                    </p>
                    {channel.description && (
                      <p className="text-[10px] text-slate-500 truncate">
                        {channel.description}
                      </p>
                    )}
                  </div>
                </button>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <Hash size={32} className="text-slate-600 mb-3" />
                <p className="text-sm text-slate-500">Nenhum canal</p>
                <p className="text-[11px] text-slate-600 text-center mt-1">
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
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setMobileShowChat(false);
                    }}
                    className="sm:hidden text-slate-400 hover:text-white p-1"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <div className="w-9 h-9 rounded-lg bg-gold/15 flex items-center justify-center">
                    <Hash size={16} className="text-gold" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {selected.name}
                    </p>
                    {selected.description && (
                      <p className="text-[10px] text-slate-500">
                        {selected.description}
                      </p>
                    )}
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
                        className={cn(
                          "flex",
                          isMine ? "justify-end" : "justify-start"
                        )}
                      >
                        {/* Avatar for others */}
                        {!isMine && (
                          <div className="w-8 h-8 rounded-full bg-gold/15 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                            <span className="text-gold text-[10px] font-semibold">
                              {getInitials(
                                msg.sender?.full_name || "?"
                              )}
                            </span>
                          </div>
                        )}
                        <div
                          className={cn(
                            "max-w-[75%] rounded-xl px-3.5 py-2.5",
                            isMine
                              ? "bg-gold/15 border border-gold/20"
                              : "bg-slate-800/60 border border-slate-700/30"
                          )}
                        >
                          {!isMine && msg.sender && (
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <p className="text-[10px] text-gold font-medium">
                                {msg.sender.full_name}
                              </p>
                              {msg.sender.company && (
                                <>
                                  <span className="text-[9px] text-slate-600">
                                    |
                                  </span>
                                  <p className="text-[9px] text-slate-500">
                                    {msg.sender.company}
                                  </p>
                                </>
                              )}
                              <span className="text-[9px] text-slate-600">
                                |
                              </span>
                              <span className="text-[9px] px-1.5 py-0.5 bg-slate-700/50 text-slate-400 rounded-full">
                                {ROLE_LABELS[msg.sender.role] ||
                                  msg.sender.role}
                              </span>
                            </div>
                          )}

                          {/* Media */}
                          {renderMedia(msg)}

                          {/* Text content */}
                          {msg.content && (
                            <p className="text-sm text-white whitespace-pre-wrap break-words">
                              {msg.content}
                            </p>
                          )}

                          <p
                            className={cn(
                              "text-[10px] mt-1",
                              isMine
                                ? "text-gold/50 text-right"
                                : "text-slate-600"
                            )}
                          >
                            {formatTime(msg.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-sm text-slate-500">
                      Nenhuma mensagem neste canal
                    </p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Attachment preview */}
              {attachment && (
                <div className="px-4 py-2 border-t border-slate-700/30 bg-slate-800/30">
                  <div className="flex items-center gap-3">
                    {attachment.mediaType === "image" && attachment.preview ? (
                      <img
                        src={attachment.preview}
                        alt="Preview"
                        className="h-16 rounded-lg border border-slate-700/30 object-cover"
                      />
                    ) : attachment.mediaType === "video" ? (
                      <div className="flex items-center gap-2 px-3 py-2 bg-slate-700/30 rounded-lg">
                        <Film size={16} className="text-gold" />
                        <span className="text-xs text-slate-300 truncate max-w-[200px]">
                          {attachment.file.name}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-2 bg-slate-700/30 rounded-lg">
                        <FileText size={16} className="text-gold" />
                        <span className="text-xs text-slate-300 truncate max-w-[200px]">
                          {attachment.file.name}
                        </span>
                      </div>
                    )}
                    <button
                      onClick={clearAttachment}
                      className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Message Input */}
              <div className="px-4 py-3 border-t border-slate-700/50">
                <div className="flex items-end gap-2">
                  {/* Attach button */}
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
                    disabled={
                      (!newMessage.trim() && !attachment) || sending
                    }
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
              <Hash size={40} className="text-slate-700 mb-3" />
              <p className="text-sm text-slate-500">
                Selecione um canal para conversar
              </p>
              <p className="text-[11px] text-slate-600 mt-1">
                Converse com todos os membros da c&acirc;mara
              </p>
            </div>
          )}
        </div>
      </div>

      {/* New Channel Modal */}
      {showNewChannelModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#0D1B2A] border border-slate-700/50 rounded-xl w-full max-w-md flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
              <div className="flex items-center gap-2">
                <Hash size={16} className="text-gold" />
                <h3 className="text-sm font-medium text-white">Novo Canal</h3>
              </div>
              <button
                onClick={() => {
                  setShowNewChannelModal(false);
                  setNewChannelName("");
                  setNewChannelDesc("");
                }}
                className="text-slate-400 hover:text-white p-1"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <div className="px-4 py-4 space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 font-medium mb-1 block">
                  Nome do Canal
                </label>
                <input
                  type="text"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  placeholder="Ex: Eventos, Marketing..."
                  autoFocus
                  className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:border-gold/40 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 font-medium mb-1 block">
                  Descri&ccedil;&atilde;o (opcional)
                </label>
                <input
                  type="text"
                  value={newChannelDesc}
                  onChange={(e) => setNewChannelDesc(e.target.value)}
                  placeholder="Sobre o que é este canal..."
                  className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:border-gold/40 focus:outline-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 px-4 py-3 border-t border-slate-700/50">
              <button
                onClick={() => {
                  setShowNewChannelModal(false);
                  setNewChannelName("");
                  setNewChannelDesc("");
                }}
                className="px-3 py-2 text-xs text-slate-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateChannel}
                disabled={!newChannelName.trim() || creatingChannel}
                className="px-4 py-2 text-xs font-medium bg-gold text-navy rounded-lg hover:bg-light-gold transition-colors disabled:opacity-30"
              >
                {creatingChannel ? "Criando..." : "Criar Canal"}
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
