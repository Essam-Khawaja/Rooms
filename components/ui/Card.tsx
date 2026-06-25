import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "soft" | "glass";
}

export function Card({ className, variant = "default", children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl p-4",
        variant === "default" && "bg-surface border border-border",
        variant === "soft" && "bg-surface-soft border border-border/60",
        variant === "glass" && "glass-panel rounded-2xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
