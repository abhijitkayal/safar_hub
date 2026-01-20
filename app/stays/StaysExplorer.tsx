// StaysExplorer.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  FaBath,
  FaBolt,
  FaCoffee,
  FaDumbbell,
  FaMapMarkerAlt,
  FaParking,
  FaSearch,
  FaSnowflake,
  FaStar,
  FaSwimmingPool,
  FaUsers,
  FaWifi,
  FaUtensils,
  FaCheckCircle,
  FaBed,
  FaRupeeSign,
  FaShoppingCart,
} from "react-icons/fa";
import { STAY_CATEGORIES, type StayCategoryValue } from "./categories";
import { useAvailability } from "../hooks/useAvailability";
import CategoryTabs from "@/app/components/common/CategoryTabs";
import { useCart } from "../hooks/useCart";
import { toast } from "react-hot-toast";

export type Room = {
  _id?: string;
  name: string;
  bedType: string;
  beds: number;
  capacity: number;
  price: number;
  taxes?: number;
  amenities?: string[];
  size?: string;
  features: string[];
  images: string[];
};

export type Stay = {
  _id: string;
  name: string;
  category: "rooms" | "hotels" | "homestays" | "bnbs";
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
  };
  images: string[];
  heroHighlights: string[];
  curatedHighlights?: Array<{ title: string; description?: string; icon?: string }>;
  popularFacilities: string[];
  rooms: Room[];
  bnb?: {
    unitType: string;
    bedrooms: number;
    bathrooms: number;
    kitchenAvailable: boolean;
    beds: number;
    capacity: number;
    features: string[];
    price: number;
  };
  amenities: Record<string, string[]>;
  rating?: { average: number; count: number };
  tags?: string[];
};

type CategoryValue = StayCategoryValue;

type StaysExplorerProps = {
  initialCategory?: string;
};

type StayCardProps = {
  stay: Stay;
  onSelectTag?: (tag: string) => void;
  checkIn?: string;
  checkOut?: string;
  isInCart?: boolean;
  onAddToCart?: (event: React.MouseEvent) => void;
};

const facilityIconLookup = [
  { keywords: ["wifi", "internet"], icon: <FaWifi className="text-green-600" /> },
  { keywords: ["breakfast", "dining", "restaurant"], icon: <FaCoffee className="text-amber-500" /> },
  { keywords: ["parking", "garage"], icon: <FaParking className="text-blue-500" /> },
  { keywords: ["pool", "swim"], icon: <FaSwimmingPool className="text-cyan-500" /> },
  { keywords: ["ac", "air", "climate"], icon: <FaSnowflake className="text-sky-500" /> },
  { keywords: ["gym", "fitness"], icon: <FaDumbbell className="text-purple-500" /> },
  { keywords: ["spa", "bath"], icon: <FaBath className="text-rose-500" /> },
  { keywords: ["power", "generator"], icon: <FaBolt className="text-yellow-500" /> },
  { keywords: ["dining", "food"], icon: <FaUtensils className="text-orange-500" /> },
];

const getFacilityIcon = (label: string) => {
  const normalized = label?.toLowerCase() || "";
  const match = facilityIconLookup.find((item) =>
    item.keywords.some((keyword) => normalized.includes(keyword))
  );
  return match?.icon ?? <FaCheckCircle className="text-green-500" />;
};

