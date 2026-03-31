"use client";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps { open: boolean; onClose: () => void; title: string; description?: string; children: React.ReactNode; size?: "sm" | "md" | "lg" | "xl"; }
const sizeClasses = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };

export default function Modal({ open, onClose, title, description, children, size = "md" }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (open) document.body.style.overflow = "hidden"; else document.body.style.overflow = ""; return () => { document.body.style.overflow = ""; }; }, [open]);
  useEffect(() => { const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); }; if (open) window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h); }, [open, onClose]);
  if (!open) return null;
  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}>
      <div className={cn("w-full bg-white border border-corp-border rounded-lg shadow-card-hover", sizeClasses[size])}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-corp-border bg-gradient-to-b from-[#F0F3F8] to-[#E8ECF2]">
          <div>
            <h2 className="text-base font-semibold text-corp-text">{title}</h2>
            {description && <p className="text-xs text-corp-muted mt-0.5">{description}</p>}
          </div>
          <button onClick={onClose} className="text-corp-muted hover:text-corp-text p-1 rounded hover:bg-black/[0.05] transition-colors"><X size={16} /></button>
        </div>
        <div className="px-5 py-4 max-h-[70vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
