import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface MetricCardProps {
  label: string;
  value: string | number;
  hint?: string;
  className?: string;
  children?: ReactNode;
}

export function MetricCard({ label, value, hint, className, children }: MetricCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-surface-soft p-4",
        className
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-text-faint">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-text-main">{value}</p>
      {hint && <p className="mt-1 text-sm text-text-muted">{hint}</p>}
      {children}
    </div>
  );
}
