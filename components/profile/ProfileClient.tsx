"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Pill } from "@/components/ui/Pill";
import { updateProfile, uploadAvatar } from "@/lib/db";
import { useProfile } from "@/lib/hooks/use-profile";
import { useUser } from "@/lib/hooks/use-user";
import { SignInButton } from "@/components/auth/SignInButton";
import Image from "next/image";
import { useMemo, useRef, useState } from "react";

export function ProfileClient() {
  const { data: user } = useUser();
  const { data: profile, mutate } = useProfile();
  const fileRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<Record<string, unknown> | null>(null);
  const [interestInput, setInterestInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useMemo(() => {
    if (draft) return draft as FormState;
    if (!profile) {
      return {
        displayName: "",
        bio: "",
        role: "",
        company: "",
        lookingFor: "",
        canHelpWith: "",
        interests: [] as string[],
      };
    }
    return {
      displayName: profile.displayName ?? "",
      bio: profile.bio ?? "",
      role: profile.role ?? "",
      company: profile.company ?? "",
      lookingFor: profile.lookingFor ?? "",
      canHelpWith: profile.canHelpWith ?? "",
      interests: profile.interests ?? [],
    };
  }, [profile, draft]);

  const setForm = (updates: Partial<FormState>) => {
    setDraft((prev) => ({ ...(prev ?? form), ...updates }));
  };

  if (!user) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4">
        <p className="text-text-muted">Sign in to manage your Rooms profile.</p>
        <SignInButton redirectTo="/profile" />
      </div>
    );
  }

  const saveProfile = async (extra?: { avatarUrl?: string }) => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await updateProfile(user.id, {
        displayName: form.displayName || undefined,
        bio: form.bio || undefined,
        role: form.role || undefined,
        company: form.company || undefined,
        lookingFor: form.lookingFor || undefined,
        canHelpWith: form.canHelpWith || undefined,
        interests: form.interests,
        avatarUrl: extra?.avatarUrl ?? profile?.avatarUrl,
        accountType: profile?.accountType ?? "attendee",
      });
      setDraft(null);
      await mutate();
      setSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    await saveProfile();
  };

  const handleAvatar = async (file: File) => {
    try {
      const url = await uploadAvatar(user.id, file);
      await saveProfile({ avatarUrl: url });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to upload photo.");
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold text-text-main">Your profile</h1>
          <p className="text-sm text-text-muted">
            Your username is set at signup and links you in event attendee lists.
          </p>
        </div>

        <Card variant="soft" className="flex items-center gap-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-surface border border-border">
            {profile?.avatarUrl ? (
              <Image src={profile.avatarUrl} alt="" fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-accent">
                {(form.displayName || user.email)?.[0]?.toUpperCase() ?? "?"}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            {profile?.username && (
              <p className="text-sm font-medium text-accent">@{profile.username}</p>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleAvatar(f);
              }}
            />
            <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
              Change photo
            </Button>
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          {profile?.username ? (
            <Field label="Username">
              <Input value={`@${profile.username}`} disabled readOnly />
            </Field>
          ) : (
            <Card variant="soft" className="text-sm text-text-muted">
              No username on file. Usernames are set when you create an account.
            </Card>
          )}
          <Field label="Display name">
            <Input
              value={form.displayName}
              onChange={(e) => setForm({ displayName: e.target.value })}
            />
          </Field>
          <Field label="Bio">
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ bio: e.target.value })}
              rows={3}
              className="w-full rounded-xl border border-border bg-surface-soft px-4 py-3 text-[15px] text-text-main focus:border-accent/50 focus:outline-none"
            />
          </Field>
          <Field label="Role">
            <Input value={form.role} onChange={(e) => setForm({ role: e.target.value })} />
          </Field>
          <Field label="Company">
            <Input value={form.company} onChange={(e) => setForm({ company: e.target.value })} />
          </Field>
          <Field label="Looking for">
            <Input value={form.lookingFor} onChange={(e) => setForm({ lookingFor: e.target.value })} />
          </Field>
          <Field label="Can help with">
            <Input value={form.canHelpWith} onChange={(e) => setForm({ canHelpWith: e.target.value })} />
          </Field>
          <Field label="Interests">
            <div className="mb-2 flex flex-wrap gap-2">
              {form.interests.map((i: string) => (
                <Pill
                  key={i}
                  active
                  onClick={() =>
                    setForm({ interests: form.interests.filter((x: string) => x !== i) })
                  }
                >
                  {i}
                </Pill>
              ))}
            </div>
            <Input
              value={interestInput}
              onChange={(e) => setInterestInput(e.target.value)}
              placeholder="Add interest and press Enter"
              onKeyDown={(e) => {
                if (e.key === "Enter" && interestInput.trim()) {
                  setForm({ interests: [...form.interests, interestInput.trim()] });
                  setInterestInput("");
                }
              }}
            />
          </Field>
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}
        {success && <p className="text-sm text-accent">Profile saved.</p>}

        <Button size="lg" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save profile"}
        </Button>
      </div>
    </AppShell>
  );
}

type FormState = {
  displayName: string;
  bio: string;
  role: string;
  company: string;
  lookingFor: string;
  canHelpWith: string;
  interests: string[];
};

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-text-faint">
        {label}
      </label>
      {hint && <p className="mb-1 text-xs text-text-faint">{hint}</p>}
      {children}
    </div>
  );
}
