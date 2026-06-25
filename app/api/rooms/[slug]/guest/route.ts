import { createAdminClient } from "@/lib/supabase/admin";
import { mapAttendee } from "@/lib/db/mappers";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const body = await request.json().catch(() => ({}));
  const name = (body.name as string)?.trim() || "Guest";

  const admin = createAdminClient();
  const { data: room } = await admin
    .from("rooms")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  const { data, error } = await admin
    .from("attendees")
    .insert({
      room_id: room.id,
      name,
      is_guest: true,
      interests: [],
      cluster: "Students",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const attendee = mapAttendee(data);
  return NextResponse.json({
    attendeeId: attendee.id,
    sessionToken: attendee.sessionToken,
  });
}
