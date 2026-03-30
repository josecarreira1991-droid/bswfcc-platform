"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Plus, Search, Edit2, Trash2, ExternalLink,
} from "lucide-react";
import { createMarketData, updateMarketData, deleteMarketData } from "@/lib/actions/market";
import { cn, isAdmin } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import type { MarketData } from "@/types/database";
import type { Member } from "@/types/database";

const CATEGORIES = [
  { value: "comercio", label: "Comércio Bilateral" },
  { value: "demografico", label: "Demográfico" },
  { value: "infraestrutura", label: "Infraestrutura" },
  { value: "desenvolvimento", label: "Desenvolvimento" },
  { value: "bswfcc", label: "BSWFCC" },
];

const categoryLabel = (cat: string) => CATEGORIES.find((c) => c.value === cat)?.label || cat;

const categoryVariant = (cat: string) => {
  const map: Record<string, "gold" | "info" | "success" | "warning" | "default"> = {
    comercio: "gold",
    demografico: "info",
    infraestrutura: "success",
    desenvolvimento: "warning",
    bswfcc: "default",
  };
  return map[cat] || "default";
};

interface MarketDataManagerProps {
  data: MarketData[];
  currentMember: Member;
}

export default function MarketDataManager({ data, currentMember }: MarketDataManagerProps) {
  const router = useRouter();
  const admin = isAdmin(currentMember.role);

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<MarketData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    let result = [...data];
    if (filterCategory !== "all") result = result.filter((d) => d.category === filterCategory);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (d) =>
          d.indicator.toLowerCase().includes(q) ||
          d.value.toLowerCase().includes(q) ||
          d.source?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [data, search, filterCategory]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      let result;
      if (editItem) {
        result = await updateMarketData(editItem.id, form);
      } else {
        result = await createMarketData(form);
      }
      if (result?.error) {
        toast.error(result.error);
      } else if (result?.success) {
        toast.success(editItem ? "Indicador atualizado" : "Indicador criado");
        setShowForm(false);
        setEditItem(null);
        router.refresh();
      } else {
        toast.error("Erro inesperado ao salvar indicador");
      }
    } catch {
      toast.error("Erro de conexão com o servidor. Tente novamente.");
    }
    setLoading(false);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setLoading(true);
    const result = await deleteMarketData(deleteTarget.id);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Indicador removido");
      router.refresh();
    }
    setDeleteTarget(null);
    setLoading(false);
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">Dados de Mercado</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {data.length} indicadores &middot; Corredor FL-Brasil e SWFL
          </p>
        </div>
        {admin && (
          <button
            onClick={() => { setEditItem(null); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gold text-navy rounded-lg hover:bg-light-gold transition-colors"
          >
            <Plus size={16} /> Novo Indicador
          </button>
        )}
      </div>

      {/* Category Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {CATEGORIES.map((cat) => {
          const count = data.filter((d) => d.category === cat.value).length;
          return (
            <button
              key={cat.value}
              onClick={() => setFilterCategory(filterCategory === cat.value ? "all" : cat.value)}
              className={cn(
                "bg-[#0D1B2A] border rounded-xl p-3 text-left transition-colors",
                filterCategory === cat.value
                  ? "border-gold/40 bg-gold/5"
                  : "border-slate-700/50 hover:border-slate-600"
              )}
            >
              <p className="text-lg font-bold text-white">{count}</p>
              <p className="text-[11px] text-slate-500">{cat.label}</p>
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar indicador..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:border-gold/40 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0D1B2A] border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Indicador</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Valor</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Categoria</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Fonte</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Atualizado</th>
                {admin && (
                  <th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Ações</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, i) => (
                <tr
                  key={item.id}
                  className={cn(
                    "border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors",
                    i % 2 === 0 ? "bg-transparent" : "bg-slate-900/20"
                  )}
                >
                  <td className="px-4 py-3 font-medium text-white">
                    {item.indicator.replace(/_/g, " ")}
                  </td>
                  <td className="px-4 py-3 text-gold font-semibold">{item.value}</td>
                  <td className="px-4 py-3">
                    <Badge variant={categoryVariant(item.category)}>
                      {categoryLabel(item.category)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs truncate max-w-[160px]">
                    {item.source || "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                    {item.updated_at ? new Date(item.updated_at).toLocaleDateString("pt-BR") : "—"}
                  </td>
                  {admin && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setEditItem(item); setShowForm(true); }}
                          className="p-1.5 rounded-md text-slate-500 hover:text-gold hover:bg-gold/5 transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(item)}
                          className="p-1.5 rounded-md text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-colors"
                          title="Remover"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={admin ? 6 : 5} className="px-4 py-12 text-center text-slate-500 text-sm">
                    Nenhum indicador encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sources footer */}
      <div className="mt-6 bg-[#0D1B2A] border border-slate-700/50 rounded-xl p-5">
        <h3 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Fontes</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-1.5 text-[11px] text-slate-500">
          <p>U.S. Census Bureau — ACS 2024</p>
          <p>Enterprise Florida — Trade Data 2024</p>
          <p>Bureau of Economic Analysis</p>
          <p>Port Manatee — Annual Report FY2025</p>
          <p>Florida Department of Revenue</p>
          <p>BSWFCC — Registros internos</p>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        open={showForm}
        onClose={() => { setShowForm(false); setEditItem(null); }}
        title={editItem ? "Editar Indicador" : "Novo Indicador"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Indicador *</label>
            <input name="indicator" defaultValue={editItem?.indicator || ""} required className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:border-gold/40 focus:outline-none" />
          </div>
          <div>
            <label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Valor *</label>
            <input name="value" defaultValue={editItem?.value || ""} required className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:border-gold/40 focus:outline-none" />
          </div>
          <div>
            <label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Categoria *</label>
            <select name="category" defaultValue={editItem?.category || "comercio"} className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:border-gold/40 focus:outline-none">
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] text-slate-500 uppercase tracking-wider mb-1">Fonte</label>
            <input name="source" defaultValue={editItem?.source || ""} className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:border-gold/40 focus:outline-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-700/50">
            <button type="button" onClick={() => { setShowForm(false); setEditItem(null); }} className="px-4 py-2 text-sm text-slate-400 hover:text-white rounded-lg transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium bg-gold text-navy rounded-lg hover:bg-light-gold transition-colors disabled:opacity-50">
              {loading ? "Salvando..." : editItem ? "Salvar" : "Criar"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Remover Indicador"
        message={`Remover o indicador "${deleteTarget?.indicator.replace(/_/g, " ")}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Remover"
        variant="danger"
        loading={loading}
      />
    </>
  );
}
