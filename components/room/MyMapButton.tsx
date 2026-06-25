"use client";

import Link from "next/link";
import { Map } from "lucide-react";

interface MyMapButtonProps {
  slug: string;
}

export function MyMapButton({ slug }: MyMapButtonProps) {
  return (
    <Link
      href={`/r/${slug}/me`}
      className="glass-panel flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-text-main transition-colors hover:border-accent/40 min-h-[44px]"
    >
      <Map className="h-4 w-4 text-accent" />
      My Map
    </Link>
  );
}
