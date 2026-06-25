import { cn } from "@/lib/utils";
import Link from "next/link";

interface LogoProps {
  className?: string;
  showTagline?: boolean;
}

export function Logo({ className, showTagline = false }: LogoProps) {
  return (
    <Link href="/" className={cn("inline-flex flex-col gap-1", className)}>
      <span className="text-2xl font-semibold tracking-tight text-text-main">
        r<span className="text-accent">∞</span>ms
      </span>
      {showTagline && (
        <span className="text-xs text-text-muted">make sure you&apos;re in the right room</span>
      )}
    </Link>
  );
}
