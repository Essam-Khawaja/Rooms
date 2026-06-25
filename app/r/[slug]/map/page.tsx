import { RoomMapClient } from "@/components/room/RoomMapClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function RoomMapPage({ params }: PageProps) {
  const { slug } = await params;
  return <RoomMapClient slug={slug} />;
}
