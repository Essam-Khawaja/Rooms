const SESSION_PREFIX = "rooms-session-";
const ATTENDEE_PREFIX = "rooms-attendee-";

export function getGuestSession(slug: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(`${SESSION_PREFIX}${slug}`);
}

export function setGuestSession(slug: string, token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${SESSION_PREFIX}${slug}`, token);
}

export function getCurrentAttendeeId(slug: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(`${ATTENDEE_PREFIX}${slug}`);
}

export function setCurrentAttendeeId(slug: string, attendeeId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${ATTENDEE_PREFIX}${slug}`, attendeeId);
}

export function clearRoomSession(slug: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(`${SESSION_PREFIX}${slug}`);
  localStorage.removeItem(`${ATTENDEE_PREFIX}${slug}`);
}
