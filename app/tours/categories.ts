export const TOUR_CATEGORIES = [
  { label: "All", value: "all" },
  { label: "Group Tours", value: "group-tours" },
  { label: "Tour Packages", value: "tour-packages" },
] as const;

export type TourCategoryValue = (typeof TOUR_CATEGORIES)[number]["value"];


