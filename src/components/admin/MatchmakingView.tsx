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
  const [selectedProfile, setSelectedProfile] = useState<ProfileWithMember | null>(null);
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
          <h1 className="text-xl font-semibold text-corp-text">Business Matchmaking</h1>
          <p className="text-sm text-corp-muted mt-0.5">{profiles.length} {profiles.length === 1 ? "empresa" : "empresas"} no diretório</p>
        </div>
        <button
          onClick={() => setShowProfile(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-navy text-white rounded-lg hover:bg-light-navy transition-colors"
        >
          <Sparkles size={16} /> {myProfile ? "Editar Perfil" : "Criar Perfil"}
        </button>
      </div>

      {!myProfile && (
        <div className="bg-navy/5 border border-navy/15 rounded-xl p-4 mb-6">
          <p className="text-sm text-navy">Complete seu Business Profile para aparecer no diretório e receber sugestões de networking.</p>
        </div>
      )}

      <div className="relative mb-4 max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-corp-muted" />
        <input
          type="text"
          placeholder="Buscar empresa, serviço, tag..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 border border-corp-border rounded-lg text-corp-text placeholder-slate-400 focus:border-navy/30 focus:outline-none"
        />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p) => (
          <div key={p.id} onClick={() => setSelectedProfile(p)} className="bg-white shadow-card border border-corp-border rounded-xl p-5 hover:border-navy/30 transition-colors cursor-pointer">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-navy/10 flex items-center justify-center flex-shrink-0">
                <span className="text-navy text-xs font-semibold">
                  {(p.members?.full_name || "").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() || "?"}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-corp-text truncate">{p.business_name || p.members?.full_name || ""}</p>
                <p className="text-[11px] text-corp-muted truncate">{p.members?.company} {p.members?.city ? `· ${p.members?.city}` : ""}</p>
              </div>
            </div>

            {p.description && <p className="text-xs text-slate-600 mb-3 line-clamp-2">{p.description}</p>}

            {p.services_offered.length > 0 && (
              <div className="mb-2">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Oferece</p>
                <div className="flex flex-wrap gap-1">
                  {p.services_offered.slice(0, 4).map((s) => (
                    <span key={s} className="px-1.5 py-0.5 text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {p.services_needed.length > 0 && (
              <div className="mb-3">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Precisa</p>
                <div className="flex flex-wrap gap-1">
                  {p.services_needed.slice(0, 4).map((s) => (
                    <span key={s} className="px-1.5 py-0.5 text-[10px] bg-blue-50 text-blue-700 border border-blue-200 rounded">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {p.member_id !== currentMember.id && (
              <button
                onClick={() => handleConnect(p.member_id, p.members?.full_name || "")}
                disabled={connecting === p.member_id}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium bg-navy/5 text-navy border border-navy/15 rounded-lg hover:bg-navy/10 transition-colors disabled:opacity-50"
              >
                <Handshake size={13} /> {connecting === p.member_id ? "Enviando..." : "Conectar"}
              </button>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-sm text-corp-muted">
            Nenhuma empresa encontrada.
          </div>
        )}
      </div>

      {/* Profile Detail Modal */}
      <Modal open={!!selectedProfile} onClose={() => setSelectedProfile(null)} title={selectedProfile?.business_name || selectedProfile?.members?.full_name || "Empresa"} size="md">
        {selectedProfile && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] text-corp-muted uppercase tracking-wider mb-1">Contato</p>
                <p className="text-sm text-corp-text">{selectedProfile.members?.full_name || "—"}</p>
              </div>
              <div>
                <p className="text-[11px] text-corp-muted uppercase tracking-wider mb-1">Empresa</p>
                <p className="text-sm text-corp-text">{selectedProfile.members?.company || "—"}</p>
              </div>
              <div>
                <p className="text-[11px] text-corp-muted uppercase tracking-wider mb-1">Indústria</p>
                <p className="text-sm text-corp-text">{selectedProfile.members?.industry || "—"}</p>
              </div>
              <div>
                <p className="text-[11px] text-corp-muted uppercase tracking-wider mb-1">Cidade</p>
                <p className="text-sm text-corp-text">{selectedProfile.members?.city || "—"}</p>
              </div>
              <div>
                <p className="text-[11px] text-corp-muted uppercase tracking-wider mb-1">Tipo</p>
                <p className="text-sm text-corp-text">{selectedProfile.business_type === "service" ? "Serviço" : selectedProfile.business_type === "product" ? "Produto" : selectedProfile.business_type === "both" ? "Ambos" : selectedProfile.business_type || "—"}</p>
              </div>
              {selectedProfile.website && (
                <div>
                  <p className="text-[11px] text-corp-muted uppercase tracking-wider mb-1">Website</p>
                  <a href={selectedProfile.website.startsWith("http") ? selectedProfile.website : `https://${selectedProfile.website}`} target="_blank" rel="noopener noreferrer" className="text-sm text-navy hover:text-light-navy flex items-center gap-1">{selectedProfile.website} <Globe size={11} /></a>
                </div>
              )}
            </div>
            {selectedProfile.description && (
              <div>
                <p className="text-[11px] text-corp-muted uppercase tracking-wider mb-1">Descrição</p>
                <p className="text-sm text-slate-600">{selectedProfile.description}</p>
              </div>
            )}
            {selectedProfile.services_offered.length > 0 && (
              <div>
                <p className="text-[11px] text-corp-muted uppercase tracking-wider mb-1">Serviços Oferecidos</p>
                <div className="flex flex-wrap gap-1.5 mt-1">{selectedProfile.services_offered.map((s) => <span key={s} className="px-2 py-0.5 text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">{s}</span>)}</div>
              </div>
            )}
            {selectedProfile.services_needed.length > 0 && (
              <div>
                <p className="text-[11px] text-corp-muted uppercase tracking-wider mb-1">Serviços que Precisa</p>
                <div className="flex flex-wrap gap-1.5 mt-1">{selectedProfile.services_needed.map((s) => <span key={s} className="px-2 py-0.5 text-[10px] bg-blue-50 text-blue-700 border border-blue-200 rounded">{s}</span>)}</div>
              </div>
            )}
            {selectedProfile.looking_for.length > 0 && (
              <div>
                <p className="text-[11px] text-corp-muted uppercase tracking-wider mb-1">Procurando</p>
                <div className="flex flex-wrap gap-1.5 mt-1">{selectedProfile.looking_for.map((l) => <span key={l} className="px-2 py-0.5 text-[10px] bg-navy/5 text-navy border border-navy/15 rounded">{l}</span>)}</div>
              </div>
            )}
            {selectedProfile.tags.length > 0 && (
              <div>
                <p className="text-[11px] text-corp-muted uppercase tracking-wider mb-1">Tags</p>
                <div className="flex flex-wrap gap-1.5 mt-1">{selectedProfile.tags.map((t) => <span key={t} className="px-2 py-0.5 text-[10px] bg-slate-100 text-corp-muted rounded">{t}</span>)}</div>
              </div>
            )}
            {selectedProfile.member_id !== currentMember.id && (
              <div className="pt-2 border-t border-corp-border">
                <button
                  onClick={() => { handleConnect(selectedProfile.member_id, selectedProfile.members?.full_name || ""); setSelectedProfile(null); }}
                  disabled={connecting === selectedProfile.member_id}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium bg-navy text-white rounded-lg hover:bg-light-navy transition-colors disabled:opacity-50"
                >
                  <Handshake size={14} /> {connecting === selectedProfile.member_id ? "Enviando..." : "Conectar"}
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Profile Form Modal */}
      <Modal open={showProfile} onClose={() => setShowProfile(false)} title="Business Profile" size="lg">
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] text-corp-muted uppercase tracking-wider mb-1">Nome da Empresa</label>
              <input name="business_name" defaultValue={myProfile?.business_name || ""} className="w-full px-3 py-2 text-sm bg-slate-50 border border-corp-border rounded-lg text-corp-text focus:border-navy/30 focus:outline-none" />
            </div>
            <div>
              <label className="block text-[11px] text-corp-muted uppercase tracking-wider mb-1">Tipo</label>
              <select name="business_type" defaultValue={myProfile?.business_type || "service"} className="w-full px-3 py-2 text-sm bg-slate-50 border border-corp-border rounded-lg text-corp-text focus:border-navy/30 focus:outline-none">
                <option value="product">Produto</option>
                <option value="service">Serviço</option>
                <option value="both">Ambos</option>
                <option value="other">Outro</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] text-corp-muted uppercase tracking-wider mb-1">Descrição</label>
              <textarea name="description" rows={2} defaultValue={myProfile?.description || ""} className="w-full px-3 py-2 text-sm bg-slate-50 border border-corp-border rounded-lg text-corp-text focus:border-navy/30 focus:outline-none resize-none" />
            </div>
            <div>
              <label className="block text-[11px] text-corp-muted uppercase tracking-wider mb-1">Serviços que Oferece (separar por vírgula)</label>
              <input name="services_offered" defaultValue={myProfile?.services_offered.join(", ") || ""} className="w-full px-3 py-2 text-sm bg-slate-50 border border-corp-border rounded-lg text-corp-text focus:border-navy/30 focus:outline-none" />
            </div>
            <div>
              <label className="block text-[11px] text-corp-muted uppercase tracking-wider mb-1">Serviços que Precisa (separar por vírgula)</label>
              <input name="services_needed" defaultValue={myProfile?.services_needed.join(", ") || ""} className="w-full px-3 py-2 text-sm bg-slate-50 border border-corp-border rounded-lg text-corp-text focus:border-navy/30 focus:outline-none" />
            </div>
            <div>
              <label className="block text-[11px] text-corp-muted uppercase tracking-wider mb-1">Indústrias Alvo (separar por vírgula)</label>
              <input name="target_industries" defaultValue={myProfile?.target_industries.join(", ") || ""} className="w-full px-3 py-2 text-sm bg-slate-50 border border-corp-border rounded-lg text-corp-text focus:border-navy/30 focus:outline-none" />
            </div>
            <div>
              <label className="block text-[11px] text-corp-muted uppercase tracking-wider mb-1">Website</label>
              <input name="website" defaultValue={myProfile?.website || ""} className="w-full px-3 py-2 text-sm bg-slate-50 border border-corp-border rounded-lg text-corp-text focus:border-navy/30 focus:outline-none" />
            </div>
            <div>
              <label className="block text-[11px] text-corp-muted uppercase tracking-wider mb-1">Tags (separar por vírgula)</label>
              <input name="tags" defaultValue={myProfile?.tags.join(", ") || ""} className="w-full px-3 py-2 text-sm bg-slate-50 border border-corp-border rounded-lg text-corp-text focus:border-navy/30 focus:outline-none" />
            </div>
            <div>
              <label className="block text-[11px] text-corp-muted uppercase tracking-wider mb-1">Idiomas (separar por vírgula)</label>
              <input name="languages" defaultValue={myProfile?.languages.join(", ") || "en, pt"} className="w-full px-3 py-2 text-sm bg-slate-50 border border-corp-border rounded-lg text-corp-text focus:border-navy/30 focus:outline-none" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-corp-border">
            <button type="button" onClick={() => setShowProfile(false)} className="px-4 py-2 text-sm text-corp-muted hover:text-corp-text hover:bg-slate-100 rounded-lg transition-colors">Cancelar</button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium bg-navy text-white rounded-lg hover:bg-light-navy transition-colors disabled:opacity-50">
              {loading ? "Salvando..." : "Salvar Perfil"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
