import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

interface PillProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export function Pill({ className, active, children, ...props }: PillProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-medium transition-all min-h-[32px]",
        active
          ? "bg-accent text-background"
          : "bg-surface-soft text-text-muted border border-border hover:border-text-faint hover:text-text-main",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
