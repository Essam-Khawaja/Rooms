import {
  mapProfile,
  mapRoom,
} from "@/lib/db/mappers";
import { getCurrentAttendeeId, getGuestSession } from "@/lib/session";
import type {
  CreateAttendeeInput,
  DashboardData,
  Profile,
  RoomData,
  RoomMetrics,
} from "@/lib/types";
import { generateSlug } from "@/lib/utils";
import { normalizeUsername } from "@/lib/username";
import { createClient } from "@/lib/supabase/client";

export async function fetchRoomData(slug: string): Promise<RoomData | null> {
  const headers: Record<string, string> = {};
  const sessionToken = getGuestSession(slug);
  const attendeeId = getCurrentAttendeeId(slug);
  if (sessionToken) headers["x-session-token"] = sessionToken;
  if (attendeeId) headers["x-attendee-id"] = attendeeId;

  const res = await fetch(`/api/rooms/${slug}`, { headers });
  if (!res.ok) return null;
  return res.json();
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  return data ? mapProfile(data as Parameters<typeof mapProfile>[0]) : null;
}

export async function isUsernameAvailable(username: string): Promise<boolean> {
  const normalized = normalizeUsername(username);
  if (!normalized) return false;

  const supabase = createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", normalized)
    .maybeSingle();

  return !data;
}

export async function updateProfile(
  userId: string,
  updates: Partial<Profile>
): Promise<Profile | null> {
  const supabase = createClient();

  const payload: Record<string, unknown> = {};
  if (updates.displayName !== undefined) payload.display_name = updates.displayName;
  if (updates.bio !== undefined) payload.bio = updates.bio;
  if (updates.role !== undefined) payload.role = updates.role;
  if (updates.company !== undefined) payload.company = updates.company;
  if (updates.interests !== undefined) payload.interests = updates.interests;
  if (updates.lookingFor !== undefined) payload.looking_for = updates.lookingFor;
  if (updates.canHelpWith !== undefined) payload.can_help_with = updates.canHelpWith;
  if (updates.avatarUrl !== undefined) payload.avatar_url = updates.avatarUrl;

  const { data, error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", userId)
    .select()
    .maybeSingle();

  if (error) {
    if (error.code === "23505") {
      throw new Error("That username is already taken.");
    }
    throw error;
  }

  if (data) {
    return mapProfile(data as Parameters<typeof mapProfile>[0]);
  }

  const { data: inserted, error: insertError } = await supabase
    .from("profiles")
    .upsert({
      id: userId,
      account_type: updates.accountType ?? "attendee",
      ...payload,
    } as Record<string, unknown>)
    .select()
    .single();

  if (insertError) {
    if (insertError.code === "23505") {
      throw new Error("That username is already taken.");
    }
    throw insertError;
  }

  return mapProfile(inserted as Parameters<typeof mapProfile>[0]);
}

export async function fetchDashboard(userId: string): Promise<DashboardData> {
  const supabase = createClient();

  const [organizingRes, attendingRes] = await Promise.all([
    supabase.from("rooms").select("*").eq("organizer_id", userId).order("created_at", { ascending: false }),
    supabase
      .from("attendees")
      .select("id, room_id, rooms(*)")
      .or(`claimed_by.eq.${userId},profile_id.eq.${userId}`),
  ]);

  const organizing = (organizingRes.data ?? []).map((r) =>
    mapRoom(r as Parameters<typeof mapRoom>[0])
  );
  const attending = (attendingRes.data ?? []) as unknown as Array<{
    id: string;
    rooms: Parameters<typeof mapRoom>[0] | null;
  }>;
  const attendingRooms = attending
    .filter((row) => row.rooms)
    .map((row) => ({
      ...mapRoom(row.rooms!),
      attendeeId: row.id,
    }));

  let organizerMetrics: DashboardData["organizerMetrics"];
  if (organizing.length > 0) {
    const roomIds = organizing.map((r) => r.id);
    const [attendeesRes, connectionsRes] = await Promise.all([
      supabase
        .from("attendees")
        .select("id", { count: "exact", head: true })
        .in("room_id", roomIds),
      supabase
        .from("connections")
        .select("id", { count: "exact", head: true })
        .in("room_id", roomIds),
    ]);

    organizerMetrics = {
      totalRooms: organizing.length,
      totalAttendees: attendeesRes.count ?? 0,
      totalConnections: connectionsRes.count ?? 0,
    };
  }

  return { organizing, attending: attendingRooms, organizerMetrics };
}

export async function fetchRoomMetrics(slug: string): Promise<RoomMetrics | null> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_room_metrics", {
    room_slug: slug,
  });

  if (error || !data) return null;
  return data as unknown as RoomMetrics;
}

