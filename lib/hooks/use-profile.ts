"use client";

import { fetchProfile } from "@/lib/db";
import { useUser } from "@/lib/hooks/use-user";
import useSWR from "swr";

export function useProfile() {
  const { data: user } = useUser();
  return useSWR(
    user ? `profile-${user.id}` : null,
    () => fetchProfile(user!.id)
  );
}
