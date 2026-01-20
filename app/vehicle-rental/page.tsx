// app/vehicle-rental/page.tsx
import VehicleRentalExplorer from "./vehiclerentalExplorer";

type VehicleRentalHomePageProps = {
  searchParams?: Promise<{
    category?: string | string[];
  }>;
};

export default async function VehicleRentalHomePage({
  searchParams,
}: VehicleRentalHomePageProps) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const initialCategory =
    typeof resolvedParams?.category === "string" ? resolvedParams.category : undefined;

  return <VehicleRentalExplorer initialCategory={initialCategory} />;
}