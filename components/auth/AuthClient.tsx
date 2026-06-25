"use client";

import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { isUsernameAvailable } from "@/lib/db";
import { apiLinkAttendees } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import { safeNext } from "@/lib/safe-next";
import type { AccountType } from "@/lib/types";
import { normalizeUsername, validateUsername } from "@/lib/username";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { mutate } from "swr";

type AuthTab = "login" | "signup";

export function AuthClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"), "/dashboard");

  const [tab, setTab] = useState<AuthTab>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("attendee");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    await mutate("auth-user");
    await apiLinkAttendees();
    router.push(next);
    router.refresh();
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const normalizedUsername = normalizeUsername(username);
    const usernameError = validateUsername(normalizedUsername);
    if (usernameError) {
      setError(usernameError);
      setLoading(false);
      return;
    }

    if (!displayName.trim()) {
      setError("Display name is required.");
      setLoading(false);
      return;
    }

    const available = await isUsernameAvailable(normalizedUsername);
    if (!available) {
      setError("That username is already taken. Try another.");
      setLoading(false);
      return;
    }

    const signupRes = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.trim(),
        password,
        username: normalizedUsername,
        displayName: displayName.trim(),
        accountType,
      }),
    });

    const signupData = await signupRes.json().catch(() => ({}));
    if (!signupRes.ok) {
      setError(signupData.error ?? "Failed to create account.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    await mutate("auth-user");
    await apiLinkAttendees();
    router.push(next);
    router.refresh();
  };

  return (
    <div className="min-h-dvh bg-background">
      <header className="flex items-center justify-between px-4 py-4">
        <Logo />
        <Link
          href="/"
          className="text-sm text-text-muted transition-colors hover:text-text-main"
        >
          Back to home
        </Link>
      </header>

      <main className="mx-auto flex max-w-md flex-col gap-6 px-4 pb-16 pt-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-text-main">
            {tab === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            {tab === "login"
              ? "Sign in to access your rooms and profile."
              : "Pick a unique username — organizers use it to link you in event lists."}
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-surface-soft p-6">
          <div className="mb-6 flex rounded-xl bg-surface p-1">
            <button
              type="button"
              onClick={() => {
                setTab("login");
                setError(null);
              }}
              className={cn(
                "flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors",
                tab === "login"
                  ? "bg-accent-soft text-accent"
                  : "text-text-muted hover:text-text-main"
              )}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("signup");
                setError(null);
              }}
              className={cn(
                "flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors",
                tab === "signup"
                  ? "bg-accent-soft text-accent"
                  : "text-text-muted hover:text-text-main"
              )}
            >
              Create account
            </button>
          </div>

          {tab === "login" ? (
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <Field label="Email">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </Field>
              <Field label="Password">
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  required
                  autoComplete="current-password"
                />
              </Field>
              {error && <p className="text-sm text-danger">{error}</p>}
              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Log in"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="flex flex-col gap-4">
              <Field label="Username" hint="Unique handle used to link you in event CSVs">
                <Input
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value.toLowerCase().replace(/\s/g, ""))
                  }
                  placeholder="aishakhan"
                  required
                  autoComplete="username"
                />
              </Field>
              <Field label="Display name">
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Alex Chen"
                  required
                  autoComplete="name"
                />
              </Field>
              <Field label="Account type">
                <div className="flex rounded-xl bg-surface p-1">
                  <button
                    type="button"
                    onClick={() => setAccountType("organizer")}
                    className={cn(
                      "flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors",
                      accountType === "organizer"
                        ? "bg-accent-soft text-accent"
                        : "text-text-muted hover:text-text-main"
                    )}
                  >
                    Organizer
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountType("attendee")}
                    className={cn(
                      "flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors",
                      accountType === "attendee"
                        ? "bg-accent-soft text-accent"
                        : "text-text-muted hover:text-text-main"
                    )}
                  >
                    Attendee
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-text-faint">
                  {accountType === "organizer"
                    ? "Create and manage event rooms with Room Pulse analytics."
                    : "Join rooms, map connections, and track who you meet."}
                </p>
              </Field>
              <Field label="Email">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </Field>
              <Field label="Password">
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </Field>
              {error && <p className="text-sm text-danger">{error}</p>}
              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : "Create account"}
              </Button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-text-faint">
          Guests can join any public room without an account.{" "}
          <Link href="/r/demo" className="text-accent hover:underline">
            Try the demo room
          </Link>
        </p>
      </main>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-text-faint">
        {label}
      </label>
      {hint && <p className="mb-1 text-xs text-text-faint">{hint}</p>}
      {children}
    </div>
  );
}
