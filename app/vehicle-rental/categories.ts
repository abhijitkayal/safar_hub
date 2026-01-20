export const VEHICLE_RENTAL_CATEGORIES = [
  { label: "All", value: "all", slug: "all" },
  { label: "Cars", value: "cars-rental", slug: "cars" },
  { label: "Bikes", value: "bikes-rentals", slug: "bikes" },
  { label: "Car With Driver", value: "car-with-driver", slug: "car-with-driver" },
] as const;

export type VehicleRentalCategoryValue = (typeof VEHICLE_RENTAL_CATEGORIES)[number]["value"];
export type VehicleRentalCategorySlug = (typeof VEHICLE_RENTAL_CATEGORIES)[number]["slug"];

export const VEHICLE_RENTAL_SLUG_TO_VALUE: Record<string, VehicleRentalCategoryValue> =
  VEHICLE_RENTAL_CATEGORIES.reduce(
    (acc, item) => {
      acc[item.slug] = item.value;
      return acc;
    },
    {} as Record<string, VehicleRentalCategoryValue>
  );

export const VEHICLE_RENTAL_VALUE_TO_SLUG: Record<
  VehicleRentalCategoryValue,
  VehicleRentalCategorySlug
> = VEHICLE_RENTAL_CATEGORIES.reduce(
  (acc, item) => {
    acc[item.value] = item.slug;
    return acc;
  },
  {} as Record<VehicleRentalCategoryValue, VehicleRentalCategorySlug>
);


