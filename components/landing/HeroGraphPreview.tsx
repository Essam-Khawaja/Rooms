"use client";

import { demoAttendees } from "@/lib/demo-data";
import { RoomGraph } from "@/components/room/RoomGraph";
import { useMemo } from "react";

export function HeroGraphPreview() {
  const previewData = useMemo(
    () => ({
      attendees: demoAttendees.slice(0, 12),
      connections: [],
      saved: [],
    }),
    []
  );

  return (
    <div className="relative h-[280px] w-full overflow-hidden rounded-3xl border border-border bg-surface lg:h-[420px]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(214,255,107,0.06)_0%,transparent_70%)]" />
      <RoomGraph
        attendees={previewData.attendees}
        connections={previewData.connections}
        saved={previewData.saved}
        interactive={false}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-surface to-transparent" />
    </div>
  );
}
