"use client";

import type { Attendee } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Bookmark, X } from "lucide-react";

interface PersonSheetProps {
  attendee: Attendee | null;
  isMet: boolean;
  isSaved: boolean;
  isSelf: boolean;
  readOnly?: boolean;
  onClose: () => void;
  onMet: () => void;
  onSave: () => void;
}

export function PersonSheet({
  attendee,
  isMet,
  isSaved,
  isSelf,
  readOnly = false,
  onClose,
  onMet,
  onSave,
}: PersonSheetProps) {
  if (!attendee) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Avatar name={attendee.name} url={attendee.avatarUrl} />
          <div>
            <h2 className="text-xl font-semibold text-text-main">{attendee.name}</h2>
            <p className="text-sm text-text-muted">
              {[attendee.role, attendee.company].filter(Boolean).join(" · ")}
            </p>
            {attendee.username && (
              <p className="text-xs text-accent">@{attendee.username}</p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-text-muted hover:bg-surface-soft"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {attendee.interests.length > 0 && (
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-text-faint">
            Interested in
          </p>
          <p className="text-sm text-text-main">{attendee.interests.join(", ")}</p>
        </div>
      )}

      {attendee.lookingFor && (
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-text-faint">
            Looking for
          </p>
          <p className="text-sm text-text-main">{attendee.lookingFor}</p>
        </div>
      )}

      {attendee.canHelpWith && (
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-text-faint">
            Can help with
          </p>
          <p className="text-sm text-text-main">{attendee.canHelpWith}</p>
        </div>
      )}

      {readOnly && (
        <p className="text-sm text-text-muted">
          Organizer view — browse profiles without logging connections.
        </p>
      )}

      {!isSelf && !readOnly && (
        <div className="flex gap-3 pt-2">
          <Button
            variant={isMet ? "secondary" : "primary"}
            className="flex-1"
            onClick={onMet}
          >
            {isMet ? "Update meeting" : "Met"}
          </Button>
          <Button
            variant={isSaved ? "primary" : "secondary"}
            className="flex-1"
            onClick={onSave}
          >
            <Bookmark className="h-4 w-4" />
            {isSaved ? "Saved" : "Save"}
          </Button>
        </div>
      )}

      {isSelf && (
        <p className="text-sm text-accent">This is you in the room.</p>
      )}
    </div>
  );
}

function Avatar({ name, url }: { name: string; url?: string }) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={url} alt="" className="h-12 w-12 rounded-full object-cover border border-border" />
    );
  }
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent">
      {name[0]?.toUpperCase()}
    </div>
  );
}
