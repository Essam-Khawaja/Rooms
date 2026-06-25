import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeUsername, validateUsername } from "@/lib/username";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = (body.email as string)?.trim().toLowerCase();
  const password = body.password as string;
  const displayName = (body.displayName as string)?.trim();
  const accountType = body.accountType === "organizer" ? "organizer" : "attendee";
  const normalizedUsername = normalizeUsername((body.username as string) ?? "");

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters." },
      { status: 400 }
    );
  }

  const usernameError = validateUsername(normalizedUsername);
  if (usernameError) {
    return NextResponse.json({ error: usernameError }, { status: 400 });
  }

  if (!displayName) {
    return NextResponse.json({ error: "Display name is required." }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("profiles")
    .select("id")
    .eq("username", normalizedUsername)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "That username is already taken. Try another." },
      { status: 409 }
    );
  }

  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      display_name: displayName,
      username: normalizedUsername,
      account_type: accountType,
    },
  });

  if (error) {
    const message =
      error.message.includes("already been registered") ||
      error.message.includes("already exists")
        ? "An account with this email already exists."
        : error.message;
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
