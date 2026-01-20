// app/vehicle-rental/[id]/page.tsx
import { notFound } from "next/navigation";
import VehicleRental from "@/models/VehicleRental";
import dbConnect from "@/lib/config/database";
import VehicleRentalDetailClient, {
  type VehicleRentalDetailPayload,
} from "../vehiclerentalDetailsClient";

async function fetchRental(id: string): Promise<VehicleRentalDetailPayload | null> {
  await dbConnect();
  const doc = await VehicleRental.findById(id).lean();
  if (!doc || !(doc as any).isActive) return null;
  return JSON.parse(JSON.stringify(doc)) as VehicleRentalDetailPayload;
}

interface PageParams {
  params: Promise<{ id: string }>;
}

export default async function VehicleRentalDetailPage({ params }: PageParams) {
  const { id } = await params;
  const rental = await fetchRental(id);
  if (!rental) notFound();
  return <VehicleRentalDetailClient rental={rental} />;
}
