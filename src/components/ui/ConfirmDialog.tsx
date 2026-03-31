"use client";

import Modal from "./Modal";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: "danger" | "warning" | "default";
  loading?: boolean;
}

export default function ConfirmDialog({
  open, onClose, onConfirm, title, message,
  confirmLabel = "Confirmar", variant = "default", loading = false,
}: ConfirmDialogProps) {
  const btnClass =
    variant === "danger"
      ? "bg-red-600 hover:bg-red-700 text-white"
      : variant === "warning"
        ? "bg-amber-600 hover:bg-amber-700 text-white"
        : "bg-accent hover:bg-accent-dim text-white";

  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="flex items-start gap-3 mb-6">
        {variant !== "default" && (
          <div className={`mt-0.5 ${variant === "danger" ? "text-red-400" : "text-amber-400"}`}>
            <AlertTriangle size={20} />
          </div>
        )}
        <p className="text-sm text-corp-muted">{message}</p>
      </div>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} disabled={loading} className="px-4 py-2 text-sm text-corp-muted hover:text-corp-text hover:bg-white/[0.05] rounded-lg transition-colors">
          Cancelar
        </button>
        <button onClick={onConfirm} disabled={loading} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 ${btnClass}`}>
          {loading ? "Aguarde..." : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
