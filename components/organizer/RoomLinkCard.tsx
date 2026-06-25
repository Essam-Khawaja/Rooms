"use client";

import { Card } from "@/components/ui/Card";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

interface RoomLinkCardProps {
  slug: string;
  roomName: string;
}

export function RoomLinkCard({ slug, roomName }: RoomLinkCardProps) {
  const [copied, setCopied] = useState(false);
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/r/${slug}`
      : `/r/${slug}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback silent
    }
  };

  return (
    <Card variant="glass" className="flex flex-col gap-3">
      <p className="text-sm font-medium text-text-main">Room created: {roomName}</p>
      <div className="flex items-center gap-2 rounded-xl bg-surface px-3 py-2">
        <code className="flex-1 truncate text-xs text-accent">{url}</code>
        <button
          type="button"
          onClick={copyLink}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-text-muted hover:bg-surface-soft hover:text-text-main"
        >
          {copied ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
      <p className="text-xs text-text-faint">Share this link with attendees to join the room.</p>
    </Card>
  );
}
