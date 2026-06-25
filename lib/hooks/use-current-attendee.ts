"use client";

import { getCurrentAttendeeId } from "@/lib/session";
import { useSyncExternalStore } from "react";

export function useCurrentAttendeeId(slug: string): string | null {
  return useSyncExternalStore(
    () => () => undefined,
    () => getCurrentAttendeeId(slug),
    () => null
  );
}
