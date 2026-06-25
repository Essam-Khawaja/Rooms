"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

/**
 * If Supabase lands email-confirm links on the site root with ?code= or ?token_hash=,
 * forward them through /auth/callback so the session is exchanged server-side.
 */
export function AuthRedirectHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    const tokenHash = searchParams.get("token_hash");
    const type = searchParams.get("type");

    if (!code && !(tokenHash && type)) return;

    const params = new URLSearchParams(searchParams.toString());
    if (!params.has("next")) {
      params.set("next", "/");
    }
    router.replace(`/auth/callback?${params.toString()}`);
  }, [router, searchParams]);

  return null;
}
