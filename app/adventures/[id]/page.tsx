// app/adventures/[id]/page.tsx
import { notFound } from "next/navigation";
import Adventure from "@/models/Adventure";
import dbConnect from "@/lib/config/database";
import AdventureDetailClient, { type AdventureDetailPayload } from "@/app/adventures/adventureDetailClient";

async function getAdventure(id: string): Promise<AdventureDetailPayload | null> {
  await dbConnect();
  const doc = await Adventure.findById(id).lean();
  if (!doc || !(doc as any).isActive) return null;
  return JSON.parse(JSON.stringify(doc)) as AdventureDetailPayload;
}

interface Params {
  params: Promise<{ id: string }>;
}

export default async function AdventureDetailPage({ params }: Params) {
  const { id } = await params;
  const adventure = await getAdventure(id);
  if (!adventure) notFound();
  return <AdventureDetailClient adventure={adventure} />;
}