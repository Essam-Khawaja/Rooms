"use client";

import { getSuggestedAction } from "@/lib/followups";
import type { Attendee, Connection } from "@/lib/types";
import { useRoomData } from "@/lib/hooks/use-room-data";
import { useCurrentAttendeeId } from "@/lib/hooks/use-current-attendee";
import { Card } from "@/components/ui/Card";
import { RoomGraph } from "@/components/room/RoomGraph";
import { RoomHeader } from "@/components/room/RoomHeader";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

interface MyMapClientProps {
  slug: string;
}

export function MyMapClient({ slug }: MyMapClientProps) {
  const router = useRouter();
  const { data, isLoading } = useRoomData(slug);
  const currentUserId = useCurrentAttendeeId(slug);

  useEffect(() => {
    if (!isLoading && data && !currentUserId) {
      router.replace(`/r/${slug}`);
    }
  }, [isLoading, data, currentUserId, slug, router]);

  const myConnections = useMemo(() => {
    if (!data || !currentUserId) return [];
    return data.connections.filter((c) => c.fromAttendeeId === currentUserId);
  }, [data, currentUserId]);

  const attendeeMap = useMemo(() => {
    const map = new Map<string, Attendee>();
    data?.attendees.forEach((a) => map.set(a.id, a));
    return map;
  }, [data]);

  const followUps = useMemo(() => {
    return myConnections
      .filter((c) => c.followUp || c.tags.length > 0)
      .map((c) => ({
        connection: c,
        attendee: attendeeMap.get(c.toAttendeeId),
      }))
      .filter((item) => item.attendee);
  }, [myConnections, attendeeMap]);

  if (isLoading || !data || !currentUserId) {
    return (
      <div className="flex h-dvh items-center justify-center text-text-muted">
        Loading your map...
      </div>
    );
  }

  const currentUser = attendeeMap.get(currentUserId);

  return (
    <div className="min-h-dvh bg-background pb-8">
      <RoomHeader slug={slug} title="My Map" backHref={`/r/${slug}/map`} />

      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 pt-2">
        <section>
          {myConnections.length === 0 ? (
            <Card variant="soft" className="text-center">
              <p className="text-lg font-medium text-text-main">Your map is empty.</p>
              <p className="mt-2 text-sm text-text-muted">
                Meet someone, find their node, and mark the conversation.
              </p>
              <Link href={`/r/${slug}/map`} className="mt-4 inline-block">
                <Button>Back to room</Button>
              </Link>
            </Card>
          ) : (
            <>
              <h2 className="text-2xl font-semibold text-text-main">
                You made {myConnections.length} connection
                {myConnections.length !== 1 ? "s" : ""} tonight.
              </h2>
              <p className="mt-1 text-text-muted">
                {followUps.length > 0
                  ? `${followUps.length} ${followUps.length === 1 ? "is" : "are"} worth following up with this week.`
                  : "Keep building your network in the room."}
              </p>
            </>
          )}
        </section>

        {followUps.length > 0 && (
          <section>
            <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-text-faint">
              Top follow-ups
            </h3>
            <div className="grid gap-3 lg:grid-cols-2">
              {followUps.slice(0, 5).map(({ connection, attendee }) => (
                <FollowUpCard key={connection.id} connection={connection} attendee={attendee!} />
              ))}
            </div>
          </section>
        )}

        {myConnections.length > 0 && (
          <section className="grid gap-6 lg:grid-cols-2">
            <div>
            <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-text-faint">
              People met
            </h3>
            <div className="flex flex-col gap-2">
              {myConnections.map((c) => {
                const person = attendeeMap.get(c.toAttendeeId);
                if (!person) return null;
                return (
                  <Card key={c.id} variant="soft" className="py-3">
                    <p className="font-medium text-text-main">{person.name}</p>
                    <p className="text-sm text-text-muted">
                      {[person.role, person.company].filter(Boolean).join(" · ")}
                    </p>
                    {c.tags.length > 0 && (
                      <p className="mt-1 text-xs text-accent">Tags: {c.tags.join(", ")}</p>
                    )}
                    {c.note && <p className="mt-2 text-sm text-text-muted">{c.note}</p>}
                  </Card>
                );
              })}
            </div>
            </div>

            <div>
            <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-text-faint">
              Your personal graph
            </h3>
            <Card className="h-[280px] overflow-hidden p-0 lg:h-[420px]">
              <RoomGraph
                attendees={data.attendees.filter(
                  (a) =>
                    a.id === currentUserId ||
                    myConnections.some((c) => c.toAttendeeId === a.id)
                )}
                connections={data.connections}
                saved={data.saved}
                currentAttendeeId={currentUserId}
                interactive={false}
              />
            </Card>
            </div>
          </section>
        )}

        {currentUser && (
          <p className="text-center text-xs text-text-faint">Viewing as {currentUser.name}</p>
        )}
      </div>
    </div>
  );
}

function FollowUpCard({
  connection,
  attendee,
}: {
  connection: Connection;
  attendee: Attendee;
}) {
  const action = getSuggestedAction(connection.tags, connection.note);
  return (
    <Card variant="glass">
      <p className="font-semibold text-text-main">{attendee.name}</p>
      <p className="text-sm text-text-muted">
        {[attendee.role, attendee.company].filter(Boolean).join(" · ")}
      </p>
      {connection.tags.length > 0 && (
        <p className="mt-2 text-xs text-accent">Tags: {connection.tags.join(", ")}</p>
      )}
      {connection.note && <p className="mt-2 text-sm text-text-muted">Note: {connection.note}</p>}
      <div className="mt-3 rounded-xl bg-accent-soft px-3 py-2">
        <p className="text-xs font-medium uppercase tracking-wide text-text-faint">
          Suggested action
        </p>
        <p className="mt-1 text-sm text-text-main">{action}</p>
      </div>
    </Card>
  );
}
