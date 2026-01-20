import { notFound } from "next/navigation";
import Stay from "@/models/Stay";
import dbConnect from "@/lib/config/database";
import StayBookingFormClient from "../../StayBookingFormClient";
import type { StayDetailPayload } from "../../StayDetailClient";

async function fetchStay(id: string): Promise<StayDetailPayload | null> {
  await dbConnect();
  const stayDoc = await Stay.findById(id).lean();
  if (!stayDoc || !(stayDoc as any).isActive) return null;
  return JSON.parse(JSON.stringify(stayDoc)) as StayDetailPayload;
}

interface PageParams {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function StayBookingPage({ params, searchParams }: PageParams) {
  const { id } = await params;
  const query = await searchParams;
  const stay = await fetchStay(id);

  if (!stay) notFound();

  return <StayBookingFormClient stay={stay} searchParams={query} />;
}

