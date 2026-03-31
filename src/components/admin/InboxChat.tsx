"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Send, MessageCircle, Phone, Archive, RotateCcw,
  Bot, User, ChevronLeft, Wifi, WifiOff,
} from "lucide-react";
import { getMessages, markConversationRead, updateConversationStatus } from "@/lib/actions/messaging";
import { cn, formatDate } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import type { Conversation, Message } from "@/types/database";

interface InboxChatProps {
  conversations: Conversation[];
}

export default function InboxChat({ conversations }: InboxChatProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  async function selectConversation(conv: Conversation) {
    setSelected(conv);
    setMobileShowChat(true);
    setLoading(true);
    try {
      const msgs = await getMessages(conv.id);
      setMessages(msgs);
      if (conv.unread_count > 0) {
        await markConversationRead(conv.id);
        router.refresh();
      }
    } catch {
      toast.error("Erro ao carregar mensagens");
    }
    setLoading(false);
  }

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
      } catch { /* silent */ }
    }, 5000);
    return () => clearInterval(interval);
  }, [selected]);

  // Refresh conversation list every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 10000);
    return () => clearInterval(interval);
  }, [router]);

  async function handleSend() {
    if (!newMessage.trim() || !selected || sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: selected.id,
          content: newMessage.trim(),
        }),
      });
      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        setNewMessage("");
        // Refresh messages
        const msgs = await getMessages(selected.id);
        setMessages(msgs);
      }
    } catch {
      toast.error("Erro ao enviar mensagem");
    }
    setSending(false);
  }

  async function handleArchive() {
    if (!selected) return;
    try {
      await updateConversationStatus(selected.id, "archived");
      toast.success("Conversa arquivada");
      setSelected(null);
      setMobileShowChat(false);
      router.refresh();
    } catch {
      toast.error("Erro ao arquivar");
    }
  }

  async function handleReopen() {
    if (!selected) return;
    try {
      await updateConversationStatus(selected.id, "open");
      toast.success("Conversa reaberta");
      router.refresh();
    } catch {
      toast.error("Erro ao reabrir");
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

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white border border-corp-border rounded-xl overflow-hidden">
      {/* Conversation List — sidebar */}
      <div className={cn(
        "w-full sm:w-80 bg-[#E4E8EF] border-r border-corp-border flex flex-col flex-shrink-0",
        mobileShowChat ? "hidden sm:flex" : "flex"
      )}>
        <div className="px-4 py-3 border-b border-corp-border">
          <h3 className="text-sm font-medium text-corp-text">Conversas</h3>
          <p className="text-[11px] text-corp-muted">{conversations.length} conversa{conversations.length !== 1 ? "s" : ""}</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length > 0 ? (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => selectConversation(conv)}
                className={cn(
                  "w-full flex items-start gap-3 px-4 py-3 text-left border-b border-corp-border hover:bg-white transition-colors",
                  selected?.id === conv.id && "bg-gray-50"
                )}
              >
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-accent text-xs font-semibold">
                    {(conv.member_name || conv.whatsapp_number)?.[0]?.toUpperCase() || "?"}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-corp-text truncate">
                      {conv.member_name || formatPhone(conv.whatsapp_number)}
                    </p>
                    <span className="text-[10px] text-corp-muted flex-shrink-0">
                      {formatConvTime(conv.last_message_at)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-[11px] text-corp-muted truncate">{conv.last_message || "Nova conversa"}</p>
                    {conv.unread_count > 0 && (
                      <span className="ml-1 w-5 h-5 bg-accent rounded-full text-[10px] font-bold text-white flex items-center justify-center flex-shrink-0">
                        {conv.unread_count > 9 ? "9+" : conv.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <MessageCircle size={32} className="text-corp-muted mb-3" />
              <p className="text-sm text-corp-muted">Nenhuma conversa</p>
              <p className="text-[11px] text-corp-muted text-center mt-1">
                Conversas aparecerão aqui quando membros enviarem mensagens via WhatsApp.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={cn(
        "flex-1 flex flex-col",
        !mobileShowChat ? "hidden sm:flex" : "flex"
      )}>
        {selected ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-corp-border">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setMobileShowChat(false); setSelected(null); }}
                  className="sm:hidden text-corp-muted hover:text-corp-text p-1"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center">
                  <span className="text-accent text-xs font-semibold">
                    {(selected.member_name || "?")?.[0]?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-corp-text">
                    {selected.member_name || formatPhone(selected.whatsapp_number)}
                  </p>
                  <p className="text-[10px] text-corp-muted flex items-center gap-1">
                    <Phone size={9} /> {formatPhone(selected.whatsapp_number)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {selected.status === "open" ? (
                  <button onClick={handleArchive} className="p-2 text-corp-muted hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors" title="Arquivar">
                    <Archive size={16} />
                  </button>
                ) : (
                  <button onClick={handleReopen} className="p-2 text-corp-muted hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors" title="Reabrir">
                    <RotateCcw size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full" />
                </div>
              ) : messages.length > 0 ? (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex",
                      msg.direction === "outbound" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[75%] rounded-xl px-3.5 py-2.5",
                        msg.direction === "outbound"
                          ? "bg-accent text-white"
                          : "bg-gray-100 text-corp-text"
                      )}
                    >
                      {msg.is_from_bot && (
                        <div className="flex items-center gap-1 mb-1">
                          <Bot size={10} className="text-blue-400" />
                          <span className="text-[9px] text-blue-400 font-medium">BOT</span>
                        </div>
                      )}
                      {msg.sender_name && msg.direction === "outbound" && !msg.is_from_bot && (
                        <p className="text-[10px] text-white/70 mb-0.5">{msg.sender_name}</p>
                      )}
                      <p className={cn("text-sm whitespace-pre-wrap break-words", msg.direction === "outbound" ? "text-white" : "text-corp-text")}>{msg.content}</p>
                      <p className={cn(
                        "text-[10px] mt-1",
                        msg.direction === "outbound" ? "text-white/50 text-right" : "text-corp-muted"
                      )}>
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center py-8">
                  <p className="text-sm text-corp-muted">Nenhuma mensagem nesta conversa</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="px-4 py-3 border-t border-corp-border bg-white">
              <div className="flex items-end gap-2">
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
                  className="flex-1 px-3 py-2.5 text-sm bg-white border border-corp-border rounded-xl text-corp-text placeholder-corp-muted focus:border-accent/30 focus:outline-none resize-none"
                />
                <button
                  onClick={handleSend}
                  disabled={!newMessage.trim() || sending}
                  className="p-2.5 bg-accent text-white rounded-xl hover:bg-accent-dim transition-colors disabled:opacity-30"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center">
            <MessageCircle size={40} className="text-corp-muted mb-3" />
            <p className="text-sm text-corp-muted">Selecione uma conversa</p>
            <p className="text-[11px] text-corp-muted mt-1">ou aguarde novas mensagens via WhatsApp</p>
          </div>
        )}
      </div>
    </div>
  );
}

function formatPhone(phone: string): string {
  const clean = phone.replace(/[^0-9]/g, "");
  if (clean.length === 11 && clean.startsWith("1")) {
    return `+1 (${clean.slice(1, 4)}) ${clean.slice(4, 7)}-${clean.slice(7)}`;
  }
  if (clean.length >= 12) {
    return `+${clean.slice(0, 2)} (${clean.slice(2, 4)}) ${clean.slice(4, 9)}-${clean.slice(9)}`;
  }
  return phone;
}
