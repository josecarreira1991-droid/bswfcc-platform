"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Plus, Search, Edit2, Trash2, Eye,
  Calendar, MapPin, Clock,
} from "lucide-react";
import { createEvent, updateEvent, deleteEvent } from "@/lib/actions/events";
import { cn, EVENT_TYPE_LABELS, formatDate, isAdmin } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import type { Event, Member } from "@/types/database";

interface EventsManagerProps {
  events: Event[];
  currentMember: Member;
}

type BadgeVariant = "info" | "gold" | "success" | "warning" | "default";

const TYPE_VARIANTS: Record<string, BadgeVariant> = {
  networking: "info",
  palestra: "default",
  workshop: "success",
  gala: "gold",
  almoco: "warning",
  outro: "default",
};

function typeVariant(t: string): BadgeVariant {
  return TYPE_VARIANTS[t] || "default";
}

const INPUT_CLASS =
  "w-full px-3 py-2 text-sm bg-white/[0.03] border border-corp-border rounded-lg text-corp-text focus:border-accent/30 focus:outline-none";
const LABEL_CLASS = "block text-[11px] text-corp-muted uppercase tracking-wider mb-1";
const TH_CLASS = "px-4 py-3 text-left text-[11px] font-semibold text-corp-muted uppercase tracking-wider";
const SELECT_CLASS =
  "px-3 py-2 text-xs bg-white/[0.03] border border-corp-border rounded-lg text-corp-muted focus:border-accent/30 focus:outline-none";

interface FormFieldProps {
  label: string;
  required?: boolean;
  span?: boolean;
  children: React.ReactNode;
}

function FormField({ label, required, span, children }: FormFieldProps): React.ReactElement {
  return (
    <div className={span ? "sm:col-span-2" : undefined}>
      <label className={LABEL_CLASS}>
        {label}{required && " *"}
      </label>
      {children}
    </div>
  );
}

