"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sparkles, Handshake, X, RefreshCw, Zap, Building2, MapPin } from "lucide-react";
import { generateNetworkingSuggestions, updateSuggestionStatus } from "@/lib/actions/networking";
import { sendMatchRequest } from "@/lib/actions/matchmaking";
import Badge from "@/components/ui/Badge";
import type { Member } from "@/types/database";

type SuggestionWithMember = {
  id: string; score: number; reasons: string[]; status: string;
  members: { full_name: string; company: string | null; industry: string | null; city: string | null; avatar_url: string | null } | null;
  suggested_member_id: string;
};

interface NetworkingViewProps {
  suggestions: SuggestionWithMember[];
  currentMember: Member;
  hasProfile: boolean;
}

export default function NetworkingView({ suggestions, currentMember, hasProfile }: NetworkingViewProps) {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);

  async function handleGenerate() {
    setGenerating(true);
    const result = await generateNetworkingSuggestions(currentMember.id);
    if ("error" in result) toast.error(String(result.error));
    else { toast.success(`${result.suggestions} sugestões geradas`); router.refresh(); }
    setGenerating(false);
  }

  async function handleConnect(suggestionId: string, memberId: string, name: string) {
    setConnecting(suggestionId);
    const result = await sendMatchRequest(currentMember.id, memberId, `Sugestão de networking da BSWFCC AI`);
    if (result?.error) toast.error(result.error);
    else {
      await updateSuggestionStatus(suggestionId, "connected");
      toast.success(`Conectado com ${name}`);
      router.refresh();
    }
    setConnecting(null);
  }

  async function handleDismiss(id: string) {
    await updateSuggestionStatus(id, "dismissed");
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">Networking AI</h1>
          <p className="text-sm text-slate-500 mt-0.5">Sugestões inteligentes de conexões</p>
        </div>
        <button onClick={handleGenerate} disabled={generating || !hasProfile}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gold text-navy rounded-lg hover:bg-light-gold transition-colors disabled:opacity-50">
          {generating ? <RefreshCw size={16} className="animate-spin" /> : <Sparkles size={16} />}
          {generating ? "Gerando..." : "Gerar Sugestões"}
        </button>
      </div>

      {!hasProfile && (
        <div className="bg-gold/5 border border-gold/20 rounded-xl p-4 mb-6">
          <p className="text-sm text-gold">Complete seu Business Profile em <a href="/matchmaking" className="underline">Matchmaking</a> para receber sugestões personalizadas.</p>
        </div>
      )}

      {suggestions.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {suggestions.map((s) => (
            <div key={s.id} className="bg-[#0D1B2A] border border-slate-700/50 rounded-xl p-5 hover:border-slate-600 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-gold/15 flex items-center justify-center">
                    <span className="text-gold text-xs font-semibold">
                      {s.members?.full_name?.[0]?.toUpperCase() || "?"}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{s.members?.full_name}</p>
                    <p className="text-[11px] text-slate-500">{s.members?.company}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Zap size={12} className="text-gold" />
                  <span className="text-xs font-bold text-gold">{s.score}%</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3 text-[11px] text-slate-500">
                {s.members?.industry && <span>{s.members.industry}</span>}
                {s.members?.city && <span className="flex items-center gap-1"><MapPin size={9} />{s.members.city}</span>}
              </div>

              {s.reasons.length > 0 && (
                <div className="mb-3 space-y-1">
                  {s.reasons.slice(0, 3).map((r, i) => (
                    <p key={i} className="text-[10px] text-slate-400 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-gold flex-shrink-0" /> {r}
                    </p>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={() => handleConnect(s.id, s.suggested_member_id, s.members?.full_name || "")}
                  disabled={connecting === s.id}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium bg-gold/10 text-gold border border-gold/20 rounded-lg hover:bg-gold/15 transition-colors disabled:opacity-50">
                  <Handshake size={12} /> {connecting === s.id ? "..." : "Conectar"}
                </button>
                <button onClick={() => handleDismiss(s.id)}
                  className="p-2 text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 rounded-lg transition-colors">
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#0D1B2A] border border-slate-700/50 rounded-xl p-12 text-center">
          <Sparkles size={32} className="text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-400">Nenhuma sugestão disponível</p>
          <p className="text-[11px] text-slate-500 mt-1">Clique em "Gerar Sugestões" para encontrar conexões</p>
        </div>
      )}
    </div>
  );
}
