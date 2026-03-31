import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md";
  loading?: boolean;
}

const variantClasses = {
  primary: "bg-accent hover:bg-accent-dim text-white font-medium",
  secondary: "bg-white/[0.05] text-corp-text hover:bg-white/[0.08] border border-corp-border",
  danger: "bg-red-600 text-white hover:bg-red-700",
  ghost: "text-corp-muted hover:text-corp-text hover:bg-white/[0.05]",
};

const sizeClasses = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
};

export default function Button({
  variant = "primary", size = "md", loading = false,
  className, children, disabled, ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        variantClasses[variant], sizeClasses[size], className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
