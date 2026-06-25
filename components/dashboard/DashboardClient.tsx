"use client";

import { AppShell, EventCard, MetricStrip } from "@/components/layout/AppShell";
import { SignInButton } from "@/components/auth/SignInButton";
import { Button } from "@/components/ui/Button";
import { useDashboard } from "@/lib/hooks/use-dashboard";
import { useProfile } from "@/lib/hooks/use-profile";
import { useUser } from "@/lib/hooks/use-user";
import Link from "next/link";

export function DashboardClient() {
  const { data: user, isLoading: userLoading } = useUser();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data, isLoading } = useDashboard();

  if (userLoading) {
    return (
      <div className="flex h-dvh items-center justify-center text-text-muted">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-2xl font-semibold text-text-main">Your Rooms dashboard</h1>
        <p className="text-text-muted">Sign in to see events you organize and attend.</p>
        <SignInButton redirectTo="/dashboard" />
      </div>
    );
  }

  const isOrganizer = profile?.accountType === "organizer";
  const loading = isLoading || profileLoading;

  return (
    <AppShell>
      <div className="flex flex-col gap-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-text-main">
              {isOrganizer ? "Your events" : "Your rooms"}
            </h1>
            <p className="mt-1 text-sm text-text-muted">
              {isOrganizer
                ? "Manage rooms you organize and track event activity."
                : "Rooms you're enrolled in or currently attending."}
            </p>
          </div>
          {isOrganizer && (
            <Link href="/create">
              <Button>Create event</Button>
            </Link>
          )}
        </div>

        {loading ? (
          <p className="text-text-muted">Loading your rooms...</p>
        ) : isOrganizer ? (
          <>
            {data?.organizerMetrics && (
              <MetricStrip metrics={data.organizerMetrics} />
            )}

            {data?.organizing.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border bg-surface-soft px-6 py-12 text-center">
                <p className="text-text-muted">No events yet.</p>
                <Link href="/create" className="mt-4 inline-block">
                  <Button>Create your first event</Button>
                </Link>
              </div>
            ) : (
              <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {data?.organizing.map((room) => (
                  <EventCard
                    key={room.id}
                    room={room}
                    href={`/r/${room.slug}/pulse`}
                    badge="Organizer"
                  />
                ))}
              </div>
            )}
          </>
        ) : data?.attending.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-surface-soft px-6 py-12 text-center">
            <p className="text-text-muted">You haven&apos;t joined any rooms yet.</p>
            <Link href="/r/demo" className="mt-4 inline-block">
              <Button variant="secondary">Join the demo room</Button>
            </Link>
          </div>
        ) : (
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data?.attending.map((room) => (
              <EventCard
                key={`${room.id}-${room.attendeeId}`}
                room={room}
                href={`/r/${room.slug}/map`}
                badge="Attending"
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
