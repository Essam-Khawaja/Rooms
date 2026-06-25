"use client";

import { searchAttendees } from "@/lib/search";
import type { Attendee } from "@/lib/types";
import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface SearchOverlayProps {
  open: boolean;
  attendees: Attendee[];
  onClose: () => void;
  onSelect: (attendee: Attendee) => void;
}

export function SearchOverlay({
  open,
  attendees,
  onClose,
  onSelect,
}: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const results = searchAttendees(query, attendees);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-md">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <Search className="h-5 w-5 text-text-faint" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Find someone in the room..."
          className="flex-1 bg-transparent text-[16px] text-text-main placeholder:text-text-faint focus:outline-none"
        />
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full text-text-muted hover:bg-surface-soft"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {query && results.length === 0 && (
          <p className="py-8 text-center text-text-muted">No one found matching &ldquo;{query}&rdquo;</p>
        )}

        <div className="flex flex-col gap-2">
          {results.map((attendee) => (
            <button
              key={attendee.id}
              type="button"
              onClick={() => {
                onSelect(attendee);
                onClose();
              }}
              className="flex flex-col gap-1 rounded-2xl border border-border bg-surface p-4 text-left transition-colors hover:border-accent/40 hover:bg-surface-soft min-h-[44px]"
            >
              <span className="font-medium text-text-main">{attendee.name}</span>
              <span className="text-sm text-text-muted">
                {[attendee.role, attendee.company].filter(Boolean).join(" · ")}
              </span>
              {attendee.interests.length > 0 && (
                <span className="text-xs text-text-faint">
                  {attendee.interests.slice(0, 3).join(" · ")}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
