"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FileText, Download, Trash2, Pin, Plus, Search, Filter, FolderOpen } from "lucide-react";
import { createDocument, deleteDocument } from "@/lib/actions/documents";
import { cn, isAdmin as checkAdmin } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import type { Document, Member } from "@/types/database";

const CATEGORIES = [
  { value: "legal", label: "Legal" },
  { value: "financial", label: "Financeiro" },
  { value: "marketing", label: "Marketing" },
  { value: "operations", label: "Operações" },
  { value: "compliance", label: "Compliance" },
  { value: "templates", label: "Templates" },
  { value: "guides", label: "Guias" },
  { value: "reports", label: "Relatórios" },
  { value: "general", label: "Geral" },
];

const categoryVariant: Record<string, "gold" | "info" | "success" | "warning" | "danger" | "default"> = {
  legal: "danger", financial: "gold", marketing: "info", operations: "success",
  compliance: "warning", templates: "default", guides: "info", reports: "gold", general: "default",
};

interface DocumentCenterProps {
  documents: Document[];
  currentMember: Member;
}

export default function DocumentCenter({ documents, currentMember }: DocumentCenterProps) {
  const router = useRouter();
  const admin = checkAdmin(currentMember.role);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Document | null>(null);
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    let result = [...documents];
    if (filterCat !== "all") result = result.filter((d) => d.category === filterCat);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((d) => d.title.toLowerCase().includes(q) || d.tags.some((t) => t.toLowerCase().includes(q)));
    }
    return result;
  }, [documents, search, filterCat]);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      const result = await createDocument(form);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Documento adicionado");
        setShowForm(false);
        router.refresh();
      }
    } catch {
      toast.error("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setLoading(true);
    try {
      const result = await deleteDocument(deleteTarget.id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Documento removido");
        router.refresh();
      }
    } catch {
      toast.error("Erro de conexão. Tente novamente.");
    } finally {
      setDeleteTarget(null);
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">Central de Documentos</h1>
          <p className="text-sm text-slate-500 mt-0.5">{documents.length} {documents.length === 1 ? "documento disponível" : "documentos disponíveis"}</p>
        </div>
        {admin && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gold text-navy rounded-lg hover:bg-light-gold transition-colors">
            <Plus size={16} /> Adicionar
          </button>
        )}
      </div>

      {/* Category cards */}
      <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2 mb-4">
        {CATEGORIES.map((cat) => {
          const count = documents.filter((d) => d.category === cat.value).length;
          return (
            <button key={cat.value} onClick={() => setFilterCat(filterCat === cat.value ? "all" : cat.value)}
              className={cn("bg-[#0D1B2A] border rounded-lg p-2 text-center transition-colors", filterCat === cat.value ? "border-gold/40 bg-gold/5" : "border-slate-700/50 hover:border-slate-600")}>
              <p className="text-sm font-bold text-white">{count}</p>
              <p className="text-[9px] text-slate-500 truncate">{cat.label}</p>
            </button>
          );
        })}
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input type="text" placeholder="Buscar documento..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-8 pr-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:border-gold/40 focus:outline-none" />
      </div>

      {/* Documents list */}
      <div className="space-y-2">
        {filtered.map((doc) => (
          <div key={doc.id} className="bg-[#0D1B2A] border border-slate-700/50 rounded-xl p-4 flex items-center justify-between hover:border-slate-600 transition-colors">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                <FileText size={18} className="text-slate-500" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  {doc.is_pinned && <Pin size={10} className="text-gold" />}
                  <Badge variant={categoryVariant[doc.category] || "default"}>{CATEGORIES.find((c) => c.value === doc.category)?.label || doc.category}</Badge>
                  <Badge variant="default">{doc.access_level}</Badge>
                </div>
                <p className="text-sm font-medium text-white truncate">{doc.title}</p>
                {doc.description && <p className="text-[11px] text-slate-500 truncate">{doc.description}</p>}
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {doc.file_url && (
                <a href={doc.file_url!.startsWith("http") ? doc.file_url! : `https://${doc.file_url}`} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-500 hover:text-gold rounded-lg transition-colors">
                  <Download size={15} />
                </a>
              )}
              {admin && (
                <button onClick={() => setDeleteTarget(doc)} className="p-2 text-slate-500 hover:text-red-400 rounded-lg transition-colors">
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="bg-[#0D1B2A] border border-slate-700/50 rounded-xl p-12 text-center">
            <FolderOpen size={32} className="text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400">Nenhum documento encontrado</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title="Adicionar Documento" size="md">
        <form onSubmit={handleCreate} className="space-y-4">
          <div><label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Título *</label>
            <input name="title" required className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:border-gold/40 focus:outline-none" /></div>
          <div><label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Descrição</label>
            <textarea name="description" rows={2} className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:border-gold/40 focus:outline-none resize-none" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Categoria</label>
              <select name="category" defaultValue="general" className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:border-gold/40 focus:outline-none">
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select></div>
            <div><label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Acesso</label>
              <select name="access_level" defaultValue="member" className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:border-gold/40 focus:outline-none">
                <option value="public">Público</option><option value="member">Membros</option>
                <option value="business_partner">Business Partner</option><option value="executive">Executive</option>
                <option value="admin">Admin</option>
              </select></div>
          </div>
          <div><label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">URL do Arquivo</label>
            <input name="file_url" placeholder="https://..." className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:border-gold/40 focus:outline-none" /></div>
          <div><label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Tags (separar por vírgula)</label>
            <input name="tags" className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:border-gold/40 focus:outline-none" /></div>
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-700/50">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white rounded-lg transition-colors">Cancelar</button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium bg-gold text-navy rounded-lg hover:bg-light-gold transition-colors disabled:opacity-50">
              {loading ? "Salvando..." : "Adicionar"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Remover Documento" message={`Remover "${deleteTarget?.title}"?`} confirmLabel="Remover" variant="danger" loading={loading} />
    </div>
  );
}
