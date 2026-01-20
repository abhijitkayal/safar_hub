// tours/ToursExplorer.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  FaBus,
  FaCamera,
  FaCheckCircle,
  FaClock,
  FaGlobe,
  FaHotel,
  FaMapMarkerAlt,
  FaRoute,
  FaSearch,
  FaStar,
  FaUsers,
  FaUtensils,
  FaHiking,
  FaShoppingCart,
} from "react-icons/fa";
import { useAvailability } from "../hooks/useAvailability";
import { FaRupeeSign } from "react-icons/fa";
import { TOUR_CATEGORIES, type TourCategoryValue } from "./categories";
import CategoryTabs from "@/app/components/common/CategoryTabs";
import { useCart } from "../hooks/useCart";
import { toast } from "react-hot-toast";

export type TourOption = {
  _id?: string;
  name: string;
  duration: string;
  capacity: number;
  price: number;
  taxes?: number;
  amenities?: string[];
  features: string[];
  images: string[];
};

export type Tour = {
  _id: string;
  name: string;
  category: "group-tours" | "tour-packages";
  duration?: string;
  capacity?: number;
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
  options: TourOption[];
  amenities: Record<string, string[]>;
  rating?: { average: number; count: number };
  tags?: string[];
};

type CategoryValue = TourCategoryValue;

type ToursExplorerProps = {
  initialCategory?: string;
};

type TourCardProps = {
  tour: Tour;
  onSelectTag?: (tag: string) => void;
  startDate?: string;
  endDate?: string;
  isInCart?: boolean;
  onAddToCart?: (event: React.MouseEvent) => void;
};

const tourFacilityIcons = [
  { keywords: ["guide", "host"], icon: <FaHiking className="text-emerald-500" /> },
  { keywords: ["meal", "food", "dining", "lunch"], icon: <FaUtensils className="text-amber-500" /> },
  { keywords: ["transport", "bus", "transfer"], icon: <FaBus className="text-indigo-500" /> },
  { keywords: ["hotel", "stay", "accommodation"], icon: <FaHotel className="text-rose-500" /> },
  { keywords: ["photo", "photography"], icon: <FaCamera className="text-purple-500" /> },
  { keywords: ["global", "international"], icon: <FaGlobe className="text-blue-500" /> },
  { keywords: ["route", "itinerary"], icon: <FaRoute className="text-teal-500" /> },
];

const getTourFacilityIcon = (label: string) => {
  const lower = label?.toLowerCase() || "";
  const match = tourFacilityIcons.find((item) =>
    item.keywords.some((keyword) => lower.includes(keyword))
  );
  return match?.icon ?? <FaCheckCircle className="text-emerald-500" />;
};

