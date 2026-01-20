//stays/categories.ts
export const STAY_CATEGORIES = [
  { label: "All", value: "all" },
  { label: "Rooms", value: "rooms" },
  { label: "Hotels", value: "hotels" },
  { label: "Homestays", value: "homestays" },
  { label: "BnBs", value: "bnbs" },
] as const;

export type StayCategoryValue = (typeof STAY_CATEGORIES)[number]["value"];

export type StayCategoryFilter = StayCategoryValue;

