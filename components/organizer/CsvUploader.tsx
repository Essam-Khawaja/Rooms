"use client";

import type { CreateAttendeeInput } from "@/lib/types";
import { getFallbackAttendees, parseCsvToAttendees } from "@/lib/csv";
import { Upload } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

interface CsvUploaderProps {
  onParsed: (attendees: CreateAttendeeInput[]) => void;
  onError: (message: string) => void;
}

export function CsvUploader({ onParsed, onError }: CsvUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const attendees = parseCsvToAttendees(text);
        onParsed(attendees);
      } catch {
        onError("CSV parsing failed. Using sample data instead.");
        onParsed(getFallbackAttendees());
      }
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-surface-soft p-6 text-center transition-colors hover:border-accent/40 min-h-[44px]"
      >
        <Upload className="h-6 w-6 text-text-faint" />
        <span className="text-sm font-medium text-text-main">Upload CSV</span>
        <span className="text-xs text-text-faint">
          name, email, role, company, interests, username...
        </span>
      </button>
      <p className="mt-2 text-center text-xs text-text-faint">
        Demo file for judges:{" "}
        <Link
          href="/demo/startup-mixer-2026.csv"
          download
          className="text-accent hover:underline"
        >
          startup-mixer-2026.csv
        </Link>
      </p>
    </div>
  );
}
