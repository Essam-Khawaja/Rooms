"use client";

import { getFallbackAttendees } from "@/lib/csv";
import { createRoomInDb } from "@/lib/db";
import type { CreateAttendeeInput } from "@/lib/types";
import { useProfile } from "@/lib/hooks/use-profile";
import { useUser } from "@/lib/hooks/use-user";
import { AttendeePreviewTable } from "@/components/organizer/AttendeePreviewTable";
import { CsvUploader } from "@/components/organizer/CsvUploader";
import { RoomLinkCard } from "@/components/organizer/RoomLinkCard";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { useEffect, useState } from "react";

export function CreateRoomClient() {
  const { data: user } = useUser();
  const { data: profile } = useProfile();
  const [eventName, setEventName] = useState("Startup Mixer 2026");
  const [description, setDescription] = useState("");
  const [attendees, setAttendees] = useState<CreateAttendeeInput[]>([]);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile?.displayName && !eventName.includes(profile.displayName)) {
      // keep default event name
    }
  }, [profile, eventName]);

  const organizerName =
    profile?.displayName ?? user?.user_metadata?.display_name ?? user?.email ?? "Organizer";

  if (profile && profile.accountType !== "organizer") {
    return (
      <AppShell>
        <div className="mx-auto flex max-w-2xl flex-col gap-4 text-center">
          <h1 className="text-2xl font-semibold text-text-main">Organizers only</h1>
          <p className="text-sm text-text-muted">
            Creating rooms is available for organizer accounts. Attendees can join rooms
            from links shared by organizers.
          </p>
          <Link href="/dashboard">
            <Button variant="secondary">Back to dashboard</Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  const loadSampleData = () => {
    setAttendees(getFallbackAttendees());
    setError(null);
  };

  const handleCreate = async () => {
    if (!user) return;
    if (!eventName.trim()) {
      setError("Event name is required.");
      return;
    }
    setLoading(true);
    try {
      const finalAttendees = attendees.length > 0 ? attendees : getFallbackAttendees();
      const room = await createRoomInDb({
        name: eventName.trim(),
        organizerId: user.id,
        organizerName,
        description: description.trim() || undefined,
        attendees: finalAttendees,
      });
      setCreatedSlug(room.slug);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold text-text-main">Create a room</h1>
          <p className="mt-1 text-sm text-text-muted">
            Set up your event and load attendees. Signed in as {organizerName}.
          </p>
        </div>

        {!createdSlug ? (
          <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
            <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <Field label="Event name">
                <Input
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="Startup Mixer 2026"
                />
              </Field>
              <Field label="Description (optional)">
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A networking night for builders"
                />
              </Field>
            </div>

            <div className="flex flex-col gap-3">
              <CsvUploader
                onParsed={setAttendees}
                onError={(msg) => {
                  setError(msg);
                  setAttendees(getFallbackAttendees());
                }}
              />
              <Button variant="secondary" onClick={loadSampleData}>
                Use sample data
              </Button>
            </div>

            <Card variant="soft" className="text-xs text-text-muted">
              CSV columns: name, email, role, company, interests, looking_for, can_help_with, username.
              Attendees with a matching username will link to their Rooms profile automatically.
            </Card>

            {error && <p className="text-sm text-danger">{error}</p>}

            <Button size="lg" className="w-full" onClick={handleCreate} disabled={loading}>
              {loading ? "Creating..." : "Generate room map"}
            </Button>
            </div>

            <div className="flex flex-col gap-4">
              <AttendeePreviewTable attendees={attendees} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <RoomLinkCard slug={createdSlug} roomName={eventName} />
            <Link href={`/r/${createdSlug}`}>
              <Button size="lg" className="w-full">
                Open room
              </Button>
            </Link>
            <Link href={`/r/${createdSlug}/pulse`}>
              <Button variant="secondary" size="lg" className="w-full">
                View Room Pulse
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost" size="lg" className="w-full">
                Back to dashboard
              </Button>
            </Link>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-text-faint">
        {label}
      </label>
      {children}
    </div>
  );
}
