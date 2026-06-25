import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { AttendeeRow, RoomRow } from "@/lib/supabase/types";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const body = await request.json();
  const { fromAttendeeId, savedAttendeeId, sessionToken } = body;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const admin = createAdminClient();

  const { data } = await admin
    .from("attendees")
    .select("*")
    .eq("id", fromAttendeeId)
    .maybeSingle();

  const from = data as AttendeeRow | null;
  if (!from) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const authorized =
    (user && (from.claimed_by === user.id || from.profile_id === user.id)) ||
    (sessionToken && from.session_token === sessionToken);

  if (!authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { data: roomData } = await admin.from("rooms").select("id").eq("slug", slug).maybeSingle();
  const room = roomData as Pick<RoomRow, "id"> | null;
  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

  const { data: existing } = await admin
    .from("saved_people")
    .select("id")
    .eq("from_attendee_id", fromAttendeeId)
    .eq("saved_attendee_id", savedAttendeeId)
    .maybeSingle();

  if (existing) {
    await admin.from("saved_people").delete().eq("id", existing.id);
    return NextResponse.json({ saved: false });
  }

  const { error } = await admin.from("saved_people").insert({
    room_id: room.id,
    from_attendee_id: fromAttendeeId,
    saved_attendee_id: savedAttendeeId,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ saved: true });
}
