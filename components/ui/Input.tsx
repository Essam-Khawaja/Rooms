import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full h-11 min-h-[44px] rounded-xl bg-surface-soft border border-border px-4 text-[15px] text-text-main placeholder:text-text-faint",
          "focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