export const StayCard = ({
  stay,
  onSelectTag,
  checkIn,
  checkOut,
  isInCart,
  onAddToCart,
}: StayCardProps) => {
  const isBnb = stay.category === "bnbs" && Boolean(stay.bnb);
  const roomCount = stay.rooms?.length ?? 0;
  const startingPriceValue = isBnb
    ? stay.bnb?.price ?? null
    : roomCount
      ? Math.min(...stay.rooms.map((room) => room.price))
      : null;
  const startingPrice = startingPriceValue != null ? startingPriceValue.toLocaleString() : null;
  const heroHighlights =
    (stay.heroHighlights && stay.heroHighlights.length
      ? stay.heroHighlights
      : stay.popularFacilities && stay.popularFacilities.length
        ? stay.popularFacilities
        : []
    ).slice(0, 3);
  const primaryFeatures = isBnb
    ? stay.bnb?.features?.slice(0, 4) ?? []
    : stay.rooms?.[0]?.features?.slice(0, 4) ?? [];
  const ratingValue = stay.rating?.count ? stay.rating.average : null;
  const tags = stay.tags ?? [];
  const hasDates = Boolean(checkIn && checkOut);
  const availability = useAvailability("stay", stay._id, checkIn, checkOut);
  const availableRoomKeys = availability.availableOptionKeys ?? [];
  const soldOutForDates = hasDates && !availability.loading && roomCount > 0 && availableRoomKeys.length === 0;

  return (
    <Link
      href={`/stays/${stay._id}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-white/40 bg-white/95 shadow-xl backdrop-blur-sm transition hover:-translate-y-2 hover:shadow-2xl"
    >
      <div className="relative h-56 w-full">

        {stay.images && stay.images.length ? (
          <Image
            src={stay.images[0]}
            alt={stay.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-500">
            No image
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-green-900/60 via-transparent to-transparent" />
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase text-green-700 shadow">
          {stay.category}
        </span>
        {hasDates && (
          <span
            className={`absolute left-4 top-16 rounded-full px-3 py-1 text-xs font-semibold shadow ${soldOutForDates ? "bg-rose-100 text-rose-700" : "bg-green-100 text-green-700"
              }`}
          >
            {soldOutForDates ? "Sold for selected dates" : "Available for selected dates"}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6 text-gray-900">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{stay.name}</h3>
            <p className="mt-1 flex items-center text-sm text-gray-600">
              <FaMapMarkerAlt className="mr-2 text-green-600" />
              {stay.location.city}, {stay.location.state}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={onAddToCart}
              className={`inline-flex items-center justify-center rounded-full p-2 shadow transition-colors ${isInCart
                  ? "bg-green-600 text-green-50 hover:bg-green-700"
                  : "bg-green-50 text-green-600 hover:bg-green-100"
                }`}
              title={isInCart ? "In Cart" : "Add to Cart"}
            >
              <FaShoppingCart className="text-sm" />
            </button>
            {ratingValue !== null && (
              <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                <FaStar className="text-yellow-500" /> {ratingValue.toFixed(1)}
              </span>
            )}
          </div>
        </div>

        {heroHighlights.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {heroHighlights.map((highlight) => (
              <span
                key={highlight}
                className="rounded-full bg-green-50/80 px-3 py-1 text-xs font-medium text-green-700"
              >
                {highlight}
              </span>
            ))}
          </div>
        )}

        {!!primaryFeatures.length && (
          <div className="rounded-2xl border border-green-50 bg-green-50/60 px-4 py-3 text-xs text-gray-700 shadow-inner">
            <span className="font-semibold text-gray-900">Room features:</span>{" "}
            {primaryFeatures.join(", ")}
          </div>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 text-xs">
            {tags.slice(0, 3).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onSelectTag?.(tag);
                }}
                className="rounded-full border border-green-200/70 bg-white px-3 py-1 text-green-700 shadow-sm transition hover:border-green-400 hover:bg-green-50"
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {(stay.popularFacilities?.length || stay.heroHighlights?.length) ? (
          <div className="flex flex-wrap gap-2">
            {(stay.popularFacilities?.length ? stay.popularFacilities : stay.heroHighlights || [])
              .slice(0, 4)
              .map((facility) => (
                <span
                  key={facility}
                  className="inline-flex items-center gap-2 rounded-2xl border border-green-100 bg-white/80 px-3 py-2 text-xs text-gray-700 shadow-sm"
                >
                  {getFacilityIcon(facility)}
                  <span className="font-medium capitalize">{facility}</span>
                </span>
              ))}
          </div>
        ) : null}

        <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-3 text-sm">
          {isBnb ? (
            <div className="flex flex-1 flex-wrap gap-3 text-xs text-gray-600">
              <div className="flex min-w-[120px] flex-1 items-center gap-2 rounded-2xl bg-green-50/80 px-3 py-2">
                <FaBed className="text-green-600" />
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-green-700">Bedrooms</p>
                  <p className="text-sm font-semibold text-gray-900">{stay.bnb?.bedrooms ?? "-"}</p>
                </div>
              </div>
              <div className="flex min-w-[120px] flex-1 items-center gap-2 rounded-2xl bg-green-50/80 px-3 py-2">
                <FaUsers className="text-green-600" />
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-green-700">Guests</p>
                  <p className="text-sm font-semibold text-gray-900">{stay.bnb?.capacity ?? "-"}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 flex-wrap gap-3 text-xs text-gray-600">
              <div className="flex flex-1 min-w-[120px] items-center gap-2 rounded-2xl bg-green-50/80 px-3 py-2">
                <FaBed className="text-green-600" />
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-green-700">Rooms</p>
                  <p className="text-sm font-semibold text-gray-900">{roomCount}</p>
                </div>
              </div>
              <div className="flex flex-1 min-w-[120px] items-center gap-2 rounded-2xl bg-green-50/80 px-3 py-2">
                <FaUsers className="text-green-600" />
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-green-700">Max guests</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {stay.rooms?.[0]?.capacity ?? guestsFallback(stay)}
                  </p>
                </div>
              </div>
            </div>
          )}
          <div className="text-right">
            {startingPrice ? (
              <>
                <p className="text-[11px] uppercase tracking-wide text-gray-500">Starting at</p>
                <p className="text-lg font-semibold text-green-700">₹{startingPrice}</p>
                <p className="text-[11px] text-gray-400">per night</p>
              </>
            ) : (
              <p className="text-xs text-gray-500">Pricing on request</p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

const getStayMinPriceValue = (stay: Stay) => {
  if (stay.category === "bnbs" && stay.bnb) return stay.bnb.price ?? null;
  return stay.rooms?.length ? Math.min(...stay.rooms.map((room) => room.price)) : null;
};

const guestsFallback = (stay: Stay) =>
  stay.category === "bnbs" && stay.bnb
    ? stay.bnb.capacity || 2
    : stay.rooms?.reduce((max, room) => Math.max(max, room.capacity), 0) ?? 2;

const canHostGuests = (stay: Stay, guests: number) => {
  if (!guests) return true;
  if (stay.category === "bnbs" && stay.bnb) {
    return (stay.bnb.capacity ?? 0) >= guests;
  }
  return stay.rooms?.some((room) => room.capacity >= guests) ?? false;
};

export default function StaysExplorer({ initialCategory = "all" }: StaysExplorerProps) {
  const params = useSearchParams();
  const router = useRouter();
  const categoryFromUrl = params.get("category") || initialCategory;
  const normalizedInitialCategory: CategoryValue = STAY_CATEGORIES.some(
    (tab) => tab.value === categoryFromUrl
  )
    ? (categoryFromUrl as CategoryValue)
    : "all";

  const { items: cartItems, addToCart, removeFromCart } = useCart({ autoLoad: true });

  const [stays, setStays] = useState<Stay[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<CategoryValue>(normalizedInitialCategory);
  const [searchTerm, setSearchTerm] = useState("");
  const [guests, setGuests] = useState(2);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [priceMin, setPriceMin] = useState<number | "">("");
  const [priceMax, setPriceMax] = useState<number | "">("");
  const [ratingFilter, setRatingFilter] = useState<number | "">("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const allSuggestions = useMemo(() => {
    const set = new Set<string>();
    stays.forEach(s => {
      if (s.name) set.add(s.name);
      if (s.location?.city) set.add(s.location.city);
      if (s.location?.state) set.add(s.location.state);
    });
    return Array.from(set);
  }, [stays]);

  // NEW: Sorting state
  const [sortBy, setSortBy] = useState<
    "rating-desc" | "price-asc" | "price-desc" | "location-asc"
  >("rating-desc");


  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    stays.forEach((stay) => {
      (stay.tags || []).forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
  }, [stays]);

  useEffect(() => {
    const loadStays = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = new URL("/api/stays", window.location.origin);
        const categoryParam = normalizedInitialCategory !== "all" ? normalizedInitialCategory : undefined;
        const cityParam = params.get("city") || undefined;
        const guestsParam = params.get("guests") || undefined;
        if (categoryParam) url.searchParams.set("category", categoryParam);
        if (cityParam) url.searchParams.set("city", cityParam);
        if (guestsParam) url.searchParams.set("guests", guestsParam);
        const res = await fetch(url.toString(), { cache: "no-store" });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data?.message || "Failed to load stays");
        }
        setStays(data.stays || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unable to load stays right now";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadStays();
  }, [normalizedInitialCategory, params]);

  useEffect(() => {
    setActiveCategory(normalizedInitialCategory);
  }, [normalizedInitialCategory]);

  useEffect(() => {
    const city = params.get("city") || "";
    const g = params.get("guests");
    const ci = params.get("checkIn") || "";
    const co = params.get("checkOut") || "";
    setSearchTerm(city);
    setGuests(g ? Number(g) || 2 : 2);
    setCheckIn(ci);
    setCheckOut(co);
  }, [params]);

  const priceBounds = useMemo(() => {
    if (!stays.length) return { min: 0, max: 0 };
    const prices = stays
      .map((stay) => getStayMinPriceValue(stay))
      .filter((price): price is number => typeof price === "number" && !Number.isNaN(price));
    if (!prices.length) return { min: 0, max: 0 };
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [stays]);

  useEffect(() => {
    if (priceBounds.min === 0 && priceBounds.max === 0) {
      setPriceMin("");
      setPriceMax("");
      return;
    }
    setPriceMin(priceBounds.min);
    setPriceMax(priceBounds.max);
  }, [priceBounds.min, priceBounds.max]);

  // COMBINED: Sorting + Filtering
  const sortedAndFilteredStays = useMemo(() => {
    const result = [...stays];

    // ─── SORTING ───
    result.sort((a, b) => {
      switch (sortBy) {
        case "rating-desc": {
          const ratingA = a.rating?.average ?? 0;
          const ratingB = b.rating?.average ?? 0;
          if (ratingB !== ratingA) return ratingB - ratingA;
          return (b.rating?.count ?? 0) - (a.rating?.count ?? 0);
        }
        case "price-asc": {
          const priceA = getStayMinPriceValue(a);
          const priceB = getStayMinPriceValue(b);
          return (priceA ?? Infinity) - (priceB ?? Infinity);
        }
        case "price-desc": {
          const priceA = getStayMinPriceValue(a);
          const priceB = getStayMinPriceValue(b);
          return (priceB ?? -Infinity) - (priceA ?? -Infinity);
        }
        case "location-asc": {
          const locA = `${a.location.city}, ${a.location.state}`.toLowerCase();
          const locB = `${b.location.city}, ${b.location.state}`.toLowerCase();
          return locA.localeCompare(locB);
        }
        default:
          return 0;
      }
    });

    // ─── FILTERING ───
    return result.filter((stay) => {
      if (activeCategory !== "all" && stay.category !== activeCategory) return false;

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesName = stay.name.toLowerCase().includes(term);
        const matchesCity = stay.location.city.toLowerCase().includes(term);
        const matchesHighlights = stay.heroHighlights?.some((h) => h.toLowerCase().includes(term));
        if (!matchesName && !matchesCity && !matchesHighlights) return false;
      }

      if (guests && !canHostGuests(stay, guests)) {
        return false;
      }

      const minStayPrice = getStayMinPriceValue(stay);

      if (priceMin !== "" && typeof minStayPrice === "number" && minStayPrice < priceMin) return false;
      if (priceMax !== "" && typeof minStayPrice === "number" && minStayPrice > priceMax) return false;

      if (ratingFilter !== "" && typeof stay.rating?.average === "number") {
        if ((stay.rating?.count ?? 0) === 0 || stay.rating.average < ratingFilter) return false;
      }

      if (selectedTags.length) {
        const stayTags = stay.tags || [];
        if (!selectedTags.every((tag) => stayTags.includes(tag))) return false;
      }

      return true;
    });
  }, [
    stays,
    activeCategory,
    searchTerm,
    guests,
    priceMin,
    priceMax,
    ratingFilter,
    selectedTags,
    sortBy,
  ]);

  const handleCategoryChange = useCallback(
    (value: CategoryValue) => {
      setActiveCategory(value);
      const nextSearch = new URLSearchParams(params.toString());
      if (value === "all") {
        nextSearch.delete("category");
      } else {
        nextSearch.set("category", value);
      }
      const queryString = nextSearch.toString();
      router.replace(queryString ? `/stays?${queryString}` : "/stays", { scroll: false });
    },
    [params, router]
  );

  return (
    <div className="min-h-screen bg-sky-50 text-black">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-br from-green-600 via-green-500 to-lime-400 py-16 text-white">

        <div className="relative mx-auto max-w-7xl px-6 lg:px-2 mt-5">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold sm:text-4xl">Find your perfect Stay</h1>
            <p className="mt-3 text-base text-white/80">
              Explore handpicked rooms, hotels, homestays, and cosy BnBs with verified amenities and
              detailed room insights—just like your favourite booking websites.
            </p>
          </div>

          <div className="mt-8 rounded-2xl bg-white p-6 shadow-xl">
            <form
              className="grid grid-cols-1 gap-4 text-gray-900 sm:grid-cols-2 lg:grid-cols-4"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="col-span-1 relative"
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) {
                    setShowSuggestions(false);
                  }
                }}
              >
                <label className="mb-1 block text-sm font-semibold text-gray-700">Destination</label>
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 focus-within:border-green-500 relative z-10">
                  <FaSearch className="text-gray-500" />
                  <input
                    type="text"
                    placeholder="City, hotel name, highlight"
                    value={searchTerm}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSearchTerm(val);
                      if (val.trim()) {
                        const lower = val.toLowerCase();
                        const filtered = allSuggestions.filter((s) => s.toLowerCase().includes(lower)).slice(0, 5);
                        setSuggestions(filtered);
                        setShowSuggestions(true);
                      } else {
                        setShowSuggestions(false);
                      }
                    }}
                    onFocus={() => {
                      if (searchTerm.trim()) setShowSuggestions(true);
                    }}
                    className="w-full bg-transparent text-gray-900 outline-none placeholder:text-gray-500"
                    autoComplete="off"
                  />
                </div>
                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <ul className="absolute left-0 top-full mt-1 w-full rounded-xl border border-gray-100 bg-white py-2 shadow-lg ring-1 ring-black/5 z-20 overflow-hidden">
                    {suggestions.map((suggestion, idx) => (
                      <li
                        key={idx}
                        className="cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setSearchTerm(suggestion);
                          setShowSuggestions(false);
                        }}
                      >
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="col-span-1">
                <label className="mb-1 block text-sm font-semibold text-gray-700">Check-in</label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-900 focus:border-green-500 focus:outline-none"
                />
              </div>

              <div className="col-span-1">
                <label className="mb-1 block text-sm font-semibold text-gray-700">Check-out</label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-900 focus:border-green-500 focus:outline-none"
                />
              </div>

              <div className="col-span-1">
                <label className="mb-1 block text-sm font-semibold text-gray-700">Guests</label>
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 focus-within:border-green-500">
                  <FaUsers className="text-gray-500" />
                  <input
                    type="number"
                    min={1}
                    value={guests}
                    onChange={(e) => setGuests(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-transparent text-gray-900 outline-none"
                  />
                </div>
              </div>
            </form>
            <div className="mt-4">
              <button
                className="rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-700"
                type="button"
                onClick={() => {
                  const url = new URL("/stays", window.location.origin);
                  if (searchTerm) url.searchParams.set("city", searchTerm);
                  if (guests) url.searchParams.set("guests", String(guests));
                  if (checkIn) url.searchParams.set("checkIn", checkIn);
                  if (checkOut) url.searchParams.set("checkOut", checkOut);
                  if (activeCategory && activeCategory !== "all") {
                    url.searchParams.set("category", activeCategory);
                  }
                  router.push(`${url.pathname}?${url.searchParams.toString()}`);
                }}
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-2">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Curated stays just for you</h2>
            <p className="text-sm text-gray-600">
              Browse by category or use filters to narrow down the perfect match for your trip.
            </p>
          </div>

          <CategoryTabs
            categories={STAY_CATEGORIES}
            activeValue={activeCategory}
            onChange={handleCategoryChange}
            accent="green"
            scrollable={false}
            className="flex flex-wrap items-center gap-2"
          />
        </div>

        {/* Filters Bar */}
        <div className="mt-6 flex flex-wrap gap-6 rounded-3xl bg-white p-6 shadow-xl ring-1 ring-green-100">
          {/* Price */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">Price</label>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {([
                { key: "under-1000", label: "Under 1000", min: "" as const, max: 1000 as const },
                { key: "1000-plus", label: "1000+", min: 1000 as const, max: "" as const },
                { key: "1500-plus", label: "1500+", min: 1500 as const, max: "" as const },
                { key: "2000-plus", label: "2000+", min: 2000 as const, max: "" as const },
              ] as const).map((p) => {
                const active = (priceMin === p.min || (p.min === "" && priceMin === "")) && (priceMax === p.max || (p.max === "" && priceMax === ""));
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => {
                      setPriceMin(p.min);
                      setPriceMax(p.max);
                    }}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition ${active ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-600 hover:border-green-400 hover:bg-green-50"
                      }`}
                  >
                    <FaRupeeSign className="text-green-600" /> {p.label}
                  </button>
                );
              })}
            </div>
            <div className="mt-2 flex items-center gap-3">
              <input
                type="number"
                min={0}
                value={priceMin === "" ? "" : priceMin}
                onChange={(e) => setPriceMin(e.target.value === "" ? "" : Math.max(0, Number(e.target.value)))}
                placeholder={priceBounds.min.toString()}
                className="w-28 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
              />
              <span className="text-gray-500">to</span>
              <input
                type="number"
                min={0}
                value={priceMax === "" ? "" : priceMax}
                onChange={(e) => setPriceMax(e.target.value === "" ? "" : Math.max(0, Number(e.target.value)))}
                placeholder={priceBounds.max.toString()}
                className="w-28 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Rating */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">Rating</label>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {[
                { key: "4-plus", label: "4.0+", value: 4 },
                { key: "4-5-plus", label: "4.5+", value: 4.5 },
                { key: "5-star", label: "5.0", value: 5 },
              ].map((r) => {
                const active = ratingFilter !== "" && ratingFilter === r.value;
                return (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => setRatingFilter(r.value)}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition ${active ? "border-yellow-500 bg-yellow-50 text-yellow-700" : "border-gray-200 text-gray-600 hover:border-yellow-400 hover:bg-yellow-50"
                      }`}
                  >
                    <FaStar className="text-yellow-500" /> {r.label}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setRatingFilter("")}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition ${ratingFilter === "" ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-600 hover:border-green-400 hover:bg-green-50"
                  }`}
              >
                All
              </button>
            </div>
          </div>

          {/* Tags */}
          {availableTags.length > 0 && (
            <div className="flex flex-col">
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">Popular tags</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {availableTags.map((tag) => {
                  const active = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() =>
                        setSelectedTags((prev) =>
                          prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
                        )
                      }
                      className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${active
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-gray-200 text-gray-600 hover:border-green-400 hover:bg-green-50"
                        }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active Tag Pills */}
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {selectedTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-2 rounded-full border border-green-500 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => setSelectedTags((prev) => prev.filter((t) => t !== tag))}
                    className="ml-1 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Errors */}
        {/* Results */}
        {loading ? (
          <div className="mt-12 flex justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
          </div>
        ) : sortedAndFilteredStays.length === 0 ? (
          <div className="mt-12 rounded-2xl bg-white p-10 text-center shadow">
            <h3 className="text-lg font-semibold text-gray-900">No stays match your filters yet</h3>
            <p className="mt-2 text-sm text-gray-600">
              Try adjusting the guest count or remove some filters to explore more options.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {sortedAndFilteredStays.map((stay) => {
              const isInCart = cartItems.some(
                (item) => item.itemId === stay._id && item.itemType === "Stay"
              );

              const handleAddToCart = async (e: React.MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                try {
                  if (isInCart) {
                    const cartItem = cartItems.find(
                      (item) => item.itemId === stay._id && item.itemType === "Stay"
                    );
                    if (cartItem) {
                      await removeFromCart(cartItem._id);
                      toast.success(`${stay.name} removed from cart!`);
                    }
                  } else {
                    await addToCart(stay._id, "Stay", 1);
                    toast.success(`${stay.name} added to cart!`);
                  }
                } catch (err: any) {
                  toast.error(err.message || "Failed to manage cart");
                }
              };

              return (
                <StayCard
                  key={stay._id}
                  stay={stay}
                  onSelectTag={(tag) =>
                    setSelectedTags((prev) => (prev.includes(tag) ? prev : [...prev, tag]))
                  }
                  checkIn={checkIn}
                  checkOut={checkOut}
                  isInCart={isInCart}
                  onAddToCart={handleAddToCart}
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}