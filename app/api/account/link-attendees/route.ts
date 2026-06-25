import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();

  const username = profile?.username?.toLowerCase();
  const email = user.email?.toLowerCase();
  const linkedIds = new Set<string>();

  if (username) {
    const { data: byUsername } = await admin
      .from("attendees")
      .update({ profile_id: user.id } as Record<string, unknown>)
      .is("profile_id", null)
      .ilike("username", username)
      .select("id");

    (byUsername ?? []).forEach((row) => linkedIds.add(row.id));
  }

  if (email) {
    const { data: byEmail } = await admin
      .from("attendees")
      .update({ profile_id: user.id } as Record<string, unknown>)
      .is("profile_id", null)
      .ilike("email", email)
      .select("id");

    (byEmail ?? []).forEach((row) => linkedIds.add(row.id));
  }

  return NextResponse.json({ linked: linkedIds.size });
}
