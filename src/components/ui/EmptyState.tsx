import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-4", className)}>
      <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mb-4">
        <Icon size={24} className="text-slate-500" strokeWidth={1.5} />
      </div>
      <h3 className="text-sm font-medium text-slate-300 mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-slate-500 text-center max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
