"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { addMember } from "@/lib/actions/members";
import Modal from "@/components/ui/Modal";
import { ROLE_LABELS } from "@/lib/utils";
import { Plus } from "lucide-react";

export default function AddMemberForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      const result = await addMember(form);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Membro adicionado com sucesso");
        setOpen(false);
        router.refresh();
      }
    } catch {
      toast.error("Erro de conexão. Tente novamente.");
    }
    setLoading(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gold text-navy rounded-lg hover:bg-light-gold transition-colors"
      >
        <Plus size={16} /> Adicionar
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Adicionar Membro" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Nome completo *</label>
              <input name="full_name" required className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:border-gold/40 focus:outline-none" />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Email *</label>
              <input name="email" type="email" required className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:border-gold/40 focus:outline-none" />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Telefone</label>
              <input name="phone" className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:border-gold/40 focus:outline-none" />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Cargo</label>
              <select name="role" defaultValue="membro" className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:border-gold/40 focus:outline-none">
                {Object.entries(ROLE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Empresa</label>
              <input name="company" className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:border-gold/40 focus:outline-none" />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Indústria</label>
              <input name="industry" className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:border-gold/40 focus:outline-none" />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Cidade</label>
              <input name="city" className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:border-gold/40 focus:outline-none" />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">LinkedIn</label>
              <input name="linkedin" className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:border-gold/40 focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Bio</label>
            <textarea name="bio" rows={3} className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:border-gold/40 focus:outline-none resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-700/50">
            <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white rounded-lg transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium bg-gold text-navy rounded-lg hover:bg-light-gold transition-colors disabled:opacity-50">
              {loading ? "Salvando..." : "Adicionar Membro"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