export default function EventsManager({ events, currentMember }: EventsManagerProps) {
  const router = useRouter();
  const admin = isAdmin(currentMember.role);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterTime, setFilterTime] = useState<string>("upcoming");
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [viewEvent, setViewEvent] = useState<Event | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Event | null>(null);
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const filtered = useMemo(() => {
    let result = [...events];

    if (filterTime === "upcoming") {
      result = result.filter((e) => e.date >= today);
    } else if (filterTime === "past") {
      result = result.filter((e) => e.date < today);
    }
    // "all" — no date filter applied

    if (filterType !== "all") result = result.filter((e) => e.type === filterType);

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.location?.toLowerCase().includes(q) ||
          e.description?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [events, search, filterType, filterTime, today]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    try {
      const result = editingEvent
        ? await updateEvent(editingEvent.id, form)
        : await createEvent(form);

      if (result?.error) {
        toast.error(result.error);
      } else if (result?.success) {
        toast.success(editingEvent ? "Evento atualizado" : "Evento criado");
        setShowForm(false);
        setEditingEvent(null);
        router.refresh();
      } else {
        toast.error("Erro inesperado ao salvar evento");
      }
    } catch {
      toast.error("Erro de conexão com o servidor. Tente novamente.");
    }
    setLoading(false);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setLoading(true);
    try {
      const result = await deleteEvent(deleteTarget.id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Evento removido");
        router.refresh();
      }
    } catch {
      toast.error("Erro de conexão. Tente novamente.");
    }
    setDeleteTarget(null);
    setLoading(false);
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-corp-text">Gestão de Eventos</h1>
          <p className="text-sm text-corp-muted mt-0.5">
            {events.filter((e) => e.date >= today).length} próximos &middot; {events.filter((e) => e.date < today).length} passados
          </p>
        </div>
        {admin && (
          <button
            onClick={() => { setEditingEvent(null); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-accent text-white rounded-lg hover:bg-accent-dim transition-colors"
          >
            <Plus size={16} /> Novo Evento
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-corp-muted" />
          <input
            type="text"
            placeholder="Buscar evento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm bg-white/[0.03] border border-corp-border rounded-lg text-corp-text placeholder-corp-muted focus:border-accent/30 focus:outline-none transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filterTime}
            onChange={(e) => setFilterTime(e.target.value)}
            className={SELECT_CLASS}
          >
            <option value="upcoming">Próximos</option>
            <option value="past">Passados</option>
            <option value="all">Todos</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className={SELECT_CLASS}
          >
            <option value="all">Todos os tipos</option>
            {Object.entries(EVENT_TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-corp-card border border-corp-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-corp-border">
                <th className={TH_CLASS}>Evento</th>
                <th className={TH_CLASS}>Data</th>
                <th className={TH_CLASS}>Tipo</th>
                <th className={TH_CLASS}>Local</th>
                <th className={TH_CLASS}>Capacidade</th>
                {admin && (
                  <th className={cn(TH_CLASS, "text-right")}>Ações</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((event, i) => {
                const isPast = event.date < today;
                return (
                  <tr
                    key={event.id}
                    className={cn(
                      "border-b border-corp-border hover:bg-white/[0.03] transition-colors",
                      isPast && "opacity-50",
                      i % 2 === 0 ? "bg-transparent" : "bg-white/[0.02]"
                    )}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-corp-text">{event.title}</p>
                      {event.is_public && (
                        <Badge variant="info" className="mt-0.5">Público</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-corp-muted text-xs whitespace-nowrap">
                      {formatDate(event.date)}
                      {event.time && <span className="ml-1 text-corp-muted">{event.time}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={typeVariant(event.type)}>
                        {EVENT_TYPE_LABELS[event.type] || event.type}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-corp-muted truncate max-w-[160px]">
                      {event.location || "—"}
                    </td>
                    <td className="px-4 py-3 text-corp-muted text-xs">
                      {event.max_attendees ? `${event.max_attendees} vagas` : "Ilimitado"}
                    </td>
                    {admin && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewEvent(event)}
                            className="p-1.5 rounded-md text-corp-muted hover:text-corp-text hover:bg-white/[0.03] transition-colors"
                            title="Detalhes"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => { setEditingEvent(event); setShowForm(true); }}
                            className="p-1.5 rounded-md text-corp-muted hover:text-accent hover:bg-accent/10 transition-colors"
                            title="Editar"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(event)}
                            className="p-1.5 rounded-md text-corp-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Remover"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={admin ? 6 : 5} className="px-4 py-12 text-center text-corp-muted text-sm">
                    Nenhum evento encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        open={showForm}
        onClose={() => { setShowForm(false); setEditingEvent(null); }}
        title={editingEvent ? "Editar Evento" : "Novo Evento"}
        size="lg"
      >
        <form key={editingEvent?.id || "new"} onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Título" required span>
              <input name="title" defaultValue={editingEvent?.title || ""} required className={INPUT_CLASS} />
            </FormField>
            <FormField label="Data" required>
              <input name="date" type="date" defaultValue={editingEvent?.date || ""} required className={INPUT_CLASS} />
            </FormField>
            <FormField label="Horário">
              <input name="time" type="time" defaultValue={editingEvent?.time || ""} className={INPUT_CLASS} />
            </FormField>
            <FormField label="Tipo" required>
              <select name="type" defaultValue={editingEvent?.type || "networking"} className={INPUT_CLASS}>
                {Object.entries(EVENT_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Capacidade">
              <input name="max_attendees" type="number" min="1" defaultValue={editingEvent?.max_attendees ?? ""} placeholder="Ilimitado" className={INPUT_CLASS} />
            </FormField>
            <FormField label="Local" span>
              <input name="location" defaultValue={editingEvent?.location || ""} className={INPUT_CLASS} />
            </FormField>
            <FormField label="Descrição" span>
              <textarea name="description" rows={3} defaultValue={editingEvent?.description || ""} className={cn(INPUT_CLASS, "resize-none")} />
            </FormField>
            <div className="flex items-center gap-2">
              <input type="hidden" name="is_public" defaultValue={editingEvent ? String(editingEvent.is_public) : "true"} />
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_public_check"
                  defaultChecked={editingEvent?.is_public ?? true}
                  onChange={(e) => {
                    const hidden = e.target.form?.querySelector('input[name="is_public"]') as HTMLInputElement;
                    if (hidden) hidden.value = e.target.checked ? "true" : "false";
                  }}
                  className="w-4 h-4 rounded border-corp-border bg-white/[0.03] text-accent focus:ring-accent/30"
                />
                <span className="text-sm text-corp-muted">Evento público</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-corp-border">
            <button type="button" onClick={() => { setShowForm(false); setEditingEvent(null); }} className="px-4 py-2 text-sm text-corp-muted hover:text-corp-text hover:bg-white/[0.05] rounded-lg transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium bg-accent text-white rounded-lg hover:bg-accent-dim transition-colors disabled:opacity-50">
              {loading ? "Salvando..." : editingEvent ? "Salvar" : "Criar Evento"}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Detail Modal */}
      <Modal
        open={!!viewEvent}
        onClose={() => setViewEvent(null)}
        title={viewEvent?.title || ""}
        description="Detalhes do evento"
      >
        {viewEvent && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className={LABEL_CLASS}>Data</p>
                <p className="text-sm text-corp-text flex items-center gap-1.5"><Calendar size={13} className="text-corp-muted" />{formatDate(viewEvent.date)}</p>
              </div>
              <div>
                <p className={LABEL_CLASS}>Horário</p>
                <p className="text-sm text-corp-text flex items-center gap-1.5"><Clock size={13} className="text-corp-muted" />{viewEvent.time || "—"}</p>
              </div>
              <div>
                <p className={LABEL_CLASS}>Tipo</p>
                <Badge variant={typeVariant(viewEvent.type)}>{EVENT_TYPE_LABELS[viewEvent.type]}</Badge>
              </div>
              <div>
                <p className={LABEL_CLASS}>Capacidade</p>
                <p className="text-sm text-corp-text">{viewEvent.max_attendees || "Ilimitado"}</p>
              </div>
              <div className="col-span-2">
                <p className={LABEL_CLASS}>Local</p>
                <p className="text-sm text-corp-text flex items-center gap-1.5"><MapPin size={13} className="text-corp-muted" />{viewEvent.location || "—"}</p>
              </div>
            </div>
            {viewEvent.description && (
              <div>
                <p className={LABEL_CLASS}>Descrição</p>
                <p className="text-sm text-corp-muted whitespace-pre-wrap">{viewEvent.description}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Remover Evento"
        message={`Tem certeza que deseja remover "${deleteTarget?.title}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Remover"
        variant="danger"
        loading={loading}
      />
    </>
  );
}
