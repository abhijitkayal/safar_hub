//adventures/details/[id]/page.tsx
import mongoose from "mongoose";
import { notFound } from "next/navigation";
import dbConnect from "@/lib/config/database";
import Adventure from "@/models/Adventure";
import AdventureDetailClient, { type AdventureDetailPayload } from "@/app/adventures/adventureDetailClient";

async function getAdventure(id: string) {
  // ✅ Guard: only allow Mongo ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }

  await dbConnect();

  const doc = await Adventure.findById(id).lean();
  if (!doc || !(doc as any).isActive) return null;

  return JSON.parse(JSON.stringify(doc));
}

export default async function AdventureDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const adventure = await getAdventure(id);

  if (!adventure) {
    notFound();
  }

  return (
     <AdventureDetailClient adventure={adventure} />
  );
}
