import type {
  AttendeeRow,
  ConnectionRow,
  ProfileRow,
  RoomRow,
  SavedPersonRow,
} from "@/lib/supabase/types";
import type { Attendee, Connection, Profile, Room, SavedPerson } from "@/lib/types";

export function mapRoom(row: RoomRow): Room {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    organizerName: row.organizer_name ?? undefined,
    organizerId: row.organizer_id ?? undefined,
    description: row.description ?? undefined,
    status: row.status as Room["status"],
    isPublic: row.is_public,
    createdAt: row.created_at,
  };
}

export function mapProfile(row: ProfileRow): Profile {
  const accountType =
    row.account_type === "organizer" ? "organizer" : "attendee";
  return {
    id: row.id,
    username: row.username ?? undefined,
    displayName: row.display_name ?? undefined,
    avatarUrl: row.avatar_url ?? undefined,
    bio: row.bio ?? undefined,
    role: row.role ?? undefined,
    company: row.company ?? undefined,
    interests: row.interests ?? [],
    lookingFor: row.looking_for ?? undefined,
    canHelpWith: row.can_help_with ?? undefined,
    accountType,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapAttendee(row: AttendeeRow): Attendee {
  return {
    id: row.id,
    roomId: row.room_id,
    profileId: row.profile_id ?? undefined,
    username: row.username ?? undefined,
    claimedBy: row.claimed_by ?? undefined,
    sessionToken: row.session_token ?? undefined,
    name: row.name,
    email: row.email ?? undefined,
    role: row.role ?? undefined,
    company: row.company ?? undefined,
    interests: row.interests ?? [],
    lookingFor: row.looking_for ?? undefined,
    canHelpWith: row.can_help_with ?? undefined,
    cluster: row.cluster ?? undefined,
    avatarUrl: row.avatar_url ?? undefined,
    isGuest: row.is_guest,
    createdAt: row.created_at,
  };
}

export function mapConnection(row: ConnectionRow): Connection {
  return {
    id: row.id,
    roomId: row.room_id,
    fromAttendeeId: row.from_attendee_id,
    toAttendeeId: row.to_attendee_id,
    note: row.note ?? undefined,
    tags: row.tags ?? [],
    followUp: row.follow_up,
    createdAt: row.created_at,
  };
}

export function mapSaved(row: SavedPersonRow): SavedPerson {
  return {
    id: row.id,
    roomId: row.room_id,
    fromAttendeeId: row.from_attendee_id,
    savedAttendeeId: row.saved_attendee_id,
    createdAt: row.created_at,
  };
}
