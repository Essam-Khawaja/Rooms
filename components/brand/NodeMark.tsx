import { cn } from "@/lib/utils";

interface NodeMarkProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function NodeMark({ className, size = "md" }: NodeMarkProps) {
  const sizes = {
    sm: "text-sm gap-1",
    md: "text-base gap-1.5",
    lg: "text-xl gap-2",
  };

  return (
    <span
      className={cn("inline-flex items-center font-mono text-accent", sizes[size], className)}
      aria-hidden
    >
      <span className="inline-block h-2 w-2 rounded-full bg-accent shadow-[0_0_8px_rgba(214,255,107,0.6)]" />
      <span className="text-text-faint">—</span>
      <span className="inline-block h-2 w-2 rounded-full border border-accent/60" />
    </span>
  );
}
