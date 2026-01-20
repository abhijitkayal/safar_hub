// adventures/AdventuresExplorer.tsx
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FaHeart, FaMapMarkerAlt, FaSearch, FaStar, FaUsers, FaRupeeSign, FaShoppingCart } from "react-icons/fa";
import { ADVENTURE_CATEGORIES, type AdventureCategoryValue } from "./categories";
import CategoryTabs from "@/app/components/common/CategoryTabs";
import { useCart } from "../hooks/useCart";
import { toast } from "react-hot-toast";

export type AdventureOption = {
  _id?: string;
  name: string;
  duration: string;
  difficulty: string;
  capacity: number;
  price: number;
  taxes?: number;
  features: string[];
  images: string[];
};

export type Adventure = {
  _id: string;
  name: string;
  category: "trekking" | "hiking" | "camping" | "water-rafting";
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
  options: AdventureOption[];
  amenities: Record<string, string[]>;
  rating?: { average: number; count: number };
  tags?: string[];
};

type CategoryValue = AdventureCategoryValue;

type AdventuresExplorerProps = {
  initialCategory?: string;
};

type AdventureCardProps = {
  adventure: Adventure;
  onSelectTag?: (tag: string) => void;
  isInCart?: boolean;
  onAddToCart?: (event: React.MouseEvent) => void;
};

