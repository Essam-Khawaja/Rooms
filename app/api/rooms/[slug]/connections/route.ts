import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { mapConnection } from "@/lib/db/mappers";
import type { AttendeeRow, ConnectionRow, RoomRow } from "@/lib/supabase/types";
import { NextResponse } from "next/server";

async function validateAttendee(
  admin: ReturnType<typeof createAdminClient>,
  attendeeId: string,
  sessionToken?: string | null,
  userId?: string | null
): Promise<AttendeeRow | null> {
  const { data } = await admin
    .from("attendees")
    .select("*")
    .eq("id", attendeeId)
    .maybeSingle();

  const attendee = data as AttendeeRow | null;
  if (!attendee) return null;

  if (userId && (attendee.claimed_by === userId || attendee.profile_id === userId)) {
    return attendee;
  }

  if (sessionToken && attendee.session_token === sessionToken) {
    return attendee;
  }

  return null;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const body = await request.json();
  const { fromAttendeeId, toAttendeeId, note, tags, followUp, sessionToken } = body;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const admin = createAdminClient();

  const { data: roomData } = await admin.from("rooms").select("id").eq("slug", slug).maybeSingle();
  const room = roomData as Pick<RoomRow, "id"> | null;
  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

  const from = await validateAttendee(admin, fromAttendeeId, sessionToken, user?.id);
  if (!from || from.room_id !== room.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { data: existingData } = await admin
    .from("connections")
    .select("*")
    .eq("from_attendee_id", fromAttendeeId)
    .eq("to_attendee_id", toAttendeeId)
    .maybeSingle();

  const existing = existingData as ConnectionRow | null;

  if (existing) {
    const { data: updated, error } = await admin
      .from("connections")
      .update({
        note: note ?? existing.note,
        tags: tags?.length ? tags : existing.tags,
        follow_up: followUp ?? existing.follow_up,
      })
      .eq("id", existing.id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ connection: mapConnection(updated as ConnectionRow) });
  }

  const { data: inserted, error } = await admin
    .from("connections")
    .insert({
      room_id: room.id,
      from_attendee_id: fromAttendeeId,
      to_attendee_id: toAttendeeId,
      note,
      tags: tags ?? [],
      follow_up: followUp ?? false,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ connection: mapConnection(inserted as ConnectionRow) });
}
