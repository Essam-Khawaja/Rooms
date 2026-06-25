"use client";

import { Logo } from "@/components/brand/Logo";
import { signOut } from "@/components/auth/SignInButton";
import { useProfile } from "@/lib/hooks/use-profile";
import { useUser } from "@/lib/hooks/use-user";
import { cn } from "@/lib/utils";
import { LayoutDashboard, LogOut, Plus, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const baseNavItems = [
  { href: "/dashboard", label: "Rooms", icon: LayoutDashboard },
  { href: "/profile", label: "Profile", icon: User },
];

const organizerNavItem = { href: "/create", label: "Create", icon: Plus };

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: user } = useUser();
  const { data: profile } = useProfile();

  const isOrganizer = profile?.accountType === "organizer";
  const navItems = isOrganizer
    ? [baseNavItems[0], organizerNavItem, baseNavItems[1]]
    : baseNavItems;

  return (
    <div className="flex min-h-dvh w-full bg-background">
        <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-surface-soft/50 lg:sticky lg:top-0 lg:flex lg:h-dvh xl:w-64">
          <div className="border-b border-border px-5 py-5">
            <Logo />
            {profile?.displayName && (
              <p className="mt-3 truncate text-sm font-medium text-text-main">
                {profile.displayName}
              </p>
            )}
            {profile?.username && (
              <p className="mt-1 truncate text-xs text-accent">@{profile.username}</p>
            )}
            {profile?.accountType && (
              <p className="mt-0.5 text-xs capitalize text-text-faint">
                {profile.accountType}
              </p>
            )}
          </div>

          <nav className="flex flex-1 flex-col gap-1 p-3">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
                    active
                      ? "bg-accent-soft text-accent"
                      : "text-text-muted hover:bg-surface hover:text-text-main"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>

          {user && (
            <div className="border-t border-border p-3">
              <button
                type="button"
                onClick={() => signOut()}
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm text-text-muted transition-colors hover:bg-surface hover:text-text-main"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          )}
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>

          <nav className="sticky bottom-0 flex border-t border-border bg-background/95 px-2 py-2 backdrop-blur-md lg:hidden">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-xs transition-colors",
                    active ? "text-accent" : "text-text-muted"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </Link>
              );
            })}
            {user && (
              <button
                type="button"
                onClick={() => signOut()}
                className="flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-xs text-text-muted"
              >
                <LogOut className="h-5 w-5" />
                Sign out
              </button>
            )}
          </nav>
        </div>
    </div>
  );
}

export function EventCard({
  room,
  href,
  badge,
}: {
  room: {
    slug: string;
    name: string;
    description?: string;
    organizerName?: string;
    status?: string;
  };
  href: string;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className="group relative flex aspect-square flex-col justify-between rounded-3xl border border-border bg-surface-soft p-5 transition-all hover:border-accent/40 hover:bg-surface hover:shadow-[0_0_32px_rgba(214,255,107,0.08)]"
    >
      <div className="flex items-start justify-between gap-2">
        {badge && (
          <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium uppercase tracking-wide text-accent">
            {badge}
          </span>
        )}
        {room.status && (
          <span className="ml-auto rounded-full bg-surface px-2 py-0.5 text-xs capitalize text-text-faint">
            {room.status}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-end gap-2">
        <h3 className="line-clamp-2 text-lg font-semibold leading-snug text-text-main transition-colors group-hover:text-accent lg:text-xl">
          {room.name}
        </h3>
        {room.description && (
          <p className="line-clamp-2 text-sm text-text-muted">{room.description}</p>
        )}
        {room.organizerName && (
          <p className="text-xs text-text-faint">by {room.organizerName}</p>
        )}
      </div>
    </Link>
  );
}

export function MetricStrip({
  metrics,
}: {
  metrics: { totalRooms: number; totalAttendees: number; totalConnections: number };
}) {
  const items = [
    { label: "Rooms", value: metrics.totalRooms },
    { label: "Attendees", value: metrics.totalAttendees },
    { label: "Connections", value: metrics.totalConnections },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map(({ label, value }) => (
        <div
          key={label}
          className="rounded-2xl border border-border bg-surface-soft px-4 py-4 text-center"
        >
          <p className="text-2xl font-semibold text-accent">{value}</p>
          <p className="mt-1 text-xs uppercase tracking-wide text-text-faint">{label}</p>
        </div>
      ))}
    </div>
  );
}