export const AdventureCard = ({
  adventure,
  onSelectTag,
  isInCart,
  onAddToCart,
}: AdventureCardProps) => {
  const optionCount = adventure.options?.length ?? 0;
  const startingPrice = optionCount
    ? Math.min(...adventure.options.map((o) => o.price)).toLocaleString()
    : null;
  const heroHighlights = adventure.heroHighlights?.slice(0, 3) ?? [];
  const primaryFeatures = adventure.options?.[0]?.features?.slice(0, 4) ?? [];
  const ratingValue = adventure.rating?.count ? adventure.rating.average : null;
  const tags = adventure.tags ?? [];

  return (
    <Link
      href={`/adventures/${adventure._id}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-white/40 bg-white/95 shadow-xl backdrop-blur-sm transition hover:-translate-y-2 hover:shadow-2xl"
    >
      <div className="relative h-56 w-full">

        {adventure.images?.length ? (
          <Image
            src={adventure.images[0]}
            alt={adventure.name}
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
          {adventure.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5 text-gray-900">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{adventure.name}</h3>
            <p className="mt-1 flex items-center text-sm text-gray-600">
              <FaMapMarkerAlt className="mr-2 text-green-600" />
              {adventure.location.city}, {adventure.location.state}
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
            <span className="font-semibold text-gray-800">Option features:</span>{" "}
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
              {optionCount} option{optionCount === 1 ? "" : "s"}
            </span>
            {startingPrice ? (
              <span className="text-xs text-gray-500">From ₹{startingPrice}</span>
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

export default function AdventuresExplorer({ initialCategory = "all" }: AdventuresExplorerProps) {
  const params = useSearchParams();
  const router = useRouter();
  const categoryFromUrl = params.get("category") || initialCategory;
  const normalizedInitialCategory: CategoryValue = ADVENTURE_CATEGORIES.some(
    (tab) => tab.value === categoryFromUrl
  )
    ? (categoryFromUrl as CategoryValue)
    : "all";

  const [adventures, setAdventures] = useState<Adventure[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<CategoryValue>(normalizedInitialCategory);
  const [searchTerm, setSearchTerm] = useState("");
  const [guests, setGuests] = useState(2);
  const [error, setError] = useState<string | null>(null);
  const [priceMin, setPriceMin] = useState<number | "">("");
  const [priceMax, setPriceMax] = useState<number | "">("");
  const [ratingFilter, setRatingFilter] = useState<number | "">("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [difficultyFilter, setDifficultyFilter] = useState<string>("");

  // Form-local state (applied on Search submit)
  const [formSearchTerm, setFormSearchTerm] = useState<string>("");
  const [formGuests, setFormGuests] = useState<number>(2);
  const [formDifficultyFilter, setFormDifficultyFilter] = useState<string>("");
  const [formActiveCategory, setFormActiveCategory] = useState<CategoryValue>(normalizedInitialCategory);


  const availableTags = useMemo(() => {
    const set = new Set<string>();
    adventures.forEach((adv) => (adv.tags || []).forEach((t) => set.add(t)));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [adventures]);

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const allSuggestions = useMemo(() => {
    const set = new Set<string>();
    adventures.forEach(a => {
      if (a.name) set.add(a.name);
      if (a.location?.city) set.add(a.location.city);
      if (a.location?.state) set.add(a.location.state);
    });
    return Array.from(set);
  }, [adventures]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/vendor/adventures?all=true", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data?.message || "Failed");
        setAdventures(data.adventures || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unable to load adventures";
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    setActiveCategory(normalizedInitialCategory);
    setFormActiveCategory(normalizedInitialCategory);
  }, [normalizedInitialCategory]);

  const { items: cartItems, addToCart, removeFromCart } = useCart({ autoLoad: true });

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
      router.replace(queryString ? `/adventures?${queryString}` : "/adventures", { scroll: false });
    },
    [params, router]
  );

  const priceBounds = useMemo(() => {
    if (!adventures.length) return { min: 0, max: 0 };
    const prices = adventures
      .map((adv) =>
        adv.options?.length ? Math.min(...adv.options.map((o) => o.price)) : null
      )
      .filter((p): p is number => typeof p === "number");
    if (!prices.length) return { min: 0, max: 0 };
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [adventures]);

  useEffect(() => {
    setPriceMin(priceBounds.min);
    setPriceMax(priceBounds.max);
  }, [priceBounds.min, priceBounds.max]);

  const filteredAdventures = useMemo(() => {
    return adventures.filter((adv) => {
      if (activeCategory !== "all" && adv.category !== activeCategory) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesName = adv.name.toLowerCase().includes(term);
        const matchesCity = adv.location.city.toLowerCase().includes(term);
        const matchesHighlight = adv.heroHighlights?.some((h) => h.toLowerCase().includes(term));
        if (!matchesName && !matchesCity && !matchesHighlight) return false;
      }
      if (guests) {
        const ok = adv.options?.some((o) => o.capacity >= guests);
        if (!ok) return false;
      }
      const minPrice = adv.options?.length
        ? Math.min(...adv.options.map((o) => o.price))
        : null;
      if (priceMin !== "" && typeof minPrice === "number" && minPrice < priceMin) return false;
      if (priceMax !== "" && typeof minPrice === "number" && minPrice > priceMax) return false;
      if (ratingFilter !== "" && adv.rating?.average !== undefined) {
        if ((adv.rating?.count ?? 0) === 0 || adv.rating.average < ratingFilter) return false;
      }
      if (difficultyFilter) {
        const ok = adv.options?.some((o) => o.difficulty === difficultyFilter);
        if (!ok) return false;
      }
      if (selectedTags.length) {
        const advTags = adv.tags || [];
        if (!selectedTags.every((t) => advTags.includes(t))) return false;
      }
      return true;
    });
  }, [
    adventures,
    activeCategory,
    searchTerm,
    guests,
    priceMin,
    priceMax,
    ratingFilter,
    difficultyFilter,
    selectedTags,
  ]);

  return (
    <div className="min-h-screen bg-sky-50 text-black">
      {/* Hero + Search */}
      <section className="relative overflow-hidden bg-linear-to-br from-green-600 via-green-500 to-lime-400 py-16 text-white">

        <div className="relative mx-auto max-w-7xl px-6 lg:px-2 mt-5">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold sm:text-4xl">Discover thrilling Adventures</h1>
            <p className="mt-3 text-base text-white/80">
              Hand-picked treks, hikes, camps & rafting experiences with live availability.
            </p>
          </div>

          <div className="mt-8 rounded-2xl bg-white p-6 shadow-xl">
            <form id="adventure-search-form"
              className="grid grid-cols-1 gap-4 text-gray-900 sm:grid-cols-2 lg:grid-cols-4"
              onSubmit={(e) => {
                e.preventDefault();
                setSearchTerm(formSearchTerm);
                setGuests(formGuests);
                setDifficultyFilter(formDifficultyFilter);
                setActiveCategory(formActiveCategory);
              }}
            >
              <div className="col-span-1 relative"
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) {
                    setShowSuggestions(false);
                  }
                }}
              >
                <label className="mb-1 block text-sm font-semibold text-gray-700">Search</label>
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 focus-within:border-green-500 relative z-10">
                  <FaSearch className="text-gray-500" />
                  <input
                    type="text"
                    placeholder="City, name, highlight"
                    value={formSearchTerm}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormSearchTerm(val);
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
                      if (formSearchTerm.trim()) setShowSuggestions(true);
                    }}
                    className="w-full bg-transparent outline-none placeholder:text-gray-500"
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
                          setFormSearchTerm(suggestion);
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
                <label className="mb-1 block text-sm font-semibold text-gray-700">Participants</label>
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 focus-within:border-green-500">
                  <FaUsers className="text-gray-500" />
                  <input
                    type="number"
                    min={1}
                    value={formGuests}
                    onChange={(e) => setFormGuests(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-transparent outline-none"
                  />
                </div>
              </div>

              <div className="col-span-1">
                <label className="mb-1 block text-sm font-semibold text-gray-700">Difficulty</label>
                <select
                  value={formDifficultyFilter}
                  onChange={(e) => setFormDifficultyFilter(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 focus:border-green-500 focus:outline-none"
                >
                  <option value="">All levels</option>
                  <option value="Easy">Easy</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Challenging">Challenging</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>

              <div className="col-span-1">
                <label className="mb-1 block text-sm font-semibold text-gray-700">Category</label>
                <select
                  value={formActiveCategory}
                  onChange={(e) => setFormActiveCategory(e.target.value as CategoryValue)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 focus:border-green-500 focus:outline-none"
                >
                  {ADVENTURE_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </form>
            <div className="mt-4">
              <button
                className="rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-700"
                type="submit"
                form="adventure-search-form"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Filters + List */}
      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-2 mt-5">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Choose your adventure</h2>
            <p className="text-sm text-gray-600">
              Use filters below to narrow down the perfect experience.
            </p>
          </div>

          <CategoryTabs
            categories={ADVENTURE_CATEGORIES}
            activeValue={activeCategory}
            onChange={handleCategoryChange}
            accent="green"
            scrollable={false}
            className="flex flex-wrap items-center gap-2"
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-6 rounded-3xl bg-white p-6 shadow-xl ring-1 ring-green-100">
          {/* Price */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
              Price (₹)
            </label>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {([
                { key: "under-1000", label: "Under 1000", min: "" as const, max: 1000 as const },
                { key: "1000-plus", label: "1000+", min: 1000 as const, max: "" as const },
                { key: "1500-plus", label: "1500+", min: 1500 as const, max: "" as const },
                { key: "2000-plus", label: "2000+", min: 2000 as const, max: "" as const },
              ] as const).map((p) => {
                const active =
                  (priceMin === p.min || (p.min === "" && priceMin === "")) &&
                  (priceMax === p.max || (p.max === "" && priceMax === ""));
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => {
                      setPriceMin(p.min);
                      setPriceMax(p.max);
                    }}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition ${active
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-200 text-gray-600 hover:border-green-400 hover:bg-green-50"
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
                { key: "5-star", label: "5.0", value: 5 },
                { key: "4-5-plus", label: "4.5+", value: 4.5 },
                { key: "4-plus", label: "4.0+", value: 4 },
              ].map((r) => {
                const active = ratingFilter !== "" && ratingFilter === r.value;
                return (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => setRatingFilter(r.value)}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition ${active
                      ? "border-yellow-500 bg-yellow-50 text-yellow-700"
                      : "border-gray-200 text-gray-600 hover:border-yellow-400 hover:bg-yellow-50"
                      }`}
                  >
                    <FaStar className="text-yellow-500" /> {r.label}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setRatingFilter("")}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition ${ratingFilter === ""
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-gray-200 text-gray-600 hover:border-green-400 hover:bg-green-50"
                  }`}
              >
                All
              </button>
            </div>
          </div>

          {/* Tags */}
          {availableTags.length > 0 && (
            <div className="flex flex-col">
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                Tags
              </label>
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
                    onClick={() => setSelectedTags(selectedTags.filter((t) => t !== tag))}
                    className="ml-1 text-green-600 hover:text-green-800"
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
        ) : filteredAdventures.length === 0 ? (
          <div className="mt-12 rounded-2xl bg-white p-10 text-center shadow">
            <h3 className="text-lg font-semibold text-gray-900">No adventures match your filters</h3>
            <p className="mt-2 text-sm text-gray-600">
              Try adjusting the filters or search term.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredAdventures.map((adv) => {
              const isInCart = cartItems.some(
                (item) => item.itemId === adv._id && item.itemType === "Adventure"
              );

              const handleAddToCart = async (e: React.MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                try {
                  if (isInCart) {
                    const cartItem = cartItems.find(
                      (item) => item.itemId === adv._id && item.itemType === "Adventure"
                    );
                    if (cartItem) {
                      await removeFromCart(cartItem._id);
                      toast.success(`${adv.name} removed from cart!`);
                    }
                  } else {
                    await addToCart(adv._id, "Adventure", 1);
                    toast.success(`${adv.name} added to cart!`);
                  }
                } catch (err: any) {
                  toast.error(err.message || "Failed to manage cart");
                }
              };

              return (
                <AdventureCard
                  key={adv._id}
                  adventure={adv}
                  onSelectTag={(tag) =>
                    setSelectedTags((prev) => (prev.includes(tag) ? prev : [...prev, tag]))
                  }
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