"use client";

import { createClient } from "@/lib/supabase/client";
import useSWR from "swr";
import type { User } from "@supabase/supabase-js";

async function getUser(): Promise<User | null> {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export function useUser() {
  return useSWR("auth-user", getUser);
}
