import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-background hover:bg-accent/90 font-semibold shadow-[0_0_24px_rgba(214,255,107,0.15)]",
  secondary:
    "bg-surface-soft text-text-main border border-border hover:border-text-muted",
  ghost: "bg-transparent text-text-muted hover:text-text-main hover:bg-surface-soft",
  danger: "bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm rounded-lg min-h-[36px]",
  md: "h-11 px-4 text-[15px] rounded-xl min-h-[44px]",
  lg: "h-12 px-6 text-[15px] rounded-xl min-h-[48px]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
