"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Send, Users, Filter } from "lucide-react";
import Modal from "@/components/ui/Modal";
import type { MessageTemplate } from "@/types/database";

interface BroadcastPanelProps {
  templates: MessageTemplate[];
}

export default function BroadcastPanel({ templates }: BroadcastPanelProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterIndustry, setFilterIndustry] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number; total: number } | null>(null);

  function applyTemplate(template: MessageTemplate) {
    setMessage(template.content);
  }

  async function handleBroadcast() {
    if (!message.trim()) return;
    setSending(true);
    setResult(null);
    try {
      const res = await fetch("/api/messages/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message.trim(),
          filter: {
            ...(filterRole ? { role: filterRole } : {}),
            ...(filterIndustry ? { industry: filterIndustry } : {}),
          },
        }),
      });
      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        setResult(data);
        toast.success(`Broadcast enviado: ${data.sent}/${data.total}`);
      }
    } catch {
      toast.error("Erro ao enviar broadcast");
    }
    setSending(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-xs font-medium bg-gold/10 text-gold border border-gold/20 rounded-lg hover:bg-gold/15 transition-colors"
      >
        <Send size={13} /> Broadcast
      </button>

      <Modal
        open={open}
        onClose={() => { setOpen(false); setResult(null); }}
        title="Broadcast WhatsApp"
        description="Enviar mensagem para todos os membros ativos com telefone cadastrado"
        size="lg"
      >
        <div className="space-y-4">
          {/* Templates */}
          {templates.length > 0 && (
            <div>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-2">Templates</p>
              <div className="flex flex-wrap gap-1.5">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => applyTemplate(t)}
                    className="px-2.5 py-1 text-[11px] bg-slate-800/50 text-slate-300 border border-slate-700/50 rounded-md hover:border-gold/30 transition-colors"
                  >
                    {t.name.replace(/_/g, " ")}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">
                Filtro: Cargo (opcional)
              </label>
              <input
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                placeholder="Ex: membro, parceiro_estrategico"
                className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:border-gold/40 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">
                Filtro: Indústria (opcional)
              </label>
              <input
                value={filterIndustry}
                onChange={(e) => setFilterIndustry(e.target.value)}
                placeholder="Ex: Construção, Tecnologia"
                className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:border-gold/40 focus:outline-none"
              />
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Mensagem *</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              placeholder="Escreva a mensagem do broadcast..."
              className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:border-gold/40 focus:outline-none resize-none"
            />
          </div>

          {/* Result */}
          {result && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
              <p className="text-sm text-emerald-400">
                Enviado para {result.sent} de {result.total} membros
                {result.failed > 0 && <span className="text-red-400"> ({result.failed} falhas)</span>}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-700/50">
            <button
              onClick={() => { setOpen(false); setResult(null); }}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              Fechar
            </button>
            <button
              onClick={handleBroadcast}
              disabled={!message.trim() || sending}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gold text-navy rounded-lg hover:bg-light-gold transition-colors disabled:opacity-50"
            >
              {sending ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Enviando...
                </>
              ) : (
                <>
                  <Send size={14} /> Enviar Broadcast
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
