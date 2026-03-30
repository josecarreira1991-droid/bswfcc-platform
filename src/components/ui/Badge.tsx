import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "gold";
  className?: string;
}

const variants = {
  default: "bg-slate-700/50 text-slate-300 border-slate-600/50",
  success: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  warning: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  danger: "bg-red-500/15 text-red-400 border-red-500/20",
  info: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  gold: "bg-gold/15 text-gold border-gold/20",
};

export default function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-md border",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
