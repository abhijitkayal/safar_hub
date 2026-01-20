// adventures/adventureDetailClient.tsx
"use client";

import { Fragment, useMemo, useState, type JSX } from "react";
import Image from "next/image";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaCheck,
  FaChevronLeft,
  FaChevronRight,
  FaShoppingCart,
  FaMapMarkerAlt,
  FaTag,
  FaUsers,
  FaVideo,
  FaStar,
  FaClock,
  FaTimes,
  FaMountain,
  FaShieldAlt,
  FaSwimmer,
  FaUtensils,
  FaCoffee,
  FaDumbbell,
  FaConciergeBell,
  FaChild,
  FaWheelchair,
  FaAccessibleIcon,
  FaBath,
  FaShower,
  FaTv,
  FaSnowflake,
  FaHotjar,
  FaWifi,
  FaParking,
  FaGlassCheers,
  FaSpa,
  FaInfoCircle,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useCart } from "../hooks/useCart";
import { useAvailability } from "../hooks/useAvailability";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import ReviewDisplay from "../components/Reviews/ReviewDisplay";

export type AdventureDetailPayload = {
  _id: string;
  name: string;
  vendorId: string;
  category: "trekking" | "hiking" | "camping" | "water-rafting";
  duration?: string;
  price?: number;
  capacity?: number;
  difficultyLevel?: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
  };
  heroHighlights: string[];
  curatedHighlights?: Array<{ title: string; description?: string; icon?: string }>;
  tags?: string[];
  rating?: { average: number; count: number };
  images: string[];
  gallery: string[];
  videos: { inside?: string[]; outside?: string[] };
  popularFacilities: string[];
  amenities: Record<string, string[]>;
  features?: string[];
  options: Array<{
    _id?: string;
    name: string;
    description?: string;
    duration: string;
    difficulty: string;
    capacity: number;
    price: number;
    taxes?: number;
    currency?: string;
    features: string[];
    amenities: string[];
    available: number;
    images: string[];
    isRefundable?: boolean;
    refundableUntilHours?: number;
  }>;
  defaultCancellationPolicy?: string;
  defaultHouseRules?: string[];
  itinerary?: Array<{
    heading: string;
    description: string;
  }>;
  inclusions?: string | string[];
  exclusions?: string | string[];
  policyTerms?: string | string[];
  about: { heading: string; description: string };
  vendorMessage?: string;
};

const facilityIconMap: Record<string, JSX.Element> = {
  pool: <FaSwimmer />,
  swim: <FaSwimmer />,
  swimming: <FaSwimmer />,
  wifi: <FaWifi />,
  internet: <FaWifi />,
  parking: <FaParking />,
  spa: <FaSpa />,
  restaurant: <FaUtensils />,
  bar: <FaGlassCheers />,
  lounge: <FaGlassCheers />,
  breakfast: <FaCoffee />,
  gym: <FaDumbbell />,
  fitness: <FaDumbbell />,
  concierge: <FaConciergeBell />,
  family: <FaChild />,
  security: <FaShieldAlt />,
  safety: <FaShieldAlt />,
  wheelchair: <FaWheelchair />,
  accessible: <FaAccessibleIcon />,
  bathroom: <FaBath />,
  shower: <FaShower />,
  tv: <FaTv />,
  air: <FaSnowflake />,
  conditioning: <FaSnowflake />,
  mountain: <FaMountain />,
};

const getFacilityIcon = (label: string) => {
  const key = label.toLowerCase();
  const match = Object.entries(facilityIconMap).find(([term]) => key.includes(term));
  return match ? match[1] : <FaCheck />;
};

const formatDateInput = (date: Date) => {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const formatDateDisplay = (value: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const calculateDays = (start: string, end: string) => {
  if (!start || !end) return 1;
  const a = new Date(start);
  const b = new Date(end);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime()) || b <= a) return 1;
  return Math.max(1, Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)));
};

const getDefaultDates = () => {
  const today = new Date();
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  return { start: formatDateInput(today), end: formatDateInput(tomorrow) };
};

const stripRichTextTags = (value?: string) => {
  if (!value || typeof value !== "string") return "";
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|ul|ol|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/\r?\n{2,}/g, "\n")
    .replace(/\s+\n/g, "\n")
    .replace(/\n\s+/g, "\n");
};

const splitRichTextEntries = (value?: string | string[]) => {
  if (!value) return [];
  const entries = Array.isArray(value) ? value : [value];
  return entries
    .flatMap((entry) =>
      stripRichTextTags(entry)
        .split(/\r?\n+/)
        .map((text) => text.replace(/\s+/g, " ").trim())
        .filter(Boolean)
    );
};

const flattenRichTextValue = (value?: string | string[]) =>
  Array.isArray(value) ? value.join("\n") : value ?? "";

const hasRichTextContent = (value?: string | string[]) =>
  stripRichTextTags(flattenRichTextValue(value)).trim().length > 0;

const sanitizeRichText = (value?: string | string[]) => {
  const html = flattenRichTextValue(value);
  if (!html) return "";
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/javascript:/gi, "");
};

const DIFFICULTY_CATEGORIES = ["trekking", "hiking", "water-rafting"] as const;

interface AdventureDetailClientProps {
  adventure: AdventureDetailPayload;
}

