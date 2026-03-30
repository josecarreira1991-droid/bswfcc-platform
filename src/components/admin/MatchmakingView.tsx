"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Handshake, Send, Building2, Globe, Tag, ChevronRight, Search, Sparkles } from "lucide-react";
import { sendMatchRequest, upsertBusinessProfile } from "@/lib/actions/matchmaking";
import { cn } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import type { BusinessProfile, Member } from "@/types/database";

type ProfileWithMember = BusinessProfile & {
  members: { full_name: string; company: string | null; industry: string | null; city: string | null; avatar_url: string | null } | null;
};

interface MatchmakingViewProps {
  currentMember: Member;
  myProfile: BusinessProfile | null;
  profiles: ProfileWithMember[];
}

export default function MatchmakingView({ currentMember, myProfile, profiles }: MatchmakingViewProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const filtered = search
    ? profiles.filter((p) =>
        (p.members?.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
        p.business_name?.toLowerCase().includes(search.toLowerCase()) ||
        p.services_offered.some((s) => s.toLowerCase().includes(search.toLowerCase())) ||
        p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
      )
    : profiles;

  async function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      const result = await upsertBusinessProfile(currentMember.id, form);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Perfil atualizado");
        setShowProfile(false);
        router.refresh();
      }
    } catch {
      toast.error("Erro de conexão. Tente novamente.");
    }
    setLoading(false);
  }

  async function handleConnect(toMemberId: string, toName: string) {
    setConnecting(toMemberId);
    try {
      const result = await sendMatchRequest(currentMember.id, toMemberId, `${currentMember.full_name} quer se conectar com você na BSWFCC.`);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(`Solicitação enviada para ${toName}`);
      }
    } catch {
      toast.error("Erro de conexão. Tente novamente.");
    }
    setConnecting(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">Business Matchmaking</h1>
          <p className="text-sm text-slate-500 mt-0.5">{profiles.length} empresas no diretório</p>
        </div>
        <button
          onClick={() => setShowProfile(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gold text-navy rounded-lg hover:bg-light-gold transition-colors"
        >
          <Sparkles size={16} /> {myProfile ? "Editar Perfil" : "Criar Perfil"}
        </button>
      </div>

      {!myProfile && (
        <div className="bg-gold/5 border border-gold/20 rounded-xl p-4 mb-6">
          <p className="text-sm text-gold">Complete seu Business Profile para aparecer no diretório e receber sugestões de networking.</p>
        </div>
      )}

      <div className="relative mb-4 max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Buscar empresa, serviço, tag..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-8 pr-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:border-gold/40 focus:outline-none"
        />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p) => (
          <div key={p.id} className="bg-[#0D1B2A] border border-slate-700/50 rounded-xl p-5 hover:border-slate-600 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center flex-shrink-0">
                <span className="text-gold text-xs font-semibold">
                  {(p.members?.full_name || "").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() || "?"}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{p.business_name || p.members?.full_name || ""}</p>
                <p className="text-[11px] text-slate-500 truncate">{p.members?.company} {p.members?.city ? `· ${p.members?.city}` : ""}</p>
              </div>
            </div>

            {p.description && <p className="text-xs text-slate-400 mb-3 line-clamp-2">{p.description}</p>}

            {p.services_offered.length > 0 && (
              <div className="mb-2">
                <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-1">Oferece</p>
                <div className="flex flex-wrap gap-1">
                  {p.services_offered.slice(0, 4).map((s) => (
                    <span key={s} className="px-1.5 py-0.5 text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {p.services_needed.length > 0 && (
              <div className="mb-3">
                <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-1">Precisa</p>
                <div className="flex flex-wrap gap-1">
                  {p.services_needed.slice(0, 4).map((s) => (
                    <span key={s} className="px-1.5 py-0.5 text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {p.member_id !== currentMember.id && (
              <button
                onClick={() => handleConnect(p.member_id, p.members?.full_name || "")}
                disabled={connecting === p.member_id}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium bg-gold/10 text-gold border border-gold/20 rounded-lg hover:bg-gold/15 transition-colors disabled:opacity-50"
              >
                <Handshake size={13} /> {connecting === p.member_id ? "Enviando..." : "Conectar"}
              </button>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-sm text-slate-500">
            Nenhuma empresa encontrada.
          </div>
        )}
      </div>

      {/* Profile Form Modal */}
      <Modal open={showProfile} onClose={() => setShowProfile(false)} title="Business Profile" size="lg">
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Nome da Empresa</label>
              <input name="business_name" defaultValue={myProfile?.business_name || ""} className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:border-gold/40 focus:outline-none" />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Tipo</label>
              <select name="business_type" defaultValue={myProfile?.business_type || "service"} className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:border-gold/40 focus:outline-none">
                <option value="product">Produto</option>
                <option value="service">Serviço</option>
                <option value="both">Ambos</option>
                <option value="other">Outro</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Descrição</label>
              <textarea name="description" rows={2} defaultValue={myProfile?.description || ""} className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:border-gold/40 focus:outline-none resize-none" />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Serviços que Oferece (separar por vírgula)</label>
              <input name="services_offered" defaultValue={myProfile?.services_offered.join(", ") || ""} className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:border-gold/40 focus:outline-none" />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Serviços que Precisa (separar por vírgula)</label>
              <input name="services_needed" defaultValue={myProfile?.services_needed.join(", ") || ""} className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:border-gold/40 focus:outline-none" />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Indústrias Alvo (separar por vírgula)</label>
              <input name="target_industries" defaultValue={myProfile?.target_industries.join(", ") || ""} className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:border-gold/40 focus:outline-none" />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Website</label>
              <input name="website" defaultValue={myProfile?.website || ""} className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:border-gold/40 focus:outline-none" />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Tags (separar por vírgula)</label>
              <input name="tags" defaultValue={myProfile?.tags.join(", ") || ""} className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:border-gold/40 focus:outline-none" />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Idiomas (separar por vírgula)</label>
              <input name="languages" defaultValue={myProfile?.languages.join(", ") || "en, pt"} className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:border-gold/40 focus:outline-none" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-700/50">
            <button type="button" onClick={() => setShowProfile(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white rounded-lg transition-colors">Cancelar</button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium bg-gold text-navy rounded-lg hover:bg-light-gold transition-colors disabled:opacity-50">
              {loading ? "Salvando..." : "Salvar Perfil"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
