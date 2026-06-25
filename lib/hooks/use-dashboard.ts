"use client";

import { apiLinkAttendees } from "@/lib/api";
import { fetchDashboard } from "@/lib/db";
import { useUser } from "@/lib/hooks/use-user";
import useSWR from "swr";

export function useDashboard() {
  const { data: user } = useUser();
  return useSWR(user ? `dashboard-${user.id}` : null, async () => {
    await apiLinkAttendees();
    return fetchDashboard(user!.id);
  });
}
