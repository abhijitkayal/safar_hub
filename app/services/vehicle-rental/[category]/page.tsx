import VehiclerentalExplorer from "../../../vehicle-rental/vehiclerentalExplorer";
import {
  VEHICLE_RENTAL_CATEGORIES,
  VEHICLE_RENTAL_SLUG_TO_VALUE,
} from "../../../vehicle-rental/categories";

const DEFAULT_CATEGORY = VEHICLE_RENTAL_CATEGORIES[0]?.value ?? "all";

export function generateStaticParams() {
  return VEHICLE_RENTAL_CATEGORIES.map((item) => ({ category: item.slug }));
}

export default async function ServicesVehicleRentalCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: slug } = await params;
  const category = VEHICLE_RENTAL_SLUG_TO_VALUE[slug] ?? DEFAULT_CATEGORY;
  return <VehiclerentalExplorer key={category} initialCategory={category} />;
}


