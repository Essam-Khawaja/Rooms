"use client";

import { Search } from "lucide-react";

interface SearchBarProps {
  onClick: () => void;
}

export function SearchBar({ onClick }: SearchBarProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="glass-panel flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left min-h-[48px] transition-colors hover:border-accent/30"
    >
      <Search className="h-4 w-4 shrink-0 text-text-faint" />
      <span className="text-[15px] text-text-faint">Find someone in the room...</span>
    </button>
  );
}
