import { MyMapClient } from "@/components/room/MyMapClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function MyMapPage({ params }: PageProps) {
  const { slug } = await params;
  return <MyMapClient slug={slug} />;
}
