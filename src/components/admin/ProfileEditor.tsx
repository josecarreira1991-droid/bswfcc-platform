"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Edit2 } from "lucide-react";
import { updateMyProfile } from "@/lib/actions/members";
import Modal from "@/components/ui/Modal";
import type { Member } from "@/types/database";

export default function ProfileEditor({ member }: { member: Member }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      await updateMyProfile({
        full_name: form.get("full_name") as string,
        phone: (form.get("phone") as string) || null,
        company: (form.get("company") as string) || null,
        industry: (form.get("industry") as string) || null,
        city: (form.get("city") as string) || null,
        linkedin: (form.get("linkedin") as string) || null,
        bio: (form.get("bio") as string) || null,
      });
      toast.success("Perfil atualizado");
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao atualizar perfil");
    }
    setLoading(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-accent text-white rounded-lg hover:bg-accent-dim transition-colors"
      >
        <Edit2 size={16} /> Editar Perfil
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Editar Perfil" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] text-corp-muted uppercase tracking-wider mb-1">Nome Completo</label>
              <input name="full_name" defaultValue={member.full_name} required className="w-full px-3 py-2 text-sm bg-white/[0.03] border border-corp-border rounded-lg text-corp-text focus:border-accent/30 focus:outline-none" />
            </div>
            <div>
              <label className="block text-[11px] text-corp-muted uppercase tracking-wider mb-1">Telefone</label>
              <input name="phone" defaultValue={member.phone || ""} className="w-full px-3 py-2 text-sm bg-white/[0.03] border border-corp-border rounded-lg text-corp-text focus:border-accent/30 focus:outline-none" />
            </div>
            <div>
              <label className="block text-[11px] text-corp-muted uppercase tracking-wider mb-1">Empresa</label>
              <input name="company" defaultValue={member.company || ""} className="w-full px-3 py-2 text-sm bg-white/[0.03] border border-corp-border rounded-lg text-corp-text focus:border-accent/30 focus:outline-none" />
            </div>
            <div>
              <label className="block text-[11px] text-corp-muted uppercase tracking-wider mb-1">Indústria</label>
              <input name="industry" defaultValue={member.industry || ""} className="w-full px-3 py-2 text-sm bg-white/[0.03] border border-corp-border rounded-lg text-corp-text focus:border-accent/30 focus:outline-none" />
            </div>
            <div>
              <label className="block text-[11px] text-corp-muted uppercase tracking-wider mb-1">Cidade</label>
              <input name="city" defaultValue={member.city || ""} className="w-full px-3 py-2 text-sm bg-white/[0.03] border border-corp-border rounded-lg text-corp-text focus:border-accent/30 focus:outline-none" />
            </div>
            <div>
              <label className="block text-[11px] text-corp-muted uppercase tracking-wider mb-1">LinkedIn</label>
              <input name="linkedin" defaultValue={member.linkedin || ""} className="w-full px-3 py-2 text-sm bg-white/[0.03] border border-corp-border rounded-lg text-corp-text focus:border-accent/30 focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-[11px] text-corp-muted uppercase tracking-wider mb-1">Bio</label>
            <textarea name="bio" rows={3} defaultValue={member.bio || ""} className="w-full px-3 py-2 text-sm bg-white/[0.03] border border-corp-border rounded-lg text-corp-text focus:border-accent/30 focus:outline-none resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-corp-border">
            <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-corp-muted hover:text-corp-text hover:bg-white/[0.05] rounded-lg transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium bg-accent text-white rounded-lg hover:bg-accent-dim transition-colors disabled:opacity-50">
              {loading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
