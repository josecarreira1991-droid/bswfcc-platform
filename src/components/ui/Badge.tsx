import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "gold";
  className?: string;
}

const variants = {
  default: "bg-white/[0.06] text-corp-muted border-white/[0.06]",
  success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/15",
  warning: "bg-amber-500/10 text-amber-400 border-amber-500/15",
  danger: "bg-red-500/10 text-red-400 border-red-500/15",
  info: "bg-accent/10 text-accent-light border-accent/15",
  gold: "bg-amber-500/10 text-amber-300 border-amber-500/15",
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
