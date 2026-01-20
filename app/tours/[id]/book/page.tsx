import { notFound } from "next/navigation";
import Tour from "@/models/Tour";
import dbConnect from "@/lib/config/database";
import TourBookingFormClient from "../../TourBookingFormClient";
import type { TourDetailPayload } from "../../tourDetailClient";

async function fetchTour(id: string): Promise<TourDetailPayload | null> {
  await dbConnect();
  const tourDoc = await Tour.findById(id).lean();
  if (!tourDoc || !(tourDoc as any).isActive) return null;
  return JSON.parse(JSON.stringify(tourDoc)) as TourDetailPayload;
}

interface PageParams {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function TourBookingPage({ params, searchParams }: PageParams) {
  const { id } = await params;
  const query = await searchParams;
  const tour = await fetchTour(id);

  if (!tour) notFound();

  return <TourBookingFormClient tour={tour} searchParams={query} />;
}

