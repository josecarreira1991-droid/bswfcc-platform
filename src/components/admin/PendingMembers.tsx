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
      <div className="text-center py-6 text-sm text-[#5A6577]">
        Nenhum membro pendente de aprovação
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {members.map((m) => (
        <div
          key={m.id}
          className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg bg-white border border-[#B8C4CE]"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0 border border-amber-300">
              <span className="text-amber-700 text-xs font-semibold">
                {m.full_name[0].toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-[#1A1A2E] truncate">{m.full_name}</p>
              {m.company && (
                <p className="text-[11px] text-[#5A6577] flex items-center gap-1 truncate">
                  <Building2 size={10} /> {m.company}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => handleApprove(m.id, m.full_name)}
              disabled={loadingId === m.id}
              className="p-1.5 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-300 border border-emerald-300 transition-colors disabled:opacity-50"
              title="Aprovar"
            >
              <Check size={14} />
            </button>
            <button
              onClick={() => handleReject(m.id, m.full_name)}
              disabled={loadingId === m.id}
              className="p-1.5 rounded-md bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors disabled:opacity-50"
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
