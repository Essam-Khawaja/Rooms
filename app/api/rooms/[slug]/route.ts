import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  mapAttendee,
  mapConnection,
  mapRoom,
  mapSaved,
} from "@/lib/db/mappers";
import type { AttendeeRow, ConnectionRow, RoomRow, SavedPersonRow } from "@/lib/supabase/types";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const sessionToken = request.headers.get("x-session-token");
  const attendeeIdHeader = request.headers.get("x-attendee-id");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const admin = createAdminClient();

  const { data: roomRow } = await admin
    .from("rooms")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!roomRow) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  const room = mapRoom(roomRow as RoomRow);

  const { data: attendeesRows } = await admin
    .from("attendees")
    .select("*")
    .eq("room_id", room.id);

  const attendees = ((attendeesRows ?? []) as AttendeeRow[]).map(mapAttendee);

  let currentAttendeeId: string | null = attendeeIdHeader;

  if (!currentAttendeeId && user) {
    const matched = attendees.find(
      (a) => a.claimedBy === user.id || a.profileId === user.id
    );
    currentAttendeeId = matched?.id ?? null;
  }

  if (!currentAttendeeId && sessionToken) {
    const matched = attendees.find((a) => a.sessionToken === sessionToken);
    currentAttendeeId = matched?.id ?? null;
  }

  let connections: ReturnType<typeof mapConnection>[] = [];
  let saved: ReturnType<typeof mapSaved>[] = [];

  if (currentAttendeeId) {
    const [connRes, savedRes] = await Promise.all([
      admin
        .from("connections")
        .select("*")
        .eq("room_id", room.id)
        .eq("from_attendee_id", currentAttendeeId),
      admin
        .from("saved_people")
        .select("*")
        .eq("room_id", room.id)
        .eq("from_attendee_id", currentAttendeeId),
    ]);
    connections = ((connRes.data ?? []) as ConnectionRow[]).map(mapConnection);
    saved = ((savedRes.data ?? []) as SavedPersonRow[]).map(mapSaved);
  }

  // Organizers see all connections for pulse graph on map (aggregate edges only in pulse page)
  if (user && room.organizerId === user.id) {
    const { data: allConn } = await admin
      .from("connections")
      .select("id, room_id, from_attendee_id, to_attendee_id, tags, follow_up, created_at")
      .eq("room_id", room.id);
    connections = ((allConn ?? []) as ConnectionRow[]).map((c) =>
      mapConnection({ ...c, note: null })
    );
  }

  return NextResponse.json({
    room,
    attendees,
    connections,
    saved,
  });
}
