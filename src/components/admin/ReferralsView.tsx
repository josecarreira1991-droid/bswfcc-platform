"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserPlus, Gift, Check, X, Mail, Phone, Building2 } from "lucide-react";
import { createReferral, updateReferralStatus } from "@/lib/actions/referrals";
import { cn } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import type { Member } from "@/types/database";

const statusVariant: Record<string, "warning" | "info" | "success" | "gold" | "danger"> = {
  pending: "warning", contacted: "info", registered: "gold", active: "success", declined: "danger",
};
const statusLabel: Record<string, string> = {
  pending: "Pendente", contacted: "Contactado", registered: "Registrado", active: "Ativo", declined: "Recusado",
};

interface ReferralsViewProps {
  referrals: Array<{
    id: string; referred_name: string; referred_email: string | null; referred_phone: string | null;
    referred_company: string | null; status: string; notes: string | null; created_at: string;
    members: { full_name: string; company: string | null } | null;
  }>;
  currentMember: Member;
  isAdmin: boolean;
}

export default function ReferralsView({ referrals, currentMember, isAdmin }: ReferralsViewProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const result = await createReferral(currentMember.id, form);
    if (result?.error) toast.error(result.error);
    else { toast.success("Indicação registrada"); setShowForm(false); router.refresh(); }
    setLoading(false);
  }

  async function handleStatus(id: string, status: "pending" | "contacted" | "registered" | "active" | "declined") {
    const result = await updateReferralStatus(id, status);
    if (result?.error) toast.error(result.error);
    else { toast.success("Status atualizado"); router.refresh(); }
  }

  const activeCount = referrals.filter((r) => r.status === "active").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">Indicações</h1>
          <p className="text-sm text-slate-500 mt-0.5">{referrals.length} indicações &middot; {activeCount} convertidas</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gold text-navy rounded-lg hover:bg-light-gold transition-colors">
          <UserPlus size={16} /> Indicar Membro
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {Object.entries(statusLabel).map(([key, label]) => (
          <div key={key} className="bg-[#0D1B2A] border border-slate-700/50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-white">{referrals.filter((r) => r.status === key).length}</p>
            <p className="text-[10px] text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      {/* List */}
      <div className="bg-[#0D1B2A] border border-slate-700/50 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Indicado</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Indicado Por</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Data</th>
              {isAdmin && <th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Ações</th>}
            </tr>
          </thead>
          <tbody>
            {referrals.map((r, i) => (
              <tr key={r.id} className={cn("border-b border-slate-800/50 hover:bg-slate-800/30", i % 2 !== 0 && "bg-slate-900/20")}>
                <td className="px-4 py-3">
                  <p className="font-medium text-white">{r.referred_name}</p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    {r.referred_company && <span className="flex items-center gap-1"><Building2 size={10} />{r.referred_company}</span>}
                    {r.referred_email && <span className="flex items-center gap-1"><Mail size={10} />{r.referred_email}</span>}
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-400">{r.members?.full_name || "—"}</td>
                <td className="px-4 py-3"><Badge variant={statusVariant[r.status] || "default"}>{statusLabel[r.status] || r.status}</Badge></td>
                <td className="px-4 py-3 text-slate-500 text-xs">{new Date(r.created_at).toLocaleDateString("pt-BR")}</td>
                {isAdmin && (
                  <td className="px-4 py-3 text-right">
                    {r.status === "pending" && (
                      <div className="flex justify-end gap-1">
                        <button onClick={() => handleStatus(r.id, "contacted")} className="px-2 py-1 text-[11px] bg-blue-500/10 text-blue-400 rounded hover:bg-blue-500/20">Contactar</button>
                        <button onClick={() => handleStatus(r.id, "declined")} className="px-2 py-1 text-[11px] bg-red-500/10 text-red-400 rounded hover:bg-red-500/20">Recusar</button>
                      </div>
                    )}
                    {r.status === "contacted" && (
                      <button onClick={() => handleStatus(r.id, "registered")} className="px-2 py-1 text-[11px] bg-gold/10 text-gold rounded hover:bg-gold/20">Registrado</button>
                    )}
                    {r.status === "registered" && (
                      <button onClick={() => handleStatus(r.id, "active")} className="px-2 py-1 text-[11px] bg-emerald-500/10 text-emerald-400 rounded hover:bg-emerald-500/20">Ativar</button>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {referrals.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-slate-500">Nenhuma indicação ainda. Convide novos membros!</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Indicar Novo Membro">
        <form onSubmit={handleCreate} className="space-y-4">
          <div><label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Nome *</label>
            <input name="referred_name" required className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:border-gold/40 focus:outline-none" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Email</label>
              <input name="referred_email" type="email" className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:border-gold/40 focus:outline-none" /></div>
            <div><label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Telefone</label>
              <input name="referred_phone" className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:border-gold/40 focus:outline-none" /></div>
          </div>
          <div><label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Empresa</label>
            <input name="referred_company" className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:border-gold/40 focus:outline-none" /></div>
          <div><label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Notas</label>
            <textarea name="notes" rows={2} className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:border-gold/40 focus:outline-none resize-none" /></div>
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-700/50">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white rounded-lg transition-colors">Cancelar</button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium bg-gold text-navy rounded-lg hover:bg-light-gold transition-colors disabled:opacity-50">
              {loading ? "Enviando..." : "Indicar"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
