import type { CreateAttendeeInput } from "@/lib/types";
import { Card } from "@/components/ui/Card";

interface AttendeePreviewTableProps {
  attendees: CreateAttendeeInput[];
}

export function AttendeePreviewTable({ attendees }: AttendeePreviewTableProps) {
  if (attendees.length === 0) return null;

  return (
    <Card variant="soft" className="overflow-hidden p-0">
      <div className="border-b border-border px-4 py-3">
        <p className="text-sm font-medium text-text-main">
          {attendees.length} attendee{attendees.length !== 1 ? "s" : ""} loaded
        </p>
      </div>
      <div className="max-h-[240px] overflow-y-auto lg:max-h-[480px]">
        {attendees.slice(0, 8).map((a, i) => (
          <div
            key={`${a.name}-${i}`}
            className="flex items-center justify-between border-b border-border/50 px-4 py-3 last:border-0"
          >
            <div>
              <p className="text-sm font-medium text-text-main">{a.name}</p>
              <p className="text-xs text-text-muted">
                {[a.role, a.company].filter(Boolean).join(" · ")}
              </p>
              {a.username && <p className="text-xs text-accent">@{a.username}</p>}
            </div>
            <span className="text-xs text-text-faint">{a.cluster}</span>
          </div>
        ))}
        {attendees.length > 8 && (
          <p className="px-4 py-2 text-center text-xs text-text-faint">
            +{attendees.length - 8} more
          </p>
        )}
      </div>
    </Card>
  );
}
