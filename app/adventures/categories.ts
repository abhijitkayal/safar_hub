export const ADVENTURE_CATEGORIES = [
  { label: "All", value: "all" },
  { label: "Trekking", value: "trekking" },
  { label: "Hiking", value: "hiking" },
  { label: "Camping", value: "camping" },
  { label: "Water Rafting", value: "water-rafting" },
] as const;

export type AdventureCategoryValue = (typeof ADVENTURE_CATEGORIES)[number]["value"];


