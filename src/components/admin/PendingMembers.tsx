"use client";

import { useState } from "react";
import { approveMember, rejectMember } from "@/lib/actions/members";
import { Check, X, Building2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { Member } from "@/types/database";

export default function PendingMembers({ members }: { members: Member[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleApprove(id: string, name: string) {
    setLoadingId(id);
    try {
      await approveMember(id);
      toast.success(`${name} aprovado com sucesso`);
      router.refresh();
    } catch {
      toast.error("Erro ao aprovar membro");
    }
    setLoadingId(null);
  }

  async function handleReject(id: string, name: string) {
    setLoadingId(id);
    try {
      await rejectMember(id);
      toast.success(`${name} rejeitado`);
      router.refresh();
    } catch {
      toast.error("Erro ao rejeitar membro");
    }
    setLoadingId(null);
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-corp-muted">
        Nenhum membro pendente de aprovação
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {members.map((m) => (
        <div
          key={m.id}
          className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg bg-white/[0.03] border border-corp-border"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0 border border-amber-500/15">
              <span className="text-amber-400 text-xs font-semibold">
                {m.full_name[0].toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-corp-text truncate">{m.full_name}</p>
              {m.company && (
                <p className="text-[11px] text-corp-muted flex items-center gap-1 truncate">
                  <Building2 size={10} /> {m.company}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => handleApprove(m.id, m.full_name)}
              disabled={loadingId === m.id}
              className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/15 border border-emerald-500/15 transition-colors disabled:opacity-50"
              title="Aprovar"
            >
              <Check size={14} />
            </button>
            <button
              onClick={() => handleReject(m.id, m.full_name)}
              disabled={loadingId === m.id}
              className="p-1.5 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/15 border border-red-500/15 transition-colors disabled:opacity-50"
              title="Rejeitar"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
