import { notFound } from "next/navigation";
import Adventure from "@/models/Adventure";
import dbConnect from "@/lib/config/database";
import AdventureBookingFormClient from "../../AdventureBookingFormClient";
import type { AdventureDetailPayload } from "../../adventureDetailClient";

async function fetchAdventure(id: string): Promise<AdventureDetailPayload | null> {
  await dbConnect();
  const adventureDoc = await Adventure.findById(id).lean();
  if (!adventureDoc || !(adventureDoc as any).isActive) return null;
  return JSON.parse(JSON.stringify(adventureDoc)) as AdventureDetailPayload;
}

interface PageParams {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdventureBookingPage({ params, searchParams }: PageParams) {
  const { id } = await params;
  const query = await searchParams;
  const adventure = await fetchAdventure(id);

  if (!adventure) notFound();

  return <AdventureBookingFormClient adventure={adventure} searchParams={query} />;
}

