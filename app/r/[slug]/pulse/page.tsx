import { RoomPulseClient } from "@/components/organizer/RoomPulseClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function RoomPulsePage({ params }: PageProps) {
  const { slug } = await params;
  return <RoomPulseClient slug={slug} />;
}
