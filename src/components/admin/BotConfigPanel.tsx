"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Bot, Save, Power, Clock, Zap, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateBotConfig } from "@/lib/actions/bot-config";
import type { BotConfig } from "@/types/database";

interface BotConfigPanelProps {
  config: BotConfig | null;
}

const MODEL_OPTIONS = [
  { value: "deepseek-chat", label: "DeepSeek Chat", desc: "Rápido e econômico" },
  { value: "deepseek-reasoner", label: "DeepSeek Reasoner", desc: "Raciocínio avançado" },
  { value: "gpt-4o-mini", label: "GPT-4o Mini", desc: "OpenAI rápido" },
  { value: "gpt-4o", label: "GPT-4o", desc: "OpenAI premium" },
  { value: "claude-sonnet-4-6", label: "Claude Sonnet 4.6", desc: "Anthropic balanced" },
];

export default function BotConfigPanel({ config }: BotConfigPanelProps) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    is_active: config?.is_active ?? false,
    model: config?.model ?? "deepseek-chat",
    system_prompt: config?.system_prompt ?? "",
    max_tokens: config?.max_tokens ?? 500,
    temperature: config?.temperature ?? 0.7,
    auto_reply_enabled: config?.auto_reply_enabled ?? false,
    auto_reply_delay_ms: config?.auto_reply_delay_ms ?? 2000,
    working_hours_only: config?.working_hours_only ?? false,
    working_hours_start: config?.working_hours_start ?? "08:00",
    working_hours_end: config?.working_hours_end ?? "18:00",
  });

  async function handleSave() {
    setSaving(true);
    const result = await updateBotConfig(form);
    if ("error" in result) {
      toast.error(result.error);
    } else {
      toast.success("Configuração do bot salva");
    }
    setSaving(false);
  }

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="bg-white border border-corp-border rounded-lg p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot size={18} className="text-accent" />
          <h3 className="text-sm font-medium text-corp-text">Assistente Virtual (WhatsApp Bot)</h3>
        </div>
        <button
          onClick={() => updateField("is_active", !form.is_active)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
            form.is_active
              ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
              : "bg-white text-corp-muted border border-corp-border"
          )}
        >
          <Power size={12} />
          {form.is_active ? "Ativo" : "Inativo"}
        </button>
      </div>

      {/* Model Selection */}
      <div>
        <label className="text-[11px] text-corp-muted uppercase tracking-wider block mb-2">
          <Brain size={10} className="inline mr-1" />
          Modelo de AI
        </label>
        <div className="grid sm:grid-cols-3 gap-2">
          {MODEL_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateField("model", opt.value)}
              className={cn(
                "p-3 rounded-lg text-left border transition-colors",
                form.model === opt.value
                  ? "border-accent/30 bg-accent/10"
                  : "border-corp-border hover:border-corp-muted/50"
              )}
            >
              <p className="text-xs font-medium text-corp-text">{opt.label}</p>
              <p className="text-[10px] text-corp-muted">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* System Prompt */}
      <div>
        <label className="text-[11px] text-corp-muted uppercase tracking-wider block mb-2">
          Personalidade / System Prompt
        </label>
        <textarea
          value={form.system_prompt}
          onChange={(e) => updateField("system_prompt", e.target.value)}
          rows={5}
          className="w-full bg-white border border-corp-border rounded-lg px-3 py-2 text-sm text-corp-text placeholder-corp-muted focus:border-accent/30 focus:outline-none resize-y"
          placeholder="Você é o assistente virtual da BSWFCC..."
        />
        <p className="text-[10px] text-corp-muted mt-1">{form.system_prompt.length} caracteres</p>
      </div>

      {/* Parameters Row */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="text-[11px] text-corp-muted uppercase tracking-wider block mb-2">
            Max Tokens
          </label>
          <input
            type="number"
            min={100}
            max={4000}
            step={50}
            value={form.max_tokens}
            onChange={(e) => updateField("max_tokens", parseInt(e.target.value) || 500)}
            className="w-full bg-white border border-corp-border rounded-lg px-3 py-2 text-sm text-corp-text focus:border-accent/30 focus:outline-none"
          />
          <p className="text-[10px] text-corp-muted mt-1">Tamanho max da resposta</p>
        </div>
        <div>
          <label className="text-[11px] text-corp-muted uppercase tracking-wider block mb-2">
            Temperatura
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={form.temperature}
              onChange={(e) => updateField("temperature", parseFloat(e.target.value))}
              className="flex-1 accent-accent"
            />
            <span className="text-sm text-corp-text font-mono w-8">{form.temperature}</span>
          </div>
          <p className="text-[10px] text-corp-muted mt-1">0 = preciso, 1 = criativo</p>
        </div>
        <div>
          <label className="text-[11px] text-corp-muted uppercase tracking-wider block mb-2">
            Delay Resposta
          </label>
          <select
            value={form.auto_reply_delay_ms}
            onChange={(e) => updateField("auto_reply_delay_ms", parseInt(e.target.value))}
            className="w-full bg-white border border-corp-border rounded-lg px-3 py-2 text-sm text-corp-text focus:border-accent/30 focus:outline-none"
          >
            <option value={0}>Imediato</option>
            <option value={1000}>1 segundo</option>
            <option value={2000}>2 segundos</option>
            <option value={5000}>5 segundos</option>
            <option value={10000}>10 segundos</option>
          </select>
          <p className="text-[10px] text-corp-muted mt-1">Pausa antes de responder</p>
        </div>
      </div>

      {/* Auto-reply & Working Hours */}
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.auto_reply_enabled}
            onChange={(e) => updateField("auto_reply_enabled", e.target.checked)}
            className="accent-accent w-4 h-4 rounded"
          />
          <span className="text-sm text-corp-muted flex items-center gap-1">
            <Zap size={12} /> Auto-resposta ativa
          </span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.working_hours_only}
            onChange={(e) => updateField("working_hours_only", e.target.checked)}
            className="accent-accent w-4 h-4 rounded"
          />
          <span className="text-sm text-corp-muted flex items-center gap-1">
            <Clock size={12} /> Só horário comercial
          </span>
        </label>
      </div>

      {form.working_hours_only && (
        <div className="flex items-center gap-3 pl-6">
          <div>
            <label className="text-[10px] text-corp-muted block mb-1">Início</label>
            <input
              type="time"
              value={form.working_hours_start}
              onChange={(e) => updateField("working_hours_start", e.target.value)}
              className="bg-white border border-corp-border rounded-lg px-3 py-1.5 text-sm text-corp-text focus:border-accent/30 focus:outline-none"
            />
          </div>
          <span className="text-corp-muted mt-4">até</span>
          <div>
            <label className="text-[10px] text-corp-muted block mb-1">Fim</label>
            <input
              type="time"
              value={form.working_hours_end}
              onChange={(e) => updateField("working_hours_end", e.target.value)}
              className="bg-white border border-corp-border rounded-lg px-3 py-1.5 text-sm text-corp-text focus:border-accent/30 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Save */}
      <div className="flex justify-end pt-2 border-t border-corp-border">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
        >
          <Save size={14} />
          {saving ? "Salvando..." : "Salvar Configuração"}
        </button>
      </div>
    </div>
  );
}
