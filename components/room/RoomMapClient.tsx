"use client";

import { apiCreateConnection, apiToggleSaved } from "@/lib/api";
import type { Attendee } from "@/lib/types";
import { useRoomData } from "@/lib/hooks/use-room-data";
import { useCurrentAttendeeId } from "@/lib/hooks/use-current-attendee";
import { useUser } from "@/lib/hooks/use-user";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { MeetingForm } from "@/components/room/MeetingForm";
import { MyMapButton } from "@/components/room/MyMapButton";
import { PersonSheet } from "@/components/room/PersonSheet";
import { RoomGraph } from "@/components/room/RoomGraph";
import { RoomHeader } from "@/components/room/RoomHeader";
import { SearchBar } from "@/components/room/SearchBar";
import { SearchOverlay } from "@/components/room/SearchOverlay";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface RoomMapClientProps {
  slug: string;
}

type SheetMode = "profile" | "meeting";

export function RoomMapClient({ slug }: RoomMapClientProps) {
  const router = useRouter();
  const { data: user } = useUser();
  const { data, isLoading, mutate } = useRoomData(slug);
  const currentUserId = useCurrentAttendeeId(slug);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchSession, setSearchSession] = useState(0);
  const [searchResultId, setSearchResultId] = useState<string | undefined>();
  const [sheetMode, setSheetMode] = useState<SheetMode>("profile");

  const isOrganizer = !!user && user.id === data?.room.organizerId;

  useEffect(() => {
    if (!isLoading && data && !currentUserId && !isOrganizer) {
      router.replace(`/r/${slug}`);
    }
  }, [isLoading, data, currentUserId, isOrganizer, slug, router]);

  const selectedAttendee = useMemo(
    () => data?.attendees.find((a) => a.id === selectedId) ?? null,
    [data, selectedId]
  );

  const existingConnection = useMemo(() => {
    if (!data || !currentUserId || !selectedId) return null;
    return data.connections.find(
      (c) => c.fromAttendeeId === currentUserId && c.toAttendeeId === selectedId
    );
  }, [data, currentUserId, selectedId]);

  const isSaved = useMemo(() => {
    if (!data || !currentUserId || !selectedId) return false;
    return data.saved.some(
      (s) => s.fromAttendeeId === currentUserId && s.savedAttendeeId === selectedId
    );
  }, [data, currentUserId, selectedId]);

  const handleSelect = (attendee: Attendee) => {
    setSelectedId(attendee.id);
    setSearchResultId(attendee.id);
    setSheetMode("profile");
  };

  const handleSaveMeeting = async (formData: {
    tags: string[];
    note: string;
    followUp: boolean;
  }) => {
    if (!currentUserId || !selectedId) return;
    await apiCreateConnection(slug, {
      fromAttendeeId: currentUserId,
      toAttendeeId: selectedId,
      tags: formData.tags,
      note: formData.note || undefined,
      followUp: formData.followUp || formData.tags.includes("Follow up"),
    });
    setSheetMode("profile");
    mutate();
  };

  const handleQuickMet = async () => {
    if (!currentUserId || !selectedId) return;
    await apiCreateConnection(slug, {
      fromAttendeeId: currentUserId,
      toAttendeeId: selectedId,
      tags: [],
      followUp: false,
    });
    mutate();
  };

  const handleSave = async () => {
    if (!currentUserId || !selectedId) return;
    await apiToggleSaved(slug, currentUserId, selectedId);
    mutate();
  };

  if (isLoading || !data) {
    return (
      <div className="flex h-dvh items-center justify-center text-text-muted">
        Loading room...
      </div>
    );
  }

  if (!currentUserId && !isOrganizer) {
    return (
      <div className="flex h-dvh items-center justify-center text-text-muted">
        Loading room...
      </div>
    );
  }

  const backHref = isOrganizer
    ? `/r/${slug}/pulse`
    : user
      ? "/dashboard"
      : "/";

  return (
    <div className="relative flex h-dvh flex-col bg-background">
      <RoomHeader
        slug={slug}
        title={data.room.name}
        showPulse={isOrganizer}
        backHref={backHref}
        badge={isOrganizer ? "Organizer view" : undefined}
      />

      <div className="absolute left-0 right-0 top-14 z-20 flex justify-center px-4">
        <div className="w-full max-w-xl">
          <SearchBar
            onClick={() => {
              setSearchSession((s) => s + 1);
              setSearchOpen(true);
            }}
          />
        </div>
      </div>

      <div className="flex-1 pt-16">
        <RoomGraph
          attendees={data.attendees}
          connections={data.connections}
          saved={data.saved}
          currentAttendeeId={currentUserId ?? undefined}
          searchResultId={searchResultId}
          onNodeClick={(id) => {
            setSelectedId(id);
            setSearchResultId(id);
            setSheetMode("profile");
          }}
        />
      </div>

      {currentUserId && (
        <div className="absolute bottom-6 left-4 z-20">
          <MyMapButton slug={slug} />
        </div>
      )}

      <SearchOverlay
        key={searchSession}
        open={searchOpen}
        attendees={data.attendees}
        onClose={() => setSearchOpen(false)}
        onSelect={handleSelect}
      />

      <BottomSheet
        open={!!selectedId}
        state={sheetMode === "meeting" ? "full" : "half"}
        onClose={() => {
          setSelectedId(null);
          setSheetMode("profile");
        }}
      >
        {sheetMode === "meeting" && selectedAttendee && !isOrganizer ? (
          <MeetingForm
            personName={selectedAttendee.name}
            initialTags={existingConnection?.tags}
            initialNote={existingConnection?.note}
            onBack={() => setSheetMode("profile")}
            onSave={handleSaveMeeting}
          />
        ) : (
          <PersonSheet
            attendee={selectedAttendee}
            isMet={!!existingConnection}
            isSaved={isSaved}
            isSelf={selectedId === currentUserId}
            readOnly={isOrganizer}
            onClose={() => setSelectedId(null)}
            onMet={() => {
              if (existingConnection) {
                setSheetMode("meeting");
              } else {
                handleQuickMet().then(() => setSheetMode("meeting"));
              }
            }}
            onSave={handleSave}
          />
        )}
      </BottomSheet>
    </div>
  );
}