const AdventureDetailClient: React.FC<AdventureDetailClientProps> = ({ adventure }) => {
  const router = useRouter();
  const { addToCart, removeFromCart, isInCart, loading: cartLoading } = useCart({ autoLoad: true });

  const inCart = isInCart(adventure._id, "Adventure");
  const primaryOption = adventure.options?.[0];
  const displayDuration = adventure.duration || primaryOption?.duration || "";
  const displayCapacity =
    typeof adventure.capacity === "number"
      ? adventure.capacity
      : typeof primaryOption?.capacity === "number"
        ? primaryOption.capacity
        : null;
  const displayPrice =
    typeof adventure.price === "number"
      ? adventure.price
      : typeof primaryOption?.price === "number"
        ? primaryOption.price
        : null;
  const showDifficulty =
    adventure.category === "trekking" || adventure.category === "hiking" || adventure.category === "water-rafting";
  const difficultyValue = adventure.difficultyLevel || primaryOption?.difficulty || "";
  const displayFeatures = adventure.features?.length ? adventure.features : primaryOption?.features ?? [];

  const images = useMemo(() => {
    const gallery = Array.isArray(adventure.gallery) ? adventure.gallery : [];
    return [...adventure.images, ...gallery].filter(Boolean);
  }, [adventure.images, adventure.gallery]);

  const itineraryItems = useMemo(
    () =>
      Array.isArray(adventure.itinerary)
        ? adventure.itinerary
          .map((item) => {
            const heading = item.heading?.trim() || "";
            const rawDescription = typeof item.description === "string" ? item.description : "";
            const plainDescription = stripRichTextTags(rawDescription).trim();
            return {
              heading,
              plainDescription,
              rawDescription,
            };
          })
          .filter((item) => item.heading || item.plainDescription)
        : [],
    [adventure.itinerary]
  );

  const itineraryHtml = useMemo(
    () =>
      Array.isArray(adventure.itinerary)
        ? adventure.itinerary.map((day) => sanitizeRichText(day.description))
        : [],
    [adventure.itinerary]
  );

  // Handle inclusions, exclusions, and policyTerms as strings or arrays
  const inclusionList = useMemo(() => {
    if (!adventure.inclusions) return [];
    return splitRichTextEntries(adventure.inclusions);
  }, [adventure.inclusions]);

  const exclusionList = useMemo(() => {
    if (!adventure.exclusions) return [];
    return splitRichTextEntries(adventure.exclusions);
  }, [adventure.exclusions]);

  const policyTermsList = useMemo(() => {
    if (!adventure.policyTerms) return [];
    return splitRichTextEntries(adventure.policyTerms);
  }, [adventure.policyTerms]);

  const hasInclusions = useMemo(() => {
    if (!adventure.inclusions) return false;
    return hasRichTextContent(adventure.inclusions);
  }, [adventure.inclusions]);

  const hasExclusions = useMemo(() => {
    if (!adventure.exclusions) return false;
    return hasRichTextContent(adventure.exclusions);
  }, [adventure.exclusions]);

  const hasPolicyTerms = useMemo(() => {
    if (!adventure.policyTerms) return false;
    return hasRichTextContent(adventure.policyTerms);
  }, [adventure.policyTerms]);

  const inclusionHtml = useMemo(() => {
    if (!adventure.inclusions) return "";
    return sanitizeRichText(adventure.inclusions);
  }, [adventure.inclusions]);

  const exclusionHtml = useMemo(() => {
    if (!adventure.exclusions) return "";
    return sanitizeRichText(adventure.exclusions);
  }, [adventure.exclusions]);

  const policyHtml = useMemo(() => {
    if (!adventure.policyTerms) return "";
    return sanitizeRichText(adventure.policyTerms);
  }, [adventure.policyTerms]);

  const { start: defaultStart, end: defaultEnd } = useMemo(() => getDefaultDates(), []);

  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);

  const initialSelections = useMemo(() => {
    const map: Record<string, number> = {};
    adventure.options.forEach((opt) => {
      const key = opt._id?.toString() || opt.name;
      map[key] = 0;
    });
    return map;
  }, [adventure.options]);

  const [optionSelections, setOptionSelections] = useState<Record<string, number>>(initialSelections);
  const [expandedOptionKey, setExpandedOptionKey] = useState<string | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [activeOptionIdx, setActiveOptionIdx] = useState<number | null>(null);
  const [optionImgIdx, setOptionImgIdx] = useState(0);

  const days = useMemo(() => calculateDays(startDate, endDate), [startDate, endDate]);

  const availability = useAvailability("adventure", adventure._id, startDate, endDate);
  const availableOptionKeys = availability.availableOptionKeys ?? [];
  const bookedSummaries = availability.bookedRanges.slice(0, 3);
  const soldOutForDates =
    !availability.loading && adventure.options.length > 0 && availableOptionKeys.length === 0;
  const isOptionUnavailable = (optionKey: string) => {
    if (availability.loading) return false;
    if (availableOptionKeys.length === 0) return soldOutForDates;
    return !availableOptionKeys.includes(optionKey);
  };

  const pricing = useMemo(() => {
    let subtotal = 0;
    let taxes = 0;
    const selected = adventure.options.map((opt) => {
      const key = opt._id?.toString() || opt.name;
      const qty = optionSelections[key] || 0;
      if (!qty) return null;
      const price = opt.price;
      const tax = opt.taxes ?? 0;
      subtotal += price * qty * days;
      taxes += tax * qty * days;
      return { opt, qty, price, tax };
    });
    const totalOptions = selected.filter(Boolean).reduce((s, i) => s + (i?.qty ?? 0), 0);
    const total = subtotal + taxes;
    return {
      subtotal,
      taxes,
      total,
      totalOptions,
      selectedOptions: selected.filter(Boolean) as Array<{
        opt: AdventureDetailPayload["options"][number];
        qty: number;
        price: number;
        tax: number;
      }>,
    };
  }, [optionSelections, adventure.options, days]);

  const platformFee = pricing.totalOptions ? 15 : 0;
  const grandTotal = pricing.total + platformFee;

  const locationString = useMemo(
    () => [adventure.location.address, adventure.location.city, adventure.location.state, adventure.location.country].filter(Boolean).join(", "),
    [adventure.location.address, adventure.location.city, adventure.location.state, adventure.location.country]
  );

  const mapEmbedUrl = useMemo(
    () => `https://www.google.com/maps?q=${encodeURIComponent(locationString)}&output=embed`,
    [locationString]
  );

  const mapDirectionsUrl = useMemo(
    () => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(locationString)}`,
    [locationString]
  );

  const toggleSelection = (key: string, available: number) => {
    if (available <= 0 || isOptionUnavailable(key)) return;

    // Check if we are selecting (currently 0)
    const currentQty = optionSelections[key] || 0;
    if (currentQty === 0) {
      setTimeout(() => {
        const el = document.getElementById("adventure-booking-summary");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }

    setOptionSelections((prev) => {
      const current = prev[key] || 0;
      if (available <= 0) {
        return { ...prev, [key]: 0 };
      }
      return { ...prev, [key]: current > 0 ? 0 : 1 };
    });
  };

  const stepQuantity = (key: string, delta: number, maxAvailable: number) => {
    if (isOptionUnavailable(key)) return;
    setOptionSelections((prev) => {
      const allowedMax = Math.max(0, maxAvailable);
      const current = prev[key] || 0;
      const next = Math.min(Math.max(current + delta, 0), allowedMax);
      return { ...prev, [key]: next };
    });
  };

  const handleBookNow = () => {
    if (!pricing.totalOptions || soldOutForDates) return;

    const params = new URLSearchParams({
      start: startDate,
      end: endDate,
      adults: String(adults),
      children: String(children),
      infants: String(infants),
    });

    pricing.selectedOptions.forEach(({ opt, qty }) => {
      const key = opt._id?.toString() || opt.name;
      params.append("options", `${key}:${qty}`);
    });

    router.push(`/adventures/${adventure._id}/book?${params.toString()}`);
  };

  const facilities = adventure.popularFacilities || [];
  const hasRating = adventure.rating?.average != null;

  return (
    <div className="min-h-screen bg-sky-50 text-black">
      <header className="relative isolate overflow-hidden bg-linear-to-br from-green-600 via-green-500 to-lime-400 pb-20 pt-16 text-white">
        {/* <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: adventure.images?.length
              ? `url(${adventure.images[0]})`
              : "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        /> */}
        <div className="relative mx-auto max-w-7xl px-6 lg:px-2 mt-5">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm text-white backdrop-blur transition hover:bg-white/25"
          >
            <FaArrowLeft /> Back to adventures
          </button>

          <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)]">
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-6">
                <div className="max-w-2xl">
                  <p className="uppercase tracking-wide text-white/80">
                    {adventure.category.replace(/-/g, " ")}
                  </p>
                  <h1 className="mt-2 text-3xl font-bold leading-snug sm:text-4xl md:text-5xl">
                    {adventure.name}
                  </h1>
                  <p className="mt-3 flex items-center text-base text-white/90">
                    <FaMapMarkerAlt className="mr-2" />
                    {locationString}
                  </p>
                </div>
                <motion.button
                  type="button"
                  aria-label={inCart ? "Remove from Cart" : "Add to Cart"}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={async () => {
                    try {
                      if (inCart) {
                        await removeFromCart(adventure._id, "Adventure");
                        toast.success("Removed from cart");
                      } else {
                        await addToCart(adventure._id, "Adventure", 1);
                        toast.success("Added to cart!");
                      }
                    } catch (err: any) {
                      toast.error(err.message || "Failed to update cart");
                    }
                  }}
                  disabled={cartLoading}
                  className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-colors cursor-pointer ${cartLoading ? "cursor-not-allowed opacity-60" : ""
                    } ${inCart ? "bg-green-600 text-green-50 hover:bg-green-700" : "bg-green-50 text-green-600 hover:bg-green-100"
                    }`}
                >
                  <FaShoppingCart className="text-xl" />
                </motion.button>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm text-white/90">
                {hasRating && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 font-semibold">
                    <FaStar className="text-yellow-300" /> {adventure.rating!.average.toFixed(1)} · {adventure.rating!.count} reviews
                  </span>
                )}
                <a
                  href={mapDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 font-semibold transition hover:bg-white/25"
                >
                  <FaMapMarkerAlt /> View on map
                </a>
                {adventure.tags?.slice(0, 3).map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 font-semibold">
                    <FaTag /> {tag}
                  </span>
                ))}
              </div>

              {adventure.heroHighlights?.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {adventure.heroHighlights.slice(0, 3).map((highlight) => (
                    <div
                      key={highlight}
                      className="rounded-2xl bg-white/15 px-4 py-3 text-sm font-medium text-white shadow-sm backdrop-blur"
                    >
                      {highlight}
                    </div>
                  ))}
                </div>
              )}

              {(displayDuration || displayCapacity || displayPrice || (showDifficulty && difficultyValue)) && (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {displayDuration && (
                    <div className="rounded-2xl bg-white/15 px-4 py-3 text-sm text-white/90">
                      <p className="text-xs uppercase tracking-wide text-white/70">Duration</p>
                      <p className="mt-1 text-base font-semibold">{displayDuration}</p>
                    </div>
                  )}
                  {displayCapacity != null && (
                    <div className="rounded-2xl bg-white/15 px-4 py-3 text-sm text-white/90">
                      <p className="text-xs uppercase tracking-wide text-white/70">Capacity</p>
                      <p className="mt-1 text-base font-semibold">{displayCapacity} guests</p>
                    </div>
                  )}
                  {displayPrice != null && (
                    <div className="rounded-2xl bg-white/15 px-4 py-3 text-sm text-white/90">
                      <p className="text-xs uppercase tracking-wide text-white/70">Price</p>
                      <p className="mt-1 text-base font-semibold">₹{displayPrice.toLocaleString()}</p>
                      <p className="text-xs text-white/70">per day</p>
                    </div>
                  )}
                  {showDifficulty && difficultyValue && (
                    <div className="rounded-2xl bg-white/15 px-4 py-3 text-sm text-white/90">
                      <p className="text-xs uppercase tracking-wide text-white/70">Difficulty</p>
                      <p className="mt-1 text-base font-semibold">{difficultyValue}</p>
                    </div>
                  )}
                </div>
              )}

              {displayFeatures.length > 0 && (
                <div className="flex flex-wrap gap-2 text-xs text-white/90">
                  {displayFeatures.slice(0, 6).map((feature) => (
                    <span
                      key={feature}
                      className="rounded-full bg-white/15 px-3 py-1 font-semibold backdrop-blur"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="w-full max-w-xl rounded-2xl bg-white/95 p-6 text-gray-900 shadow-lg backdrop-blur">
              <h2 className="text-lg font-semibold text-gray-900">Plan your adventure</h2>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm text-gray-700">
                  Start
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      const v = e.target.value;
                      setStartDate(v);
                      if (new Date(v) >= new Date(endDate)) {
                        const next = new Date(v);
                        next.setDate(next.getDate() + 1);
                        setEndDate(formatDateInput(next));
                      }
                    }}
                    className="rounded-lg border border-gray-200 px-3 py-2 focus:border-green-500 focus:outline-none"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm text-gray-700">
                  End
                  <input
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="rounded-lg border border-gray-200 px-3 py-2 focus:border-green-500 focus:outline-none"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm text-gray-700">
                  Adults
                  <input
                    type="number"
                    min={1}
                    value={adults}
                    onChange={(e) => setAdults(Math.max(1, Number(e.target.value)))}
                    className="rounded-lg border border-gray-200 px-3 py-2 focus:border-green-500 focus:outline-none"
                  />
                </label>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                  <label className="flex flex-col gap-1">
                    Children
                    <input
                      type="number"
                      min={0}
                      value={children}
                      onChange={(e) => setChildren(Math.max(0, Number(e.target.value)))}
                      className="rounded-lg border border-gray-200 px-3 py-2 focus:border-green-500 focus:outline-none"
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    Infants
                    <input
                      type="number"
                      min={0}
                      value={infants}
                      onChange={(e) => setInfants(Math.max(0, Number(e.target.value)))}
                      className="rounded-lg border border-gray-200 px-3 py-2 focus:border-green-500 focus:outline-none"
                    />
                  </label>
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-600">Days: {days}</p>
              <div
                className={`rounded-2xl border px-4 py-3 text-sm ${soldOutForDates
                  ? "border-rose-200 bg-rose-50 text-rose-700"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
                  }`}
              >
                {availability.loading && "Checking availability…"}
                {!availability.loading && !availability.error && (
                  <span>
                    {soldOutForDates
                      ? "These dates are sold out. Please select another range."
                      : "These dates are available."}
                  </span>
                )}
                {availability.error && (
                  <span className="text-rose-600">Unable to check availability. Please refresh.</span>
                )}
                {!availability.loading && bookedSummaries.length > 0 && (
                  <p className="mt-2 text-xs text-gray-600">
                    Upcoming booked dates:{" "}
                    {bookedSummaries
                      .map((range) => `${formatDateDisplay(range.start)} – ${formatDateDisplay(range.end)}`)
                      .join(", ")}
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  const target = document.getElementById("adventure-availability");
                  if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="mt-4 w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-green-700"
              >
                View available options
              </button>
              <a
                href={mapDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex w-full items-center justify-center gap-2 text-sm font-medium text-white/90 hover:text-white"
              >
                <FaMapMarkerAlt /> Open in Google Maps
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto  max-w-7xl px-6 pb-16 lg:px-2 mt-10">
        <section className="grid gap-6 rounded-3xl bg-white p-6 shadow md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="flex flex-col justify-between space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Adventure location</h2>
              <p className="mt-2 text-sm text-gray-600">
                Get inspired by the terrain and surroundings. Check the trailhead or meetup point in advance.
              </p>
            </div>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-green-600" />
                <span>{adventure.location.city}, {adventure.location.state}</span>
              </div>
              <a
                href={mapDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-100"
              >
                <FaMapMarkerAlt /> Open in Google Maps
              </a>
            </div>
          </div>
          <div className="h-72 w-full overflow-hidden rounded-2xl border border-gray-100 shadow-inner">
            <iframe
              src={mapEmbedUrl}
              title={`${adventure.name} map`}
              loading="lazy"
              className="h-full w-full"
              allowFullScreen
            />
          </div>
        </section>

        <section className="grid gap-4 rounded-3xl bg-white p-6 shadow-xl md:grid-cols-5 mt-10">
          <div className="relative h-64 w-full overflow-hidden rounded-2xl md:col-span-3">
            {images.length ? (
              <Image src={images[galleryIndex]} alt={adventure.name} fill className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center bg-gray-100 text-gray-500">No photos</div>
            )}
            {images.length > 0 && (
              <button
                type="button"
                onClick={() => setGalleryOpen(true)}
                className="absolute bottom-4 right-4 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-gray-800 shadow"
              >
                View all
              </button>
            )}
          </div>
          <div className="grid gap-4 md:col-span-2">
            {images.slice(1, 4).map((src, i) => (
              <div key={src + i} className="relative h-32 overflow-hidden rounded-2xl">
                <Image src={src} alt={`photo ${i + 2}`} fill className="object-cover" />
              </div>
            ))}
            {images.length <= 1 && (
              <div className="flex h-32 items-center justify-center rounded-2xl bg-gray-100 text-gray-500">
                More images coming soon
              </div>
            )}
          </div>
        </section>

        {facilities.length > 0 && (
          <section className="rounded-3xl bg-white p-6 shadow mt-10">
            <h2 className="text-xl font-semibold text-gray-900">Popular facilities</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {facilities.map((f) => (
                <span
                  key={f}
                  className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-1 text-sm font-medium text-green-700"
                >
                  <span className="text-base leading-none">{getFacilityIcon(f)}</span>
                  {f}
                </span>
              ))}
            </div>
          </section>
        )}

        {adventure.curatedHighlights && adventure.curatedHighlights.length > 0 && (
          <section className="rounded-3xl bg-white p-6 shadow mt-10">
            <h2 className="text-xl font-semibold text-gray-900">Why guests love it</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {adventure.curatedHighlights.map((item, i) => (
                <div
                  key={item.title + i}
                  className="flex gap-3 rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-800"
                >
                  <div className="mt-1 text-lg text-green-600">{item.icon ? <i className={item.icon} /> : <FaCheck />}</div>
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    {item.description && <p className="mt-1 text-green-700/90">{item.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="rounded-3xl bg-white p-6 shadow mt-10">
          <h2 className="text-xl font-semibold text-gray-900">Detailed itinerary</h2>
          <p className="mt-2 text-sm text-gray-600">Get a day-by-day look at how the experience unfolds.</p>
          {(Array.isArray(adventure.itinerary) && adventure.itinerary.length > 0) ? (
            <div className="mt-4 space-y-4">
              {adventure.itinerary.map((day, idx) => {
                const html = idx < itineraryHtml.length ? itineraryHtml[idx] : "";
                const heading = day.heading?.trim() || "";
                const rawDescription = typeof day.description === "string" ? day.description : "";
                const plainDescription = stripRichTextTags(rawDescription).trim();

                return (
                  <div
                    key={(heading || "day") + idx}
                    className="flex gap-4 rounded-2xl border border-gray-100 bg-gray-50/60 p-4 shadow-sm"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-lg font-semibold text-green-700">
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{heading || `Day ${idx + 1}`}</h3>
                      {html ? (
                        <div
                          className="mt-2 text-sm leading-relaxed text-gray-700"
                          dangerouslySetInnerHTML={{ __html: html }}
                        />
                      ) : plainDescription ? (
                        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-700">
                          {plainDescription}
                        </p>
                      ) : (
                        <p className="mt-2 text-sm text-gray-500">Vendor will add more details soon.</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
              The vendor will publish a day-by-day schedule soon.
            </p>
          )}
        </section>

        <section className="rounded-3xl bg-white p-6 shadow mt-10">
          <h2 className="text-xl font-semibold text-gray-900">What&apos;s included</h2>
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">Inclusions</h3>
              {(adventure.inclusions && hasRichTextContent(adventure.inclusions)) ? (
                inclusionList.length > 0 ? (
                  <ul className="mt-3 space-y-2 text-sm text-gray-700">
                    {inclusionList.map((item, idx) => (
                      <li key={item + idx} className="flex items-start gap-2">
                        <FaCheck className="mt-0.5 text-green-600" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : inclusionHtml ? (
                  <div
                    className="mt-3 text-sm leading-relaxed text-gray-700"
                    dangerouslySetInnerHTML={{ __html: inclusionHtml }}
                  />
                ) : (
                  <p className="mt-3 text-sm text-gray-500">Inclusion details coming soon.</p>
                )
              ) : (
                <p className="mt-3 text-sm text-gray-500">Inclusion details coming soon.</p>
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">Exclusions</h3>
              {(adventure.exclusions && hasRichTextContent(adventure.exclusions)) ? (
                exclusionList.length > 0 ? (
                  <ul className="mt-3 space-y-2 text-sm text-gray-700">
                    {exclusionList.map((item, idx) => (
                      <li key={item + idx} className="flex items-start gap-2">
                        <FaTimes className="mt-0.5 text-rose-500" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : exclusionHtml ? (
                  <div
                    className="mt-3 text-sm leading-relaxed text-gray-700"
                    dangerouslySetInnerHTML={{ __html: exclusionHtml }}
                  />
                ) : (
                  <p className="mt-3 text-sm text-gray-500">Exclusion details coming soon.</p>
                )
              ) : (
                <p className="mt-3 text-sm text-gray-500">Exclusion details coming soon.</p>
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">Policy & terms</h3>
              {(adventure.policyTerms && hasRichTextContent(adventure.policyTerms)) ? (
                policyTermsList.length > 0 ? (
                  <ul className="mt-3 space-y-2 text-sm text-gray-700">
                    {policyTermsList.map((item, idx) => (
                      <li key={item + idx} className="flex items-start gap-2">
                        <FaShieldAlt className="mt-0.5 text-indigo-500" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : policyHtml ? (
                  <div
                    className="mt-3 text-sm leading-relaxed text-gray-700"
                    dangerouslySetInnerHTML={{ __html: policyHtml }}
                  />
                ) : (
                  <p className="mt-3 text-sm text-gray-500">Policy details coming soon.</p>
                )
              ) : (
                <p className="mt-3 text-sm text-gray-500">Policy details coming soon.</p>
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-6 rounded-3xl bg-white p-6 shadow md:grid-cols-2 mt-10">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">About this adventure</h2>
            <h3 className="mt-2 text-lg font-semibold text-gray-800">{adventure.about.heading}</h3>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-700">
              {adventure.about.description}
            </p>
            {adventure.vendorMessage && (
              <div className="mt-4 rounded-2xl bg-green-50 p-4 text-sm text-green-800">
                <p className="font-semibold">Vendor message</p>
                <p className="mt-2 whitespace-pre-line">{adventure.vendorMessage}</p>
              </div>
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Rules</h2>
            <div className="mt-3 space-y-3 rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
              {adventure.defaultHouseRules && adventure.defaultHouseRules.length > 0 && (
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {adventure.defaultHouseRules.map((r, i) => (
                    <li key={r + i}>{r}</li>
                  ))}
                </ul>
              )}
            </div>
            {adventure.defaultCancellationPolicy && (
              <div className="mt-3 rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
                <p className="font-semibold text-gray-900">Cancellation policy</p>
                <p className="mt-2 whitespace-pre-line">{adventure.defaultCancellationPolicy}</p>
              </div>
            )}
          </div>
        </section>

        <section id="adventure-availability" className="space-y-5 rounded-3xl bg-white p-6 shadow mt-10">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Availability</h2>
              <p className="text-sm text-gray-600">
                Choose the experiences you’d like to join for {days} day{days === 1 ? "" : "s"}.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-semibold text-green-700">
              <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1">
                <FaCheck /> Expert guides
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1">
                <FaInfoCircle /> Safety briefings included
              </span>
            </div>
          </div>

          <div
            className={`rounded-2xl border px-4 py-3 text-sm ${soldOutForDates
              ? "border-rose-200 bg-rose-50 text-rose-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
              }`}
          >
            {availability.loading && "Checking availability…"}
            {!availability.loading && !availability.error && (
              <span>
                {soldOutForDates ? "Sold out for these dates." : "Available for these dates."}
              </span>
            )}
            {availability.error && (
              <span className="text-rose-600">Unable to load availability. Please try again.</span>
            )}
            {!availability.loading && bookedSummaries.length > 0 && (
              <span className="mt-1 block text-xs text-gray-600">
                Booked:{" "}
                {bookedSummaries
                  .map((range) => `${formatDateDisplay(range.start)} – ${formatDateDisplay(range.end)}`)
                  .join(", ")}
              </span>
            )}
          </div>

          <div className={`overflow-x-auto rounded-2xl border border-gray-200 ${soldOutForDates ? "pointer-events-none opacity-60" : ""}`}>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Adventure</th>
                  <th className="px-4 py-3">Details</th>
                  <th className="px-4 py-3">Price / day</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {adventure.options.map((opt, idx) => {
                  const key = opt._id?.toString() || opt.name;
                  const qty = optionSelections[key] || 0;
                  const isSelected = qty > 0;
                  const isExpanded = expandedOptionKey === key;
                  const available = opt.available ?? 0;
                  const taxesNote = opt.taxes ? `Taxes ₹${opt.taxes.toLocaleString()} extra` : "Taxes included";
                  const optionUnavailable = available <= 0 || isOptionUnavailable(key);

                  return (
                    <Fragment key={key}>
                      <tr className={isSelected ? "bg-green-50/60 transition" : "transition hover:bg-gray-50/60"}>
                        <td className="align-top px-4 py-4 text-sm text-gray-700">
                          <div className="flex flex-col gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-base font-semibold text-gray-900">{opt.name}</span>
                              {isSelected && (
                                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                                  Selected
                                </span>
                              )}
                              {optionUnavailable && (
                                <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700">
                                  Sold out
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">
                              <FaClock className="mr-1 inline text-green-500" />
                              {opt.duration} · Difficulty: {opt.difficulty}
                            </p>
                            {opt.description && (
                              <p className="text-sm text-gray-600">{opt.description}</p>
                            )}
                          </div>
                        </td>
                        <td className="align-top px-4 py-4 text-sm text-gray-700">
                          <div className="flex flex-col gap-2">
                            {opt.features?.length ? (
                              <div className="flex flex-wrap gap-1 text-xs text-gray-500">
                                {opt.features.slice(0, 3).map((feature) => (
                                  <span key={feature} className="rounded-full bg-gray-100 px-2 py-0.5">
                                    {feature}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">Highlights coming soon</span>
                            )}
                            {opt.amenities?.length ? (
                              <div className="flex flex-wrap gap-1 text-xs text-gray-500">
                                {opt.amenities.slice(0, 3).map((amenity) => (
                                  <span key={amenity} className="rounded-full bg-gray-100 px-2 py-0.5">
                                    {amenity}
                                  </span>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        </td>
                        <td className="align-top px-4 py-4 text-sm text-gray-700">
                          <div className="flex flex-col">
                            <span className="text-lg font-semibold text-gray-900">₹{opt.price.toLocaleString()}</span>
                            <span className="text-xs text-gray-500">{taxesNote}</span>
                          </div>
                        </td>
                        <td className="align-top px-4 py-4">
                          <div className="flex flex-col items-stretch gap-3 text-sm sm:flex-row sm:items-center sm:justify-end">
                            <button
                              type="button"
                              onClick={() => setExpandedOptionKey(isExpanded ? null : key)}
                              className="inline-flex items-center justify-center rounded-full border border-gray-200 px-4 py-2 font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
                            >
                              {isExpanded ? "Hide details" : "Show details"}
                            </button>
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => stepQuantity(key, -1, available)}
                                disabled={qty <= 0 || optionUnavailable}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-lg font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                –
                              </button>
                              <span className="min-w-[2ch] text-center text-sm font-semibold text-gray-900">{qty}</span>
                              <button
                                type="button"
                                onClick={() => stepQuantity(key, 1, available)}
                                disabled={available <= 0 || qty >= available || optionUnavailable}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-lg font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                +
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => toggleSelection(key, available)}
                              disabled={optionUnavailable}
                              className={`inline-flex items-center justify-center rounded-full px-4 py-2 font-semibold transition ${isSelected
                                ? "bg-green-600 text-white shadow hover:bg-green-700"
                                : "border border-green-600 text-green-700 hover:bg-green-50 disabled:border-gray-300 disabled:text-gray-400"
                                } ${optionUnavailable
                                  ? "cursor-not-allowed border border-gray-200 bg-gray-100 text-gray-400"
                                  : ""
                                }`}
                            >
                              {optionUnavailable ? "Unavailable" : isSelected ? "Selected" : "Select"}
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={4} className="bg-gray-50 px-4 py-6">
                            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
                              <div className="space-y-4">
                                <div className="grid gap-3 sm:grid-cols-3">
                                  {opt.images?.slice(0, 3).map((src, i) => (
                                    <div key={src + i} className="relative h-28 overflow-hidden rounded-xl">
                                      <Image src={src} alt={`${opt.name} photo ${i + 1}`} fill className="object-cover" />
                                    </div>
                                  ))}
                                  {opt.images && opt.images.length > 3 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveOptionIdx(idx);
                                        setOptionImgIdx(0);
                                      }}
                                      className="flex h-28 items-center justify-center rounded-xl border border-dashed border-gray-300 text-xs font-semibold text-gray-600 transition hover:border-gray-400 hover:text-gray-800"
                                    >
                                      View {opt.images.length - 3} more photos
                                    </button>
                                  )}
                                </div>
                                {opt.description && (
                                  <p className="text-sm leading-relaxed text-gray-700">{opt.description}</p>
                                )}
                              </div>

                              <div className="space-y-4 text-sm text-gray-700">
                                {opt.amenities?.length ? (
                                  <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Inclusions</p>
                                    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                      {opt.amenities.slice(0, 8).map((amenity) => (
                                        <span key={amenity} className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-sm">
                                          <span className="text-orange-600">{getFacilityIcon(amenity)}</span>
                                          <span>{amenity}</span>
                                        </span>
                                      ))}
                                    </div>
                                    {opt.amenities.length > 8 && (
                                      <p className="mt-2 text-xs text-gray-500">
                                        +{opt.amenities.length - 8} more inclusions
                                      </p>
                                    )}
                                  </div>
                                ) : null}

                                {opt.features?.length ? (
                                  <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Highlights</p>
                                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
                                      {opt.features.map((feature) => (
                                        <span key={feature} className="rounded-full bg-gray-100 px-3 py-1">
                                          {feature}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section id="adventure-booking-summary" className="grid gap-6 rounded-3xl bg-white p-6 shadow md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] mt-10">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Booking summary</h2>
            <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
              <p className="flex items-center gap-2">
                <FaCalendarAlt /> {days} day{days === 1 ? "" : "s"}
              </p>
              <p className="mt-2 flex items-center gap-2">
                <FaUsers /> {adults} adult{adults === 1 ? "" : "s"}
                {children > 0 && ` · ${children} child${children === 1 ? "" : "ren"}`}
                {infants > 0 && ` · ${infants} infant${infants === 1 ? "" : "s"}`}
              </p>
              <p className="mt-2 text-gray-600">Options: {pricing.totalOptions}</p>
              <div className="mt-4 space-y-2 border-t border-gray-200 pt-3 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{pricing.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes & fees</span>
                  <span>₹{pricing.taxes.toLocaleString()}</span>
                </div>
                {pricing.totalOptions > 0 && (
                  <div className="flex justify-between">
                    <span>Platform fee</span>
                    <span>₹{platformFee.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-semibold text-gray-900">
                  <span>Total</span>
                  <span>₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
            {!pricing.totalOptions && (
              <p className="text-xs text-rose-600">
                Select at least one option above to continue.
              </p>
            )}
            {soldOutForDates && (
              <p className="text-xs text-rose-600">
                These dates are sold out. Choose different dates to continue.
              </p>
            )}
            <button
              type="button"
              onClick={handleBookNow}
              disabled={!pricing.totalOptions || soldOutForDates}
              className="w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {soldOutForDates
                ? "Unavailable for these dates"
                : pricing.totalOptions
                  ? "Book now"
                  : "Select an option to book"}
            </button>
          </div>

          <div className="flex flex-col justify-between rounded-2xl bg-linear-to-br from-green-50 via-white to-green-100 p-5 text-sm text-gray-700 shadow-inner">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">What happens next?</h3>
              <p>Clicking <strong>Book now</strong> will take you to a dedicated page where you can:</p>
              <ul className="ml-4 list-disc space-y-2 text-sm">
                <li>Review your adventure summary and price breakdown</li>
                <li>Provide traveller and emergency contact details</li>
                <li>Add special requests before submitting the reservation</li>
              </ul>
            </div>
            <p className="mt-4 text-xs text-gray-500">
              We hold your selection for a short time. Complete the form on the next page to confirm your booking.
            </p>
          </div>
        </section>

        {adventure.amenities && Object.keys(adventure.amenities).length > 0 && (
          <section className="rounded-3xl bg-white p-6 shadow mt-10">
            <h2 className="text-xl font-semibold text-gray-900">Amenities</h2>
            <div className="mt-4 grid gap-6 md:grid-cols-2">
              {Object.entries(adventure.amenities).map(([cat, items]) => (
                <div key={cat}>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">{cat}</h3>
                  <ul className="mt-3 space-y-2 text-sm text-gray-700">
                    {items.map((it, i) => (
                      <li key={it + i} className="flex items-start gap-3">
                        <span className="mt-0.5 text-green-600">{getFacilityIcon(it)}</span>
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Videos */}
        {(adventure.videos?.inside?.length ?? 0) > 0 || (adventure.videos?.outside?.length ?? 0) > 0 ? (
          <section className="rounded-3xl bg-white p-6 shadow mt-10">
            <h2 className="text-xl font-semibold text-gray-900">Experience in motion</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {["inside", "outside"].map((key) => {
                const videos = adventure.videos?.[key as keyof typeof adventure.videos] ?? [];
                return (
                  <div key={key} className="space-y-3">
                    <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-600">
                      <FaVideo /> {key === "inside" ? "Inside" : "Outside"} walk-through
                    </h3>
                    {videos.length > 0 ? (
                      videos.map((videoUrl: string, idx: number) => (
                        <video
                          key={videoUrl + idx}
                          controls
                          className="h-48 w-full overflow-hidden rounded-2xl bg-black object-cover"
                        >
                          <source src={videoUrl} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No video available.</p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}

        {/* Reviews Section */}
        <ReviewDisplay targetId={adventure._id} targetType="Adventure" />
      </main>

      {/* Gallery Lightbox */}
      {galleryOpen && images.length > 0 && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/95 backdrop-blur-sm">
          {/* Close Button */}
          <button
            type="button"
            onClick={() => setGalleryOpen(false)}
            className="absolute right-6 top-6 z-[1010] flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 hover:scale-105 active:scale-95"
            aria-label="Close gallery"
          >
            <FaTimes className="text-xl" />
          </button>

          {/* Main Image Container */}
          <div className="relative flex h-full w-full flex-col items-center justify-center px-4 md:px-20 py-20">
            {/* Left Arrow */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setGalleryIndex((prev) => (prev - 1 + images.length) % images.length);
              }}
              className="absolute left-4 top-1/2 z-[1010] -translate-y-1/2 flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20 hover:scale-110 active:scale-95 md:left-8"
              aria-label="Previous image"
            >
              <FaChevronLeft className="text-2xl" />
            </button>

            {/* Image */}
            <div className="relative h-full w-full max-w-7xl animate-in fade-in zoom-in-95 duration-300">
              {/* Use key to trigger animation on change if desired, or just standard Next.js Image optimization */}
              <Image
                key={galleryIndex}
                src={images[galleryIndex]}
                alt={`Gallery photo ${galleryIndex + 1}`}
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Right Arrow */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setGalleryIndex((prev) => (prev + 1) % images.length);
              }}
              className="absolute right-4 top-1/2 z-[1010] -translate-y-1/2 flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20 hover:scale-110 active:scale-95 md:right-8"
              aria-label="Next image"
            >
              <FaChevronRight className="text-2xl" />
            </button>

            {/* Thumbnails Strip */}
            <div className="absolute bottom-6 left-1/2 z-[1010] flex max-w-[90vw] -translate-x-1/2 gap-3 overflow-x-auto rounded-2xl bg-black/60 p-3 backdrop-blur-md scrollbar-hide">
              {images.map((img, idx) => (
                <button
                  key={img + idx}
                  onClick={() => setGalleryIndex(idx)}
                  className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-lg transition-all ${galleryIndex === idx
                    ? "ring-2 ring-white scale-105 opacity-100"
                    : "opacity-50 hover:opacity-100 hover:scale-105"
                    }`}
                >
                  <Image src={img} alt={`Thumb ${idx}`} fill className="object-cover" />
                </button>
              ))}
            </div>

            {/* Counter */}
            <div className="absolute top-6 left-6 z-[1010] rounded-full bg-black/50 px-4 py-2 text-sm font-medium text-white backdrop-blur-md">
              {galleryIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}

      {activeOptionIdx !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <button
            type="button"
            onClick={() => setActiveOptionIdx(null)}
            className="absolute right-6 top-6 rounded-full bg-white/20 px-3 py-1 text-sm text-white shadow"
          >
            Close
          </button>
          <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900">{adventure.options[activeOptionIdx].name}</h3>
            <div className="relative mt-4 h-72 overflow-hidden rounded-2xl">
              <Image
                src={adventure.options[activeOptionIdx].images[optionImgIdx]}
                alt="option image"
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() =>
                  setOptionImgIdx(
                    (i) =>
                      (i - 1 + adventure.options[activeOptionIdx].images.length) %
                      adventure.options[activeOptionIdx].images.length
                  )
                }
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white"
              >
                <FaChevronLeft />
              </button>
              <button
                type="button"
                onClick={() =>
                  setOptionImgIdx(
                    (i) => (i + 1) % adventure.options[activeOptionIdx].images.length
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white"
              >
                <FaChevronRight />
              </button>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {adventure.options[activeOptionIdx].images.map((src, i) => (
                <button
                  key={src + i}
                  type="button"
                  onClick={() => setOptionImgIdx(i)}
                  className={`relative h-20 overflow-hidden rounded-lg ${optionImgIdx === i ? "ring-2 ring-green-500" : ""}`}
                >
                  <Image src={src} alt="thumb" fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdventureDetailClient;