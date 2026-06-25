import type { Connection } from "@/lib/types";
import { getGuestSession } from "@/lib/session";

export async function apiCreateConnection(
  slug: string,
  input: {
    fromAttendeeId: string;
    toAttendeeId: string;
    note?: string;
    tags: string[];
    followUp: boolean;
  }
): Promise<Connection> {
  const res = await fetch(`/api/rooms/${slug}/connections`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...input,
      sessionToken: getGuestSession(slug),
    }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Failed to save connection");
  return json.connection;
}

export async function apiToggleSaved(
  slug: string,
  fromAttendeeId: string,
  savedAttendeeId: string
): Promise<boolean> {
  const res = await fetch(`/api/rooms/${slug}/saved`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fromAttendeeId,
      savedAttendeeId,
      sessionToken: getGuestSession(slug),
    }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Failed to toggle saved");
  return json.saved;
}

export async function apiCreateGuest(
  slug: string,
  name: string
): Promise<{ attendeeId: string; sessionToken: string }> {
  const res = await fetch(`/api/rooms/${slug}/guest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Failed to join as guest");
  return json;
}

export async function apiLinkAttendees(): Promise<number> {
  const res = await fetch("/api/account/link-attendees", { method: "POST" });
  if (!res.ok) return 0;
  const json = await res.json();
  return json.linked ?? 0;
}