export async function createRoomInDb(input: {
  name: string;
  organizerId: string;
  organizerName: string;
  description?: string;
  attendees: CreateAttendeeInput[];
}): Promise<{ slug: string; id: string }> {
  const supabase = createClient();
  const slug = generateSlug(input.name);

  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .insert({
      slug,
      name: input.name,
      organizer_id: input.organizerId,
      organizer_name: input.organizerName,
      description: input.description,
      is_public: true,
      status: "live",
    } as Record<string, unknown>)
    .select()
    .single();

  if (roomError || !room) throw roomError ?? new Error("Failed to create room");

  const roomRow = room as { id: string; slug: string };

  const usernames = input.attendees
    .map((a) => a.username?.toLowerCase())
    .filter(Boolean) as string[];

  const profileMap = new Map<string, { id: string; avatar_url: string | null }>();
  if (usernames.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username, avatar_url")
      .in("username", usernames);
    (profiles ?? []).forEach((p) => {
      if (p.username) profileMap.set(p.username.toLowerCase(), p);
    });
  }

  const attendeeRows = input.attendees.map((a) => {
    const linked = a.username ? profileMap.get(a.username.toLowerCase()) : undefined;
    return {
      room_id: roomRow.id,
      name: a.name,
      email: a.email,
      role: a.role,
      company: a.company,
      interests: a.interests,
      looking_for: a.lookingFor,
      can_help_with: a.canHelpWith,
      cluster: a.cluster,
      username: a.username,
      profile_id: linked?.id ?? a.profileId,
      avatar_url: linked?.avatar_url ?? a.avatarUrl,
      is_guest: false,
    };
  });

  const { error: attError } = await supabase.from("attendees").insert(attendeeRows);
  if (attError) throw attError;

  return { slug: roomRow.slug, id: roomRow.id };
}

export async function claimAttendee(
  attendeeId: string,
  profileId: string
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("attendees")
    .update({ claimed_by: profileId } as Record<string, unknown>)
    .eq("id", attendeeId);
  if (error) throw error;
}

export async function findAttendeeByProfile(
  slug: string,
  profileId: string,
  username?: string
): Promise<string | null> {
  const supabase = createClient();
  const { data: room } = await supabase
    .from("rooms")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (!room) return null;

  const { data: byProfile } = await supabase
    .from("attendees")
    .select("id")
    .eq("room_id", room.id)
    .or(`profile_id.eq.${profileId},claimed_by.eq.${profileId}`)
    .maybeSingle();

  if (byProfile) return byProfile.id;

  if (username) {
    const { data: byUsername } = await supabase
      .from("attendees")
      .select("id")
      .eq("room_id", room.id)
      .ilike("username", username)
      .maybeSingle();
    if (byUsername) return byUsername.id;
  }

  return null;
}

export async function uploadAvatar(
  userId: string,
  file: File
): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${userId}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return data.publicUrl;
}

export function subscribeToRoom(
  roomId: string,
  onChange: () => void
): () => void {
  const supabase = createClient();
  const channel = supabase
    .channel(`room-${roomId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "connections", filter: `room_id=eq.${roomId}` },
      () => onChange()
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "attendees", filter: `room_id=eq.${roomId}` },
      () => onChange()
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
