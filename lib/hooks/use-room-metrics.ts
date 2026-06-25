"use client";

import { fetchRoomMetrics } from "@/lib/db";
import { useIsClient } from "@/lib/use-is-client";
import useSWR from "swr";

export function useRoomMetrics(slug: string) {
  const isClient = useIsClient();
  return useSWR(
    isClient ? `metrics-${slug}` : null,
    () => fetchRoomMetrics(slug)
  );
}