export const TourCard = ({
  tour,
  onSelectTag,
  startDate,
  endDate,
  isInCart,
  onAddToCart,
}: TourCardProps) => {
  const optionCount = tour.options?.length ?? 0;
  const startingPrice = optionCount
    ? Math.min(...tour.options.map((option) => option.price)).toLocaleString()
    : null;
  const heroHighlights = tour.heroHighlights?.slice(0, 3) ?? [];
  const primaryFeatures = tour.options?.[0]?.features?.slice(0, 4) ?? [];
  const ratingValue = tour.rating?.count ? tour.rating.average : null;
  const tags = tour.tags ?? [];
  const hasDates = Boolean(startDate && endDate);
  const availability = useAvailability("tour", tour._id, startDate, endDate);
  const availableOptionKeys = availability.availableOptionKeys ?? [];
  const soldOutForDates = hasDates && !availability.loading && optionCount > 0 && availableOptionKeys.length === 0;

  return (
    <Link
      href={`/tours/${tour._id}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-white/40 bg-white/95 shadow-xl backdrop-blur-sm transition hover:-translate-y-2 hover:shadow-2xl"
    >
      <div className="relative h-56 w-full">

        {tour.images && tour.images.length ? (
          <Image
            src={tour.images[0]}
            alt={tour.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-500">
            No image
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-emerald-900/60 via-transparent to-transparent" />
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase text-emerald-700 shadow">
          {tour.category}
        </span>
        {hasDates && (
          <span
            className={`absolute left-4 top-16 rounded-full px-3 py-1 text-xs font-semibold shadow ${soldOutForDates ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
              }`}
          >
            {soldOutForDates ? "Sold for selected dates" : "Available for selected dates"}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6 text-gray-900">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{tour.name}</h3>
            <p className="mt-1 flex items-center text-sm text-gray-600">
              <FaMapMarkerAlt className="mr-2 text-emerald-600" />
              {tour.location.city}, {tour.location.state}
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
                className="rounded-full bg-emerald-50/80 px-3 py-1 text-xs font-medium text-emerald-700"
              >
                {highlight}
              </span>
            ))}
          </div>
        )}

        {!!primaryFeatures.length && (
          <div className="rounded-2xl border border-emerald-50 bg-emerald-50/60 px-4 py-3 text-xs text-gray-700 shadow-inner">
            <span className="font-semibold text-gray-900">Option features:</span>{" "}
            {primaryFeatures.join(", ")}
          </div>
        )}

        {tour.popularFacilities?.length ? (
          <div className="flex flex-wrap gap-2">
            {tour.popularFacilities.slice(0, 4).map((facility) => (
              <span
                key={facility}
                className="inline-flex items-center gap-2 rounded-2xl border border-emerald-100 bg-white/80 px-3 py-2 text-xs text-gray-700 shadow-sm"
              >
                {getTourFacilityIcon(facility)}
                <span className="font-medium capitalize">{facility}</span>
              </span>
            ))}
          </div>
        ) : null}

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
                className="rounded-full border border-emerald-200/70 bg-white px-3 py-1 text-emerald-700 shadow-sm transition hover:border-emerald-400 hover:bg-emerald-50"
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        <div className="mt-auto flex flex-col gap-3 border-t border-gray-100 pt-4 text-sm text-gray-600">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 rounded-2xl bg-emerald-50/80 px-3 py-2">
              <FaClock className="text-emerald-600" />
              <div>
                <p className="text-[11px] uppercase tracking-wide text-emerald-700">Duration</p>
                <p className="text-sm font-semibold text-gray-900">
                  {tour.options?.[0]?.duration ?? tour.duration}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-emerald-50/80 px-3 py-2">
              <FaRoute className="text-emerald-600" />
              <div>
                <p className="text-[11px] uppercase tracking-wide text-emerald-700">Highlights</p>
                <p className="text-sm font-semibold text-gray-900">
                  {tour.heroHighlights?.length ?? optionCount}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 rounded-2xl border border-emerald-100 bg-white px-3 py-2 text-xs">
              <FaUsers className="text-emerald-600" />
              <div>
                <p className="text-[11px] uppercase tracking-wide text-emerald-700">Group size</p>
                <p className="text-sm font-semibold text-gray-900">
                  {tour.options?.[0]?.capacity ?? tour.capacity}
                </p>
              </div>
            </div>
            <div className="text-right">
              {startingPrice ? (
                <>
                  <p className="text-[11px] uppercase tracking-wide text-gray-500">From</p>
                  <p className="text-lg font-semibold text-emerald-700">₹{startingPrice}</p>
                </>
              ) : (
                <p className="text-xs text-gray-500">Pricing on request</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default function ToursExplorer({ initialCategory = "all" }: ToursExplorerProps) {
  const params = useSearchParams();
  const router = useRouter();
  const categoryFromUrl = params.get("category") || initialCategory;
  const normalizedInitialCategory: CategoryValue = TOUR_CATEGORIES.some(
    (tab) => tab.value === categoryFromUrl
  )
    ? (categoryFromUrl as CategoryValue)
    : "all";

  const { items: cartItems, addToCart, removeFromCart } = useCart({ autoLoad: true });

  const [tours, setTours] = useState<Tour[]>([]);
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
    tours.forEach(t => {
      if (t.name) set.add(t.name);
      if (t.location?.city) set.add(t.location.city);
      if (t.location?.state) set.add(t.location.state);
    });
    return Array.from(set);
  }, [tours]);


  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    tours.forEach((tour) => {
      (tour.tags || []).forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
  }, [tours]);

  useEffect(() => {
    const loadTours = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = new URL("/api/tours", window.location.origin);
        const categoryParam = normalizedInitialCategory !== "all" ? normalizedInitialCategory : undefined;
        const cityParam = params.get("city") || undefined;
        const guestsParam = params.get("guests") || undefined;
        if (categoryParam) url.searchParams.set("category", categoryParam);
        if (cityParam) url.searchParams.set("city", cityParam);
        if (guestsParam) url.searchParams.set("guests", guestsParam);
        const res = await fetch(url.toString(), { cache: "no-store" });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data?.message || "Failed to load tours");
        }
        setTours(data.tours || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unable to load tours right now";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadTours();
  }, [normalizedInitialCategory, params]);

  useEffect(() => {
    setActiveCategory(normalizedInitialCategory);
  }, [normalizedInitialCategory]);

  useEffect(() => {
    const city = params.get("city") || "";
    const g = params.get("guests");
    const sd = params.get("startDate") || "";
    const ed = params.get("endDate") || "";
    setSearchTerm(city);
    setGuests(g ? Math.max(1, Number(g)) || 2 : 2);
    setCheckIn(sd);
    setCheckOut(ed);
  }, [params]);

  const priceBounds = useMemo(() => {
    if (!tours.length) return { min: 0, max: 0 };
    const prices = tours
      .map((tour) => (tour.options?.length ? Math.min(...tour.options.map((option) => option.price)) : null))
      .filter((price): price is number => typeof price === "number" && !Number.isNaN(price));
    if (!prices.length) return { min: 0, max: 0 };
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [tours]);

  useEffect(() => {
    if (priceBounds.min === 0 && priceBounds.max === 0) {
      setPriceMin("");
      setPriceMax("");
      return;
    }
    setPriceMin(priceBounds.min);
    setPriceMax(priceBounds.max);
  }, [priceBounds.min, priceBounds.max]);

  const [sortBy, setSortBy] = useState<"rating-desc" | "price-asc" | "price-desc" | "location-asc">("rating-desc");

  const filteredTours = useMemo(() => {
    const sorted = [...tours].sort((a, b) => {
      switch (sortBy) {
        case "rating-desc": {
          const aR = a.rating?.average ?? 0;
          const bR = b.rating?.average ?? 0;
          if (bR !== aR) return bR - aR;
          return (b.rating?.count ?? 0) - (a.rating?.count ?? 0);
        }
        case "price-asc": {
          const aP = a.options?.length ? Math.min(...a.options.map((o) => o.price)) : Infinity;
          const bP = b.options?.length ? Math.min(...b.options.map((o) => o.price)) : Infinity;
          return aP - bP;
        }
        case "price-desc": {
          const aP = a.options?.length ? Math.min(...a.options.map((o) => o.price)) : -Infinity;
          const bP = b.options?.length ? Math.min(...b.options.map((o) => o.price)) : -Infinity;
          return bP - aP;
        }
        case "location-asc": {
          const aL = `${a.location.city}, ${a.location.state}`.toLowerCase();
          const bL = `${b.location.city}, ${b.location.state}`.toLowerCase();
          return aL.localeCompare(bL);
        }
        default:
          return 0;
      }
    });

    return sorted.filter((tour) => {
      if (activeCategory !== "all" && tour.category !== activeCategory) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesName = tour.name.toLowerCase().includes(term);
        const matchesCity = tour.location.city.toLowerCase().includes(term);
        const matchesHighlights = tour.heroHighlights?.some((highlight) =>
          highlight.toLowerCase().includes(term)
        );
        if (!matchesName && !matchesCity && !matchesHighlights) return false;
      }
      if (guests) {
        const hasOption = tour.options?.some((option) => option.capacity >= guests);
        if (!hasOption) return false;
      }
      const minTourPrice = tour.options?.length
        ? Math.min(...tour.options.map((option) => option.price))
        : null;
      if (priceMin !== "" && typeof minTourPrice === "number" && minTourPrice < priceMin) {
        return false;
      }
      if (priceMax !== "" && typeof minTourPrice === "number" && minTourPrice > priceMax) {
        return false;
      }
      if (ratingFilter !== "" && typeof tour.rating?.average === "number") {
        if ((tour.rating?.count ?? 0) === 0 || tour.rating!.average < ratingFilter) {
          return false;
        }
      }
      if (selectedTags.length) {
        const tourTags = tour.tags || [];
        const matchesTags = selectedTags.every((tag) => tourTags.includes(tag));
        if (!matchesTags) return false;
      }
      return true;
    });
  }, [tours, sortBy, activeCategory, searchTerm, guests, priceMin, priceMax, ratingFilter, selectedTags]);

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
      router.replace(queryString ? `/tours?${queryString}` : "/tours", { scroll: false });
    },
    [params, router]
  );

  return (
    <div className="min-h-screen bg-sky-50 text-black">
      <section className="relative overflow-hidden bg-linear-to-br from-green-600 via-green-500 to-lime-400 py-16 text-white">

        <div className="relative mx-auto max-w-7xl px-6 lg:px-2 mt-5">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold sm:text-4xl">Find your perfect Tour</h1>
            <p className="mt-3 text-base text-white/80">
              Explore handpicked tours and packages with verified details and itineraries—just like your favourite booking websites.
            </p>
          </div>

          <div className="mt-8 rounded-2xl bg-white p-6 shadow-xl">
            <form
              className="grid grid-cols-1 gap-4 text-gray-900 sm:grid-cols-2 lg:grid-cols-4"
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              <div className="col-span-1 relative"
                onBlur={(e) => {
                  // small delay to allow clicking a suggestion
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
                    placeholder="City, tour name, highlight"
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
                          e.preventDefault(); // prevents blur before click
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
                <label className="mb-1 block text-sm font-semibold text-gray-700">Start date</label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-900 focus:border-green-500 focus:outline-none"
                />
              </div>

              <div className="col-span-1">
                <label className="mb-1 block text-sm font-semibold text-gray-700">End date</label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-900 focus:border-green-500 focus:outline-none"
                />
              </div>

              <div className="col-span-1">
                <label className="mb-1 block text-sm font-semibold text-gray-700">Participants</label>
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
                  const url = new URL("/tours", window.location.origin);
                  if (searchTerm) url.searchParams.set("city", searchTerm);
                  if (guests) url.searchParams.set("guests", String(guests));
                  if (checkIn) url.searchParams.set("startDate", checkIn);
                  if (checkOut) url.searchParams.set("endDate", checkOut);
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

      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Curated tours just for you</h2>
            <p className="text-sm text-gray-600">
              Browse by category or use filters to narrow down the perfect match for your trip.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <CategoryTabs
              categories={TOUR_CATEGORIES}
              activeValue={activeCategory}
              onChange={handleCategoryChange}
              accent="green"
              scrollable={false}
              className="flex flex-wrap gap-2"
            />
            {/* <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-600">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "rating-desc" | "price-asc" | "price-desc" | "location-asc")
                }
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 focus:border-green-500 focus:outline-none"
              >
                <option value="rating-desc">Highest Rating</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="location-asc">Location (A-Z)</option>
              </select>
            </div> */}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-6 rounded-3xl bg-white p-6 shadow-xl ring-1 ring-green-100">
          <div className="flex flex-col">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">Price</label>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {([
                { key: "under-1000", label: "Under 1000", min: "", max: 1000 },
                { key: "1000-plus", label: "1000+", min: 1000, max: "" },
                { key: "1500-plus", label: "1500+", min: 1500, max: "" },
                { key: "2000-plus", label: "2000+", min: 2000, max: "" },
              ] as { key: string; label: string; min: number | ""; max: number | "" }[]).map((p) => {
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
                onChange={(e) => {
                  const val = e.target.value;
                  setPriceMin(val === "" ? "" : Math.max(0, Number(val)));
                }}
                placeholder={priceBounds.min ? priceBounds.min.toString() : "Min"}
                className="w-28 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-green-500 focus:outline-none"
              />
              <span className="text-gray-500">to</span>
              <input
                type="number"
                min={0}
                value={priceMax === "" ? "" : priceMax}
                onChange={(e) => {
                  const val = e.target.value;
                  setPriceMax(val === "" ? "" : Math.max(0, Number(val)));
                }}
                placeholder={priceBounds.max ? priceBounds.max.toString() : "Max"}
                className="w-28 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-green-500 focus:outline-none"
              />
            </div>
          </div>

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
                          prev.includes(tag) ? prev.filter((existing) => existing !== tag) : [...prev, tag]
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

          {selectedTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {selectedTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-2 rounded-full border border-green-500 px-3 py-1 text-xs font-semibold text-green-700"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => setSelectedTags(selectedTags.filter((t) => t !== tag))}
                    className="text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>


        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-12 flex justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
          </div>
        ) : filteredTours.length === 0 ? (
          <div className="mt-12 rounded-2xl bg-white p-10 text-center shadow">
            <h3 className="text-lg font-semibold text-gray-900">No tours match your filters yet</h3>
            <p className="mt-2 text-sm text-gray-600">
              Try adjusting the guest count or remove some filters to explore more options.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredTours.map((tour) => {
              const isInCart = cartItems.some(
                (item) => item.itemId === tour._id && item.itemType === "Tour"
              );

              const handleAddToCart = async (e: React.MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                try {
                  if (isInCart) {
                    const cartItem = cartItems.find(
                      (item) => item.itemId === tour._id && item.itemType === "Tour"
                    );
                    if (cartItem) {
                      await removeFromCart(cartItem._id);
                      toast.success(`${tour.name} removed from cart!`);
                    }
                  } else {
                    await addToCart(tour._id, "Tour", 1);
                    toast.success(`${tour.name} added to cart!`);
                  }
                } catch (err: any) {
                  toast.error(err.message || "Failed to manage cart");
                }
              };

              return (
                <TourCard
                  key={tour._id}
                  tour={tour}
                  onSelectTag={(tag) =>
                    setSelectedTags((prev) => (prev.includes(tag) ? prev : [...prev, tag]))
                  }
                  startDate={checkIn}
                  endDate={checkOut}
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