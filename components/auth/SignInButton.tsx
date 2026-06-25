"use client";

import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface SignInButtonProps {
  redirectTo?: string;
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  children?: React.ReactNode;
}

export function SignInButton({
  redirectTo = "/dashboard",
  className,
  variant = "primary",
  size = "md",
  children,
}: SignInButtonProps) {
  const href =
    redirectTo === "/dashboard"
      ? "/auth"
      : `/auth?next=${encodeURIComponent(redirectTo)}`;

  return (
    <Link href={href} className={className?.includes("w-full") ? "block w-full" : undefined}>
      <Button variant={variant} size={size} className={className}>
        {children ?? "Sign in"}
      </Button>
    </Link>
  );
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  window.location.href = "/";
}
