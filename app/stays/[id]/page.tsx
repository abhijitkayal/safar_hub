//stays/[id]/page.tsx
import { notFound } from "next/navigation";
import Stay from "@/models/Stay";
import dbConnect from "@/lib/config/database";
import StayDetailClient, { type StayDetailPayload } from "../StayDetailClient";

async function fetchStay(id: string): Promise<StayDetailPayload | null> {
  await dbConnect();
  const stayDoc = await Stay.findById(id).lean();
  if (!stayDoc || !(stayDoc as any).isActive) return null;
  return JSON.parse(JSON.stringify(stayDoc)) as StayDetailPayload;
}

interface PageParams {
  params: Promise<{ id: string }>;
}

export default async function StayDetailPage({ params }: PageParams) {
  const { id } = await params;
  const stay = await fetchStay(id);
  if (!stay) notFound();

  return <StayDetailClient stay={stay} />;
}
