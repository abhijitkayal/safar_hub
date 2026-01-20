// app/vehicle-rental/VehicleRentalExplorer.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  FaMapMarkerAlt,
  FaSearch,
  FaStar,
  FaCar,
  FaMotorcycle,
  FaRupeeSign,
  FaShoppingCart,
} from "react-icons/fa";
import { useAvailability } from "@/app/hooks/useAvailability";
import {
  VEHICLE_RENTAL_CATEGORIES,
  type VehicleRentalCategoryValue,
  VEHICLE_RENTAL_SLUG_TO_VALUE,
  VEHICLE_RENTAL_VALUE_TO_SLUG,
} from "./categories";
import CategoryTabs from "@/app/components/common/CategoryTabs";
import { useCart } from "../hooks/useCart";
import { toast } from "react-hot-toast";

export type VehicleOption = {
  _id?: string;
  model: string;
  type: string;
  pricePerDay: number;
  features: string[];
  images: string[];
};

export type VehicleRental = {
  _id: string;
  name: string;
  category: "cars-rental" | "bikes-rentals" | "car-with-driver";
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
  };
  images: string[];
  heroHighlights: string[];
  popularFacilities: string[];
  options: VehicleOption[];
  tags?: string[];
  rating?: { average: number; count: number };
};

type CategoryValue = VehicleRentalCategoryValue;

type VehicleRentalExplorerProps = {
  initialCategory?: string;
};

type RentalCardProps = {
  rental: VehicleRental;
  onSelectTag?: (tag: string) => void;
  pickupDate?: string;
  dropoffDate?: string;
  isInCart?: boolean;
  onAddToCart?: (event: React.MouseEvent) => void;
};

