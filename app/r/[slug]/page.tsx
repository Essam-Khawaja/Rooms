import { RoomLobbyClient } from "@/components/room/RoomLobbyClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function RoomLobbyPage({ params }: PageProps) {
  const { slug } = await params;
  return <RoomLobbyClient slug={slug} />;
}
