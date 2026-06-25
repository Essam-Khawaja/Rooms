"use client";

import Link from "next/link";
import { Activity, ChevronLeft } from "lucide-react";

interface RoomHeaderProps {
  slug: string;
  title: string;
  showPulse?: boolean;
  backHref?: string;
  badge?: string;
}

export function RoomHeader({
  slug,
  title,
  showPulse = false,
  backHref,
  badge,
}: RoomHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="flex min-w-0 items-center gap-2">
        {backHref && (
          <Link
            href={backHref}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-text-muted hover:bg-surface-soft"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
        )}
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold text-text-main">{title}</h1>
          {badge && (
            <p className="truncate text-xs text-accent">{badge}</p>
          )}
        </div>
      </div>
      {showPulse && (
        <Link
          href={`/r/${slug}/pulse`}
          className="flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-medium text-text-muted hover:border-accent/40 hover:text-text-main min-h-[40px]"
        >
          <Activity className="h-3.5 w-3.5" />
          Pulse
        </Link>
      )}
    </header>
  );
}
