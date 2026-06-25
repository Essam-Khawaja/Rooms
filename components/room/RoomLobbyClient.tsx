"use client";

import { apiCreateGuest } from "@/lib/api";
import { claimAttendee, findAttendeeByProfile } from "@/lib/db";
import { searchAttendees } from "@/lib/search";
import type { Attendee } from "@/lib/types";
import { useRoomData } from "@/lib/hooks/use-room-data";
import { useProfile } from "@/lib/hooks/use-profile";
import { useUser } from "@/lib/hooks/use-user";
import {
  getCurrentAttendeeId,
  setCurrentAttendeeId,
  setGuestSession,
} from "@/lib/session";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface RoomLobbyClientProps {
  slug: string;
}

export function RoomLobbyClient({ slug }: RoomLobbyClientProps) {
  const router = useRouter();
  const { data: user } = useUser();
  const { data: profile } = useProfile();
  const { data, isLoading } = useRoomData(slug);
  const [query, setQuery] = useState("");
  const [guestName, setGuestName] = useState("");
  const [showGuest, setShowGuest] = useState(false);

  useEffect(() => {
    const existing = getCurrentAttendeeId(slug);
    if (existing) {
      router.replace(`/r/${slug}/map`);
      return;
    }

    if (user && data) {
      findAttendeeByProfile(slug, user.id, profile?.username).then(async (attendeeId) => {
        if (attendeeId) {
          await claimAttendee(attendeeId, user.id);
          setCurrentAttendeeId(slug, attendeeId);
          router.replace(`/r/${slug}/map`);
        }
      });
    }
  }, [user, profile, data, slug, router]);

  const results = useMemo(() => {
    if (!data) return [];
    if (!query.trim()) return data.attendees.slice(0, 6);
    return searchAttendees(query, data.attendees);
  }, [data, query]);

  const claimProfile = async (attendee: Attendee) => {
    if (user) {
      await claimAttendee(attendee.id, user.id);
    }
    setCurrentAttendeeId(slug, attendee.id);
    router.push(`/r/${slug}/map`);
  };

  const joinAsGuest = async () => {
    const name = guestName.trim() || "Guest";
    const { attendeeId, sessionToken } = await apiCreateGuest(slug, name);
    setGuestSession(slug, sessionToken);
    setCurrentAttendeeId(slug, attendeeId);
    router.push(`/r/${slug}/map`);
  };

  if (isLoading) {
    return (
      <div className="flex h-dvh items-center justify-center text-text-muted">
        Loading...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-lg text-text-main">Room not found</p>
        <Link href="/">
          <Button variant="secondary">Back to home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border px-4 py-4">
        <Logo />
      </header>

      <div className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-10">
        <div className="text-center">
          <p className="text-sm text-text-muted">Welcome to</p>
          <h1 className="mt-1 text-2xl font-semibold text-text-main">{data.room.name}</h1>
          <p className="mt-2 text-sm text-text-muted">Find yourself to enter the room.</p>
        </div>

        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your name..."
          autoFocus
        />

        <div className="flex flex-col gap-2">
          {results.map((attendee) => (
            <Card key={attendee.id} variant="soft" className="flex items-center justify-between gap-3 py-3">
              <div className="flex items-center gap-3">
                <AvatarBubble name={attendee.name} url={attendee.avatarUrl} />
                <div>
                  <p className="font-medium text-text-main">{attendee.name}</p>
                  <p className="text-sm text-text-muted">
                    {[attendee.role, attendee.company].filter(Boolean).join(" · ")}
                  </p>
                  {attendee.username && (
                    <p className="text-xs text-accent">@{attendee.username}</p>
                  )}
                </div>
              </div>
              <Button size="sm" onClick={() => claimProfile(attendee)}>
                This is me
              </Button>
            </Card>
          ))}
        </div>

        {query && results.length === 0 && (
          <p className="text-center text-sm text-text-muted">No matching profile found.</p>
        )}

        <div className="border-t border-border pt-6">
          {!showGuest ? (
            <Button variant="ghost" className="w-full" onClick={() => setShowGuest(true)}>
              Join as guest
            </Button>
          ) : (
            <div className="flex flex-col gap-3">
              <Input
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Your name (optional)"
              />
              <Button className="w-full" onClick={joinAsGuest}>
                Enter as guest
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AvatarBubble({ name, url }: { name: string; url?: string }) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={url} alt="" className="h-10 w-10 rounded-full object-cover border border-border" />
    );
  }
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent">
      {name[0]?.toUpperCase()}
    </div>
  );
}
