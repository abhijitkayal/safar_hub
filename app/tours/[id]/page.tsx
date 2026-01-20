// tours/[id]/page.tsx
import { notFound } from "next/navigation";
import Tour from "@/models/Tour";
import dbConnect from "@/lib/config/database";
import TourDetailClient, { type TourDetailPayload } from "../tourDetailClient";

export const revalidate = 0;
export const dynamic = "force-dynamic";

async function fetchTour(id: string): Promise<TourDetailPayload | null> {
  await dbConnect();
  const tourDoc = await Tour.findById(id).lean();
  if (!tourDoc || !(tourDoc as any).isActive) return null;
  return JSON.parse(JSON.stringify(tourDoc)) as TourDetailPayload;
}

interface PageParams {
  params: Promise<{ id: string }>;
}

export default async function TourDetailPage({ params }: PageParams) {
  const { id } = await params;
  const tour = await fetchTour(id);
  if (!tour) notFound();

  return <TourDetailClient tour={tour} />;
}