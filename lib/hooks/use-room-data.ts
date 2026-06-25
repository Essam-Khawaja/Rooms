"use client";

import { fetchRoomData, subscribeToRoom } from "@/lib/db";
import type { RoomData } from "@/lib/types";
import { useIsClient } from "@/lib/use-is-client";
import { useEffect } from "react";
import useSWR from "swr";

export function useRoomData(slug: string) {
  const isClient = useIsClient();
  const { data, error, isLoading, mutate } = useSWR<RoomData | null>(
    isClient ? `room-${slug}` : null,
    () => fetchRoomData(slug),
    { revalidateOnFocus: true }
  );

  useEffect(() => {
    if (!data?.room.id) return;
    return subscribeToRoom(data.room.id, () => mutate());
  }, [data?.room.id, mutate]);

  return { data, error, isLoading: !isClient || isLoading, mutate };
}