export const RentalCard = ({
  rental,
  onSelectTag,
  pickupDate,
  dropoffDate,
  isInCart,
  onAddToCart,
}: RentalCardProps) => {
  const optionCount = rental.options?.length ?? 0;
  const startingPrice = optionCount
    ? Math.min(...rental.options.map((opt) => opt.pricePerDay)).toLocaleString()
    : null;
  const heroHighlights = rental.heroHighlights?.slice(0, 3) ?? [];
  const primaryFeatures = rental.options?.[0]?.features?.slice(0, 4) ?? [];
  const ratingValue = rental.rating?.count ? rental.rating.average : null;
  const tags = rental.tags ?? [];
  const hasDates = Boolean(pickupDate && dropoffDate);
  const availability = useAvailability("vehicle", rental._id, pickupDate, dropoffDate);
  const availableOptionKeys = availability.availableOptionKeys ?? [];
  const soldOutForDates = hasDates && !availability.loading && optionCount > 0 && availableOptionKeys.length === 0;

  return (
    <Link
      href={`/vehicle-rental/${rental._id}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative h-56 w-full">

        {rental.images?.[0] ? (
          <Image
            src={rental.images[0]}
            alt={rental.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-500">
            No image
          </div>
        )}
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase text-green-700 shadow">
          {rental.category === "cars-rental" ? "Car" : rental.category === "car-with-driver" ? "Car with Driver" : "Bike"}
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

      <div className="flex flex-1 flex-col gap-3 p-5 text-gray-900">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{rental.name}</h3>
            <p className="mt-1 flex items-center text-sm text-gray-600">
              <FaMapMarkerAlt className="mr-2 text-green-600" />
              {rental.location.city}, {rental.location.state}
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
            {heroHighlights.map((h) => (
              <span
                key={h}
                className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700"
              >
                {h}
              </span>
            ))}
          </div>
        )}

        {!!primaryFeatures.length && (
          <div className="text-xs text-gray-600">
            <span className="font-semibold text-gray-800">Features:</span>{" "}
            {primaryFeatures.join(", ")}
          </div>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 text-xs">
            {tags.slice(0, 3).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSelectTag?.(tag);
                }}
                className="rounded-full border border-green-200 px-3 py-1 text-green-700 transition hover:border-green-400 hover:bg-green-50"
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-3 text-sm">
          <div className="text-gray-700">
            <span className="block font-semibold text-gray-900">
              {optionCount} vehicle{optionCount === 1 ? "" : "s"}
            </span>
            {startingPrice ? (
              <span className="text-xs text-gray-500">From ₹{startingPrice}/day</span>
            ) : (
              <span className="text-xs text-gray-500">Pricing on request</span>
            )}
          </div>
          <span className="rounded-full bg-green-100 px-4 py-1 text-xs font-semibold text-green-700">
            View details
          </span>
        </div>
      </div>
    </Link>
  );
};

export default function VehicleRentalExplorer({ initialCategory = "all" }: VehicleRentalExplorerProps) {
  const params = useSearchParams();
  const router = useRouter();
  const slug = params.get("category") || undefined;
  const fromSlug = slug ? VEHICLE_RENTAL_SLUG_TO_VALUE[slug] ?? "all" : initialCategory;
  const normalizedInitialCategory: CategoryValue = VEHICLE_RENTAL_CATEGORIES.some(
    (tab) => tab.value === fromSlug
  )
    ? (fromSlug as CategoryValue)
    : "all";

  const [rentals, setRentals] = useState<VehicleRental[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<CategoryValue>(normalizedInitialCategory);
  const [searchTerm, setSearchTerm] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [dropoffDate, setDropoffDate] = useState("");
  const [priceMin, setPriceMin] = useState<number | "">("");
  const [priceMax, setPriceMax] = useState<number | "">("");
  const [ratingFilter, setRatingFilter] = useState<number | "">("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const allSuggestions = useMemo(() => {
    const set = new Set<string>();
    rentals.forEach(r => {
      if (r.name) set.add(r.name);
      if (r.location?.city) set.add(r.location.city);
      if (r.location?.state) set.add(r.location.state);
    });
    return Array.from(set);
  }, [rentals]);


  const availableTags = useMemo(() => {
    const set = new Set<string>();
    rentals.forEach((r) => (r.tags || []).forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [rentals]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = new URL("/api/vehicle-rentals", window.location.origin);
        const categoryParam = normalizedInitialCategory !== "all" ? normalizedInitialCategory : undefined;
        const cityParam = params.get("city") || undefined;
        if (categoryParam) url.searchParams.set("category", categoryParam);
        if (cityParam) url.searchParams.set("city", cityParam);
        const res = await fetch(url.toString(), { cache: "no-store" });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data?.message || "Failed");
        setRentals(data.rentals || []);
      } catch (e) {
        const message = e instanceof Error ? e.message : "Failed to load rentals";
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [normalizedInitialCategory, params]);

  useEffect(() => {
    setActiveCategory(normalizedInitialCategory);
  }, [normalizedInitialCategory]);

  const { items: cartItems, addToCart, removeFromCart } = useCart({ autoLoad: true });

  useEffect(() => {
    const city = params.get("city") || "";
    const pickup = params.get("pickup") || "";
    const dropoff = params.get("dropoff") || "";
    setSearchTerm(city);
    setPickupDate(pickup);
    setDropoffDate(dropoff);
  }, [params]);

  const priceBounds = useMemo(() => {
    if (!rentals.length) return { min: 0, max: 0 };
    const prices = rentals
      .map((r) => (r.options?.length ? Math.min(...r.options.map((o) => o.pricePerDay)) : null))
      .filter((p): p is number => typeof p === "number");
    return prices.length ? { min: Math.min(...prices), max: Math.max(...prices) } : { min: 0, max: 0 };
  }, [rentals]);

  useEffect(() => {
    setPriceMin(priceBounds.min);
    setPriceMax(priceBounds.max);
  }, [priceBounds]);

  const [sortBy, setSortBy] = useState<"rating-desc" | "price-asc" | "price-desc" | "location-asc">("rating-desc");

  const filteredRentals = useMemo(() => {
    const sorted = [...rentals].sort((a, b) => {
      switch (sortBy) {
        case "rating-desc": {
          const aR = a.rating?.average ?? 0;
          const bR = b.rating?.average ?? 0;
          if (bR !== aR) return bR - aR;
          return (b.rating?.count ?? 0) - (a.rating?.count ?? 0);
        }
        case "price-asc": {
          const aP = a.options?.length ? Math.min(...a.options.map((o) => o.pricePerDay)) : Infinity;
          const bP = b.options?.length ? Math.min(...b.options.map((o) => o.pricePerDay)) : Infinity;
          return aP - bP;
        }
        case "price-desc": {
          const aP = a.options?.length ? Math.min(...a.options.map((o) => o.pricePerDay)) : -Infinity;
          const bP = b.options?.length ? Math.min(...b.options.map((o) => o.pricePerDay)) : -Infinity;
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
    return sorted.filter((r) => {
      if (activeCategory !== "all" && r.category !== activeCategory) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        if (
          !r.name.toLowerCase().includes(term) &&
          !r.location.city.toLowerCase().includes(term) &&
          !r.heroHighlights?.some((h) => h.toLowerCase().includes(term))
        )
          return false;
      }
      const minPrice = r.options?.length ? Math.min(...r.options.map((o) => o.pricePerDay)) : null;
      if (priceMin !== "" && minPrice !== null && minPrice < priceMin) return false;
      if (priceMax !== "" && minPrice !== null && minPrice > priceMax) return false;
      if (ratingFilter !== "" && r.rating?.average !== undefined && r.rating.average < ratingFilter) return false;
      if (selectedTags.length && !(r.tags || []).some((t) => selectedTags.includes(t))) return false;
      return true;
    });
  }, [rentals, sortBy, activeCategory, searchTerm, priceMin, priceMax, ratingFilter, selectedTags]);

  const handleCategoryChange = useCallback(
    (value: CategoryValue) => {
      setActiveCategory(value);
      const nextSearch = new URLSearchParams(params.toString());
      if (value === "all") {
        nextSearch.delete("category");
      } else {
        const slugValue = VEHICLE_RENTAL_VALUE_TO_SLUG[value] || value;
        nextSearch.set("category", slugValue);
      }
      const queryString = nextSearch.toString();
      router.replace(queryString ? `/vehicle-rental?${queryString}` : "/vehicle-rental", { scroll: false });
    },
    [params, router]
  );

  return (
    <div className="min-h-screen bg-sky-50 text-black">
      {/* Hero */}

      <section className="relative overflow-hidden bg-linear-to-br from-green-600 via-green-500 to-lime-400 py-16 text-white">


        <div className="relative mx-auto max-w-7xl px-6 lg:px-2 mt-5">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold sm:text-4xl">Rent your Ride</h1>
            <p className="mt-3 text-base text-white/80">
              Cars, bikes, and more — verified rentals with transparent pricing.
            </p>
          </div>

          <div className="mt-8 rounded-2xl bg-white p-6 shadow-xl">
            <form
              className="grid grid-cols-1 gap-4 text-gray-900 sm:grid-cols-2 lg:grid-cols-3"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="relative"
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) {
                    setShowSuggestions(false);
                  }
                }}
              >
                <label className="mb-1 block text-sm font-semibold text-gray-700">Location</label>

                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 focus-within:border-green-500 relative z-10">
                  <FaSearch className="text-gray-500" />
                  <input
                    type="text"
                    placeholder="City, rental name, highlight"
                    value={searchTerm}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSearchTerm(val);
                      if (val.trim()) {
                        const lower = val.toLowerCase();
                        const filtered = allSuggestions.filter(s => s.toLowerCase().includes(lower)).slice(0, 5);
                        setSuggestions(filtered);
                        setShowSuggestions(true);
                      } else {
                        setShowSuggestions(false);
                      }
                    }}
                    onFocus={() => {
                      if (searchTerm.trim()) setShowSuggestions(true);
                    }}
                    className="w-full bg-transparent outline-none"
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
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Pickup</label>
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}

                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-900 focus:border-green-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Dropoff</label>
                <input
                  type="date"
                  value={dropoffDate}
                  onChange={(e) => setDropoffDate(e.target.value)}

                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-900 focus:border-green-500 focus:outline-none"
                />
              </div>
            </form>
            <div className="mt-4">
              <button

                className="rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-700"
                type="button"
                onClick={() => {
                  const url = new URL("/vehicle-rental", window.location.origin);
                  if (searchTerm) url.searchParams.set("city", searchTerm);
                  if (activeCategory && activeCategory !== "all") {
                    const slugValue = VEHICLE_RENTAL_VALUE_TO_SLUG[activeCategory] || activeCategory;
                    url.searchParams.set("category", slugValue);
                  }
                  if (pickupDate) url.searchParams.set("pickup", pickupDate);
                  if (dropoffDate) url.searchParams.set("dropoff", dropoffDate);
                  router.push(`${url.pathname}?${url.searchParams.toString()}`);
                }}
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Filters + Listings */}

      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Available rentals</h2>
            <p className="text-sm text-gray-600">Filter by category, price, or tags.</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <CategoryTabs
              categories={VEHICLE_RENTAL_CATEGORIES}
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

        {/* Filters */}
        <div className="mt-6 flex flex-wrap gap-6 rounded-3xl bg-white p-6 shadow-xl ring-1 ring-green-100">
          <div className="flex flex-col">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">Price per day</label>
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
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value === "" ? "" : Math.max(0, Number(e.target.value)))}
                placeholder={priceBounds.min.toString()}

                className="w-28 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-green-500"
              />
              <span className="text-gray-500">to</span>
              <input
                type="number"
                min={0}
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value === "" ? "" : Math.max(0, Number(e.target.value)))}
                placeholder={priceBounds.max.toString()}

                className="w-28 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-green-500"
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
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">Tags</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {availableTags.map((tag) => {
                  const active = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() =>
                        setSelectedTags((p) => (p.includes(tag) ? p.filter((t) => t !== tag) : [...p, tag]))
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
        </div>

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">{error}</div>
        )}

        {loading ? (
          <div className="mt-12 flex justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
          </div>
        ) : filteredRentals.length === 0 ? (
          <div className="mt-12 rounded-2xl bg-white p-10 text-center shadow">
            <h3 className="text-lg font-semibold text-gray-900">No rentals match your filters</h3>
            <p className="mt-2 text-sm text-gray-600">Try adjusting filters.</p>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredRentals.map((rental) => {
              const isInCart = cartItems.some(
                (item) => item.itemId === rental._id && item.itemType === "VehicleRental"
              );

              const handleAddToCart = async (e: React.MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                try {
                  if (isInCart) {
                    const cartItem = cartItems.find(
                      (item) => item.itemId === rental._id && item.itemType === "VehicleRental"
                    );
                    if (cartItem) {
                      await removeFromCart(cartItem._id);
                      toast.success(`${rental.name} removed from cart!`);
                    }
                  } else {
                    await addToCart(rental._id, "VehicleRental", 1);
                    toast.success(`${rental.name} added to cart!`);
                  }
                } catch (err: any) {
                  toast.error(err.message || "Failed to manage cart");
                }
              };

              return (
                <RentalCard
                  key={rental._id}
                  rental={rental}
                  onSelectTag={(tag) => setSelectedTags((p) => (p.includes(tag) ? p : [...p, tag]))}
                  pickupDate={pickupDate}
                  dropoffDate={dropoffDate}
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