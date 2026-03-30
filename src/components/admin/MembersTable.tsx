"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Search, Filter, ChevronDown, ChevronUp, MoreHorizontal,
  Check, X, Eye, Edit2, UserMinus, Download, Users,
  Building2, Mail, Phone,
} from "lucide-react";
import { approveMember, rejectMember, updateMember } from "@/lib/actions/members";
import { cn, ROLE_LABELS, STATUS_STYLES, formatDate, isAdmin } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import type { Member, MemberRole, MemberStatus } from "@/types/database";

type SortKey = "full_name" | "company" | "role" | "status" | "created_at";
type SortDir = "asc" | "desc";

interface MembersTableProps {
  members: Member[];
  currentMember: Member;
}

const statusVariant = (s: string) =>
  s === "ativo" ? "success" : s === "pendente" ? "warning" : "danger";

export default function MembersTable({ members, currentMember }: MembersTableProps) {
  const router = useRouter();
  const admin = isAdmin(currentMember.role);

  // State
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(0);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ id: string; name: string; action: "approve" | "reject" } | null>(null);
  const [loading, setLoading] = useState(false);
  const perPage = 15;

  // Filter & Sort
  const filtered = useMemo(() => {
    let result = [...members];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.full_name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.company?.toLowerCase().includes(q) ||
          m.industry?.toLowerCase().includes(q)
      );
    }
    if (filterStatus !== "all") result = result.filter((m) => m.status === filterStatus);
    if (filterRole !== "all") result = result.filter((m) => m.role === filterRole);

    result.sort((a, b) => {
      const aVal = (a[sortKey] || "") as string;
      const bVal = (b[sortKey] || "") as string;
      const cmp = aVal.localeCompare(bVal);
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [members, search, filterStatus, filterRole, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice(page * perPage, (page + 1) * perPage);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(0);
  }

  async function handleConfirmAction() {
    if (!confirmAction) return;
    setLoading(true);
    try {
      if (confirmAction.action === "approve") {
        await approveMember(confirmAction.id);
        toast.success(`${confirmAction.name} aprovado`);
      } else {
        await rejectMember(confirmAction.id);
        toast.success(`${confirmAction.name} inativado`);
      }
      router.refresh();
    } catch {
      toast.error("Erro ao processar ação");
    }
    setLoading(false);
    setConfirmAction(null);
  }

  async function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editMember) return;
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      await updateMember(editMember.id, {
        full_name: form.get("full_name") as string,
        company: (form.get("company") as string) || null,
        industry: (form.get("industry") as string) || null,
        city: (form.get("city") as string) || null,
        phone: (form.get("phone") as string) || null,
        linkedin: (form.get("linkedin") as string) || null,
        role: form.get("role") as MemberRole,
      } as Partial<Member>);
      toast.success("Membro atualizado");
      router.refresh();
      setEditMember(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao atualizar");
    }
    setLoading(false);
  }

  function exportCSV() {
    const headers = ["Nome", "Email", "Empresa", "Cargo", "Indústria", "Status", "Cidade"];
    const rows = filtered.map((m) => [
      m.full_name, m.email, m.company || "", ROLE_LABELS[m.role] || m.role,
      m.industry || "", m.status, m.city || "",
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `membros-bswfcc-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 100);
    toast.success("CSV exportado");
  }

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return null;
    return sortDir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
  };

  const uniqueRoles = Array.from(new Set(members.map((m) => m.role))).sort();

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
        {/* Search */}
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar nome, email, empresa..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="w-full pl-8 pr-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:border-gold/40 focus:outline-none transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }}
            className="px-3 py-2 text-xs bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-300 focus:border-gold/40 focus:outline-none"
          >
            <option value="all">Todos os status</option>
            <option value="ativo">Ativos</option>
            <option value="pendente">Pendentes</option>
            <option value="inativo">Inativos</option>
          </select>

          <select
            value={filterRole}
            onChange={(e) => { setFilterRole(e.target.value); setPage(0); }}
            className="px-3 py-2 text-xs bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-300 focus:border-gold/40 focus:outline-none"
          >
            <option value="all">Todos os cargos</option>
            {uniqueRoles.map((r) => (
              <option key={r} value={r}>{ROLE_LABELS[r] || r}</option>
            ))}
          </select>

          {admin && (
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-2 text-xs text-slate-400 hover:text-white border border-slate-700/50 rounded-lg hover:bg-white/5 transition-colors"
            >
              <Download size={12} /> CSV
            </button>
          )}
        </div>
      </div>

      {/* Results count */}
      <p className="text-[11px] text-slate-500 mb-2">
        {filtered.length} membro{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* Table */}
      <div className="bg-[#0D1B2A] border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50">
                {[
                  { key: "full_name" as SortKey, label: "Nome" },
                  { key: "company" as SortKey, label: "Empresa" },
                  { key: "role" as SortKey, label: "Cargo" },
                  { key: "status" as SortKey, label: "Status" },
                  { key: "created_at" as SortKey, label: "Data" },
                ].map((col) => (
                  <th
                    key={col.key}
                    onClick={() => toggleSort(col.key)}
                    className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-300 select-none"
                  >
                    <span className="flex items-center gap-1">
                      {col.label} <SortIcon col={col.key} />
                    </span>
                  </th>
                ))}
                {admin && (
                  <th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Ações
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {paged.map((m, i) => (
                <tr
                  key={m.id}
                  className={cn(
                    "border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors",
                    i % 2 === 0 ? "bg-transparent" : "bg-slate-900/20"
                  )}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gold/15 flex items-center justify-center flex-shrink-0">
                        <span className="text-gold text-xs font-semibold">
                          {m.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-white truncate">{m.full_name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{m.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-400 truncate max-w-[160px]">
                    {m.company || <span className="text-slate-600">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="gold">{ROLE_LABELS[m.role] || m.role}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(m.status)}>
                      {m.status.charAt(0).toUpperCase() + m.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {formatDate(m.created_at)}
                  </td>
                  {admin && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedMember(m)}
                          className="p-1.5 rounded-md text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
                          title="Detalhes"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => setEditMember(m)}
                          className="p-1.5 rounded-md text-slate-500 hover:text-gold hover:bg-gold/5 transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={14} />
                        </button>
                        {m.status === "pendente" && (
                          <>
                            <button
                              onClick={() => setConfirmAction({ id: m.id, name: m.full_name, action: "approve" })}
                              className="p-1.5 rounded-md text-emerald-500/70 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                              title="Aprovar"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={() => setConfirmAction({ id: m.id, name: m.full_name, action: "reject" })}
                              className="p-1.5 rounded-md text-red-500/70 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                              title="Rejeitar"
                            >
                              <X size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {paged.length === 0 && (
                <tr>
                  <td colSpan={admin ? 6 : 5} className="px-4 py-12 text-center text-slate-500 text-sm">
                    Nenhum membro encontrado com os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700/50">
            <p className="text-[11px] text-slate-500">
              Página {page + 1} de {totalPages}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-3 py-1 text-xs text-slate-400 hover:text-white border border-slate-700/50 rounded-md disabled:opacity-30 transition-colors"
              >
                Anterior
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="px-3 py-1 text-xs text-slate-400 hover:text-white border border-slate-700/50 rounded-md disabled:opacity-30 transition-colors"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        open={!!selectedMember}
        onClose={() => setSelectedMember(null)}
        title={selectedMember?.full_name || ""}
        description="Detalhes do membro"
        size="md"
      >
        {selectedMember && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Email", value: selectedMember.email, icon: Mail },
                { label: "Telefone", value: selectedMember.phone, icon: Phone },
                { label: "Empresa", value: selectedMember.company, icon: Building2 },
                { label: "Indústria", value: selectedMember.industry },
                { label: "Cidade", value: selectedMember.city },
                { label: "LinkedIn", value: selectedMember.linkedin },
                { label: "Cargo", value: ROLE_LABELS[selectedMember.role] },
                { label: "Status", value: selectedMember.status },
                { label: "Membro desde", value: formatDate(selectedMember.created_at) },
              ].map((field) => (
                <div key={field.label}>
                  <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">{field.label}</p>
                  <p className="text-sm text-white">{field.value || "—"}</p>
                </div>
              ))}
            </div>
            {selectedMember.bio && (
              <div>
                <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">Bio</p>
                <p className="text-sm text-slate-300">{selectedMember.bio}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={!!editMember}
        onClose={() => setEditMember(null)}
        title="Editar Membro"
        size="lg"
      >
        {editMember && (
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Nome</label>
                <input name="full_name" defaultValue={editMember.full_name} required className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:border-gold/40 focus:outline-none" />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Empresa</label>
                <input name="company" defaultValue={editMember.company || ""} className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:border-gold/40 focus:outline-none" />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Indústria</label>
                <input name="industry" defaultValue={editMember.industry || ""} className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:border-gold/40 focus:outline-none" />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Cidade</label>
                <input name="city" defaultValue={editMember.city || ""} className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:border-gold/40 focus:outline-none" />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Telefone</label>
                <input name="phone" defaultValue={editMember.phone || ""} className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:border-gold/40 focus:outline-none" />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">LinkedIn</label>
                <input name="linkedin" defaultValue={editMember.linkedin || ""} className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:border-gold/40 focus:outline-none" />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Cargo</label>
                <select name="role" defaultValue={editMember.role} className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:border-gold/40 focus:outline-none">
                  {Object.entries(ROLE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-700/50">
              <button type="button" onClick={() => setEditMember(null)} className="px-4 py-2 text-sm text-slate-400 hover:text-white rounded-lg transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium bg-gold text-navy rounded-lg hover:bg-light-gold transition-colors disabled:opacity-50">
                {loading ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleConfirmAction}
        title={confirmAction?.action === "approve" ? "Aprovar Membro" : "Rejeitar Membro"}
        message={
          confirmAction?.action === "approve"
            ? `Confirma a aprovação de ${confirmAction?.name}? O membro terá acesso completo à plataforma.`
            : `Confirma a rejeição de ${confirmAction?.name}? O membro será inativado.`
        }
        confirmLabel={confirmAction?.action === "approve" ? "Aprovar" : "Rejeitar"}
        variant={confirmAction?.action === "approve" ? "default" : "danger"}
        loading={loading}
      />
    </>
  );
}
