import { cn } from "@/lib/utils";

interface BadgeProps { children: React.ReactNode; variant?: "default" | "success" | "warning" | "danger" | "info" | "gold"; className?: string; }

const variants = {
  default: "bg-gray-100 text-gray-600 border-gray-300",
  success: "bg-emerald-50 text-emerald-700 border-emerald-300",
  warning: "bg-amber-50 text-amber-700 border-amber-300",
  danger: "bg-red-50 text-red-700 border-red-300",
  info: "bg-blue-50 text-blue-700 border-blue-300",
  gold: "bg-amber-50 text-amber-800 border-amber-300",
};

export default function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 text-[11px] font-semibold rounded border", variants[variant], className)}>
      {children}
    </span>
  );
}
