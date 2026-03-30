"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Vote, Plus, BarChart2, Clock, CheckCircle2, Archive } from "lucide-react";
import { createPoll, updatePollStatus, vote as submitVote, getPollWithOptions, getPollResults } from "@/lib/actions/polls";
import { cn } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import type { Poll, PollOption, Member } from "@/types/database";

const statusConfig: Record<string, { label: string; variant: "warning" | "success" | "default" | "danger" }> = {
  draft: { label: "Rascunho", variant: "warning" },
  active: { label: "Ativa", variant: "success" },
  closed: { label: "Encerrada", variant: "default" },
  archived: { label: "Arquivada", variant: "danger" },
};

interface PollsViewProps {
  polls: Poll[];
  currentMember: Member;
  isAdmin: boolean;
}

export default function PollsView({ polls, currentMember, isAdmin }: PollsViewProps) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [viewPoll, setViewPoll] = useState<{ poll: Poll; options: PollOption[]; results: Record<string, number>; totalVoters: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [voting, setVoting] = useState(false);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const result = await createPoll(form);
    if (result?.error) toast.error(result.error);
    else { toast.success("Enquete criada"); setShowCreate(false); router.refresh(); }
    setLoading(false);
  }

  async function openPoll(poll: Poll) {
    setLoading(true);
    try {
      const [pollData, resultsData] = await Promise.all([
        getPollWithOptions(poll.id),
        getPollResults(poll.id),
      ]);
      setViewPoll({ poll: pollData.poll, options: pollData.options, results: resultsData.voteCounts, totalVoters: resultsData.totalVoters });
    } catch { toast.error("Erro ao carregar enquete"); }
    setLoading(false);
  }

  async function handleVote(optionId: string) {
    if (!viewPoll) return;
    setVoting(true);
    try {
      const result = await submitVote(viewPoll.poll.id, optionId, currentMember.id);
      if (result?.error) toast.error(result.error);
      else {
        toast.success("Voto registrado");
        const { voteCounts, totalVoters } = await getPollResults(viewPoll.poll.id);
        setViewPoll({ ...viewPoll, results: voteCounts, totalVoters });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao votar");
    } finally {
      setVoting(false);
    }
  }

  async function handleStatusChange(pollId: string, status: "draft" | "active" | "closed" | "archived") {
    const result = await updatePollStatus(pollId, status);
    if (result?.error) toast.error(result.error);
    else { toast.success("Status atualizado"); router.refresh(); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">Votações & Enquetes</h1>
          <p className="text-sm text-slate-500 mt-0.5">{polls.filter((p) => p.status === "active").length} ativas &middot; {polls.length} total</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gold text-navy rounded-lg hover:bg-light-gold transition-colors">
            <Plus size={16} /> Nova Enquete
          </button>
        )}
      </div>

      {/* Polls list */}
      <div className="space-y-3">
        {polls.map((poll) => {
          const config = statusConfig[poll.status] || statusConfig.draft;
          return (
            <button key={poll.id} onClick={() => openPoll(poll)}
              className="w-full bg-[#0D1B2A] border border-slate-700/50 rounded-xl p-5 text-left hover:border-slate-600 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant={config.variant}>{config.label}</Badge>
                  <Badge variant="default">{poll.type === "single" ? "Escolha única" : poll.type === "multiple" ? "Múltipla escolha" : "Ranking"}</Badge>
                </div>
                <span className="text-[11px] text-slate-500">{new Date(poll.created_at).toLocaleDateString("pt-BR")}</span>
              </div>
              <h3 className="text-sm font-medium text-white">{poll.title}</h3>
              {poll.description && <p className="text-xs text-slate-500 mt-1">{poll.description}</p>}
              {poll.ends_at && (
                <p className="text-[10px] text-slate-600 mt-2 flex items-center gap-1"><Clock size={10} /> Encerra: {new Date(poll.ends_at).toLocaleDateString("pt-BR")}</p>
              )}
            </button>
          );
        })}
        {polls.length === 0 && (
          <div className="bg-[#0D1B2A] border border-slate-700/50 rounded-xl p-12 text-center">
            <Vote size={32} className="text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400">Nenhuma enquete criada ainda</p>
          </div>
        )}
      </div>

      {/* View/Vote Modal */}
      <Modal open={!!viewPoll} onClose={() => setViewPoll(null)} title={viewPoll?.poll.title || ""} description={viewPoll?.poll.description || undefined} size="md">
        {viewPoll && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500">{viewPoll.totalVoters} voto{viewPoll.totalVoters !== 1 ? "s" : ""}</p>
            <div className="space-y-2">
              {viewPoll.options.map((opt) => {
                const votes = viewPoll.results[opt.id] || 0;
                const pct = viewPoll.totalVoters > 0 ? Math.round((votes / viewPoll.totalVoters) * 100) : 0;
                return (
                  <div key={opt.id} className="relative">
                    <button
                      onClick={() => viewPoll.poll.status === "active" ? handleVote(opt.id) : undefined}
                      disabled={voting || viewPoll.poll.status !== "active"}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-slate-800/40 border border-slate-700/30 hover:border-gold/30 transition-colors disabled:cursor-default relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gold/5 transition-all" style={{ width: `${pct}%` }} />
                      <span className="text-sm text-white relative z-10">{opt.label}</span>
                      <span className="text-xs text-slate-400 relative z-10">{votes} ({pct}%)</span>
                    </button>
                  </div>
                );
              })}
            </div>
            {isAdmin && (
              <div className="flex gap-2 pt-2 border-t border-slate-700/50">
                {viewPoll.poll.status === "draft" && <button onClick={() => { handleStatusChange(viewPoll.poll.id, "active"); setViewPoll(null); }} className="px-3 py-1.5 text-xs bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20">Ativar</button>}
                {viewPoll.poll.status === "active" && <button onClick={() => { handleStatusChange(viewPoll.poll.id, "closed"); setViewPoll(null); }} className="px-3 py-1.5 text-xs bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20">Encerrar</button>}
                {viewPoll.poll.status === "closed" && <button onClick={() => { handleStatusChange(viewPoll.poll.id, "archived"); setViewPoll(null); }} className="px-3 py-1.5 text-xs bg-slate-500/10 text-slate-400 rounded-lg hover:bg-slate-500/20">Arquivar</button>}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nova Enquete" size="md">
        <form onSubmit={handleCreate} className="space-y-4">
          <div><label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Título *</label>
            <input name="title" required className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:border-gold/40 focus:outline-none" /></div>
          <div><label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Descrição</label>
            <textarea name="description" rows={2} className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:border-gold/40 focus:outline-none resize-none" /></div>
          <div><label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Opções (uma por linha, mínimo 2) *</label>
            <textarea name="options" rows={4} required placeholder={"Opção 1\nOpção 2\nOpção 3"} className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:border-gold/40 focus:outline-none resize-none" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Tipo</label>
              <select name="type" defaultValue="single" className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:border-gold/40 focus:outline-none">
                <option value="single">Escolha única</option><option value="multiple">Múltipla escolha</option>
              </select></div>
            <div><label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Status</label>
              <select name="status" defaultValue="active" className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:border-gold/40 focus:outline-none">
                <option value="draft">Rascunho</option><option value="active">Ativa</option>
              </select></div>
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-700/50">
            <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white rounded-lg transition-colors">Cancelar</button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium bg-gold text-navy rounded-lg hover:bg-light-gold transition-colors disabled:opacity-50">
              {loading ? "Criando..." : "Criar Enquete"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
