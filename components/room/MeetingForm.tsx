"use client";

import { QUICK_TAGS } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

interface MeetingFormProps {
  personName: string;
  initialTags?: string[];
  initialNote?: string;
  onBack: () => void;
  onSave: (data: { tags: string[]; note: string; followUp: boolean }) => void;
}

export function MeetingForm({
  personName,
  initialTags = [],
  initialNote = "",
  onBack,
  onSave,
}: MeetingFormProps) {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [note, setNote] = useState(initialNote);

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const followUpTags = ["Follow up", "Send resume", "Coffee chat", "Hiring", "Investor", "Mentor"];

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-text-muted hover:text-text-main"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to profile
      </button>

      <div>
        <h3 className="text-lg font-semibold text-text-main">Log conversation</h3>
        <p className="text-sm text-text-muted">with {personName}</p>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-faint">
          Quick tags
        </p>
        <div className="flex flex-wrap gap-2">
          {QUICK_TAGS.map((tag) => (
            <Pill key={tag} active={tags.includes(tag)} onClick={() => toggleTag(tag)}>
              {tag}
            </Pill>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-faint">
          Note (optional)
        </p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What did you talk about?"
          rows={3}
          className="w-full resize-none rounded-xl border border-border bg-surface-soft px-4 py-3 text-[15px] text-text-main placeholder:text-text-faint focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
      </div>

      <Button
        size="lg"
        className="w-full"
        onClick={() =>
          onSave({
            tags,
            note,
            followUp: tags.some((t) => followUpTags.includes(t)),
          })
        }
      >
        Save connection
      </Button>
    </div>
  );
}
