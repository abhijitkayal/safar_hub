import { notFound } from "next/navigation";
import VehicleRental from "@/models/VehicleRental";
import dbConnect from "@/lib/config/database";
import VehicleRentalBookingFormClient from "../../VehicleRentalBookingFormClient";
import type { VehicleRentalDetailPayload } from "../../vehiclerentalDetailsClient";

async function fetchVehicleRental(id: string): Promise<VehicleRentalDetailPayload | null> {
  await dbConnect();
  const rentalDoc = await VehicleRental.findById(id).lean();
  if (!rentalDoc || !(rentalDoc as any).isActive) return null;
  return JSON.parse(JSON.stringify(rentalDoc)) as VehicleRentalDetailPayload;
}

interface PageParams {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function VehicleRentalBookingPage({ params, searchParams }: PageParams) {
  const { id } = await params;
  const query = await searchParams;
  const rental = await fetchVehicleRental(id);

  if (!rental) notFound();

  return <VehicleRentalBookingFormClient rental={rental} searchParams={query} />;
}

