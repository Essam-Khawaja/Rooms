import { AuthRedirectHandler } from "@/components/auth/AuthRedirectHandler";
import { HeroGraphPreview } from "@/components/landing/HeroGraphPreview";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { SignInButton } from "@/components/auth/SignInButton";
import { Logo } from "@/components/brand/Logo";
import { NodeMark } from "@/components/brand/NodeMark";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Suspense } from "react";

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ confirmed?: string; error?: string }>;
}) {
  const params = await searchParams;
  let user = null;
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
  }

  return (
    <div className="min-h-dvh bg-background">
      <Suspense fallback={null}>
        <AuthRedirectHandler />
      </Suspense>

      <header className="flex items-center justify-between px-4 py-4 md:px-8">
        <Logo />
        <div className="flex items-center gap-2">
          <NodeMark className="hidden sm:flex" />
          {user ? (
            <Link href="/dashboard">
              <Button variant="secondary" size="sm">
                Dashboard
              </Button>
            </Link>
          ) : (
            <SignInButton variant="secondary" size="sm" />
          )}
        </div>
      </header>

      <main className="mx-auto flex max-w-4xl flex-col gap-16 px-4 pb-20 pt-6 md:px-8">
        {params.confirmed === "1" && (
          <div className="rounded-2xl border border-accent/30 bg-accent-soft px-4 py-3 text-center text-sm text-accent">
            Email confirmed. You can sign in and start using Rooms.
          </div>
        )}
        {params.error === "auth" && (
          <div className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-center text-sm text-danger">
            Sign-in link expired or invalid. Please try again.
          </div>
        )}

        <section className="grid items-center gap-10 md:grid-cols-2 md:gap-12">
          <div className="flex flex-col gap-6">
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-accent">
                Social cartography for events
              </p>
              <h1 className="text-4xl font-semibold leading-tight tracking-tight text-text-main md:text-5xl">
                Make sure you&apos;re in the{" "}
                <span className="text-accent">right room</span>.
              </h1>
              <p className="mt-4 text-[15px] leading-relaxed text-text-muted md:text-base">
                Rooms turns networking events into live social maps. Find the right
                people, remember every conversation, and leave with a follow-up plan.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/r/demo" className="flex-1">
                <Button size="lg" className="w-full">
                  Enter demo room
                </Button>
              </Link>
              {user ? (
                <Link href="/dashboard" className="flex-1">
                  <Button variant="secondary" size="lg" className="w-full">
                    Go to dashboard
                  </Button>
                </Link>
              ) : (
                <div className="flex-1">
                  <SignInButton variant="secondary" size="lg" className="w-full" />
                </div>
              )}
            </div>

            <p className="text-xs text-text-faint">
              Sign in to create rooms. Guests can join any room without an account.
            </p>
          </div>

          <HeroGraphPreview />
        </section>

        <ProblemSection />
        <HowItWorks />

        <section className="rounded-3xl border border-border bg-surface-soft p-8 text-center">
          <p className="text-lg font-medium text-text-main md:text-xl">
            Every conversation visible, memorable, and actionable.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/r/demo">
              <Button size="lg">Enter demo room</Button>
            </Link>
            {user ? (
              <Link href="/dashboard">
                <Button variant="secondary" size="lg">
                  Go to dashboard
                </Button>
              </Link>
            ) : (
              <SignInButton variant="secondary" size="lg" />
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
