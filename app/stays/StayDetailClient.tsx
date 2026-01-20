//stays/stayDetailClient.tsx
"use client";

import { Fragment, useMemo, useState, type JSX } from "react";
import Image from "next/image";
import {
  FaArrowLeft,
  FaBed,
  FaCalendarAlt,
  FaCheck,
  FaChevronLeft,
  FaChevronRight,
  FaShoppingCart,
  FaMapMarkerAlt,
  FaTag,
  FaUsers,
  FaVideo,
  FaWifi,
  FaParking,
  FaSpa,
  FaTimes,
  FaUtensils,
  FaGlassCheers,
  FaCoffee,
  FaDumbbell,
  FaConciergeBell,
  FaChild,
  FaShieldAlt,
  FaWheelchair,
  FaAccessibleIcon,
  FaBath,
  FaShower,
  FaTv,
  FaSnowflake,
  FaHotjar,
  FaSwimmer,
  FaStar,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useCart } from "../hooks/useCart";
import { useAvailability } from "../hooks/useAvailability";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import ReviewDisplay from "../components/Reviews/ReviewDisplay";

export type StayDetailPayload = {
  _id: string;
  name: string;
  vendorId: string;
  category: "rooms" | "hotels" | "homestays" | "bnbs";
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
  };
  heroHighlights: string[];
  curatedHighlights?: Array<{ title: string; description?: string; icon?: string }>;
  tags?: string[];
  rating?: {
    average: number;
    count: number;
  };
  images: string[];
  gallery: string[];
  videos: {
    inside?: string[];
    outside?: string[];
  };
  popularFacilities: string[];
  amenities: Record<string, string[]>;
  meals?: string[]; // For homestays
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
  rooms: Array<{
    _id?: string;
    name: string;
    description?: string;
    bedType: string;
    beds: number;
    capacity: number;
    price: number;
    taxes?: number;
    currency?: string;
    size?: string;
    features: string[];
    amenities: string[];
    available: number;
    images: string[];
    isRefundable?: boolean;
    refundableUntilHours?: number;
  }>;
  defaultCancellationPolicy?: string;
  defaultHouseRules?: string[];
  about: {
    heading: string;
    description: string;
  };
  checkInOutRules: {
    checkIn: string;
    checkOut: string;
    rules: string[];
  };
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
};

const getFacilityIcon = (label: string) => {
  const key = label.toLowerCase();
  const match = Object.entries(facilityIconMap).find(([term]) => key.includes(term));
  return match ? match[1] : <FaCheck />;
};

const formatDateInput = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
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

const calculateNights = (checkIn: string, checkOut: string) => {
  if (!checkIn || !checkOut) return 1;
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  if (Number.isNaN(inDate.getTime()) || Number.isNaN(outDate.getTime()) || outDate <= inDate) return 1;
  return Math.max(1, Math.ceil((outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24)));
};

const getDefaultDates = () => {
  const today = new Date();
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  return {
    checkIn: formatDateInput(today),
    checkOut: formatDateInput(tomorrow),
  };
};

interface StayDetailClientProps {
  stay: StayDetailPayload;
}

const StayDetailClient: React.FC<StayDetailClientProps> = ({ stay }) => {
  const router = useRouter();
  const { addToCart, removeFromCart, isInCart, loading: cartLoading } = useCart({ autoLoad: true });

  const inCart = isInCart(stay._id, "Stay");

  const images = useMemo(() => {
    const galleryImages = Array.isArray(stay.gallery) ? stay.gallery : [];
    return [...stay.images, ...galleryImages].filter(Boolean);
  }, [stay.images, stay.gallery]);

  const { checkIn: defaultCheckIn, checkOut: defaultCheckOut } = useMemo(() => getDefaultDates(), []);

  const [checkIn, setCheckIn] = useState<string>(defaultCheckIn);
  const [checkOut, setCheckOut] = useState<string>(defaultCheckOut);
  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(0);
  const [infants, setInfants] = useState<number>(0);

  const initialSelections = useMemo(() => {
    const entries: Record<string, number> = {};
    stay.rooms.forEach((room) => {
      const roomKey = room._id?.toString() || room.name;
      entries[roomKey] = 0;
    });
    return entries;
  }, [stay.rooms]);

  const [roomSelections, setRoomSelections] = useState<Record<string, number>>(initialSelections);
  const [expandedRoomKey, setExpandedRoomKey] = useState<string | null>(null);

  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [activeRoomIndex, setActiveRoomIndex] = useState<number | null>(null);
  const [roomImageIndex, setRoomImageIndex] = useState(0);
  const activeRoomImages =
    activeRoomIndex !== null
      ? ((stay.rooms[activeRoomIndex]?.images || []) as string[]).filter(Boolean)
      : [];
  const showActiveRoomGallery = activeRoomIndex !== null && activeRoomImages.length > 0;

  const nights = useMemo(() => calculateNights(checkIn, checkOut), [checkIn, checkOut]);

  const isBnb = stay.category === "bnbs" && Boolean(stay.bnb);
  const availability = useAvailability("stay", stay._id, checkIn, checkOut);
  const availableRoomKeys = availability.availableOptionKeys ?? [];
  const bookedSummaries = availability.bookedRanges.slice(0, 3);
  const soldOutForDates =
    !availability.loading && stay.rooms.length > 0 && availableRoomKeys.length === 0;
  const isRoomUnavailable = (roomKey: string) => {
    if (availability.loading) return false;
    if (availableRoomKeys.length === 0) return soldOutForDates;
    return !availableRoomKeys.includes(roomKey);
  };

  const pricing = useMemo(() => {
    let subtotal = 0;
    let taxes = 0;
    const selectedRooms = stay.rooms.map((room) => {
      const roomKey = room._id?.toString() || room.name;
      const quantity = roomSelections[roomKey] || 0;
      if (!quantity) return null;
      const pricePerNight = room.price;
      const roomTaxes = room.taxes ?? 0;
      subtotal += pricePerNight * quantity * nights;
      taxes += roomTaxes * quantity * nights;
      return { room, quantity, pricePerNight, roomTaxes };
    });
    const totalRooms = selectedRooms.filter(Boolean).reduce((acc, item) => acc + (item?.quantity || 0), 0);
    const total = subtotal + taxes;
    return {
      subtotal,
      taxes,
      total,
      totalRooms,
      selectedRooms: selectedRooms.filter(Boolean) as Array<{
        room: StayDetailPayload["rooms"][number];
        quantity: number;
        pricePerNight: number;
        roomTaxes: number;
      }>,
    };
  }, [roomSelections, stay.rooms, nights]);

  const bnbPricing = useMemo(() => {
    if (!isBnb || !stay.bnb) return null;
    const pricePerNight = stay.bnb.price;
    const subtotal = pricePerNight * nights;
    return {
      pricePerNight,
      subtotal,
      total: subtotal,
    };
  }, [isBnb, stay.bnb, nights]);

  const platformFee = pricing.totalRooms ? 15 : 0;
  const grandTotal = pricing.total + platformFee;

  const toggleRoomSelection = (roomKey: string, available: number) => {
    if (available <= 0 || isRoomUnavailable(roomKey)) return;

    // Check if we are selecting (currently 0)
    const currentQty = roomSelections[roomKey] || 0;
    if (currentQty === 0) {
      setTimeout(() => {
        const el = document.getElementById("booking-summary");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }

    setRoomSelections((prev) => {
      const current = prev[roomKey] || 0;
      if (available <= 0) {
        return { ...prev, [roomKey]: 0 };
      }
      return { ...prev, [roomKey]: current > 0 ? 0 : 1 };
    });
  };

  const stepRoomQuantity = (roomKey: string, delta: number, maxAvailable: number) => {
    if (isRoomUnavailable(roomKey)) return;
    setRoomSelections((prev) => {
      const allowedMax = Math.max(0, maxAvailable);
      const current = prev[roomKey] || 0;
      const next = Math.min(Math.max(current + delta, 0), allowedMax);
      return { ...prev, [roomKey]: next };
    });
  };

  const handleBnbBooking = () => {
    if (!isBnb || !stay.bnb) return;
    const params = new URLSearchParams({
      checkIn,
      checkOut,
      adults: String(adults),
      children: String(children),
      infants: String(infants),
      bnb: "1",
    });
    router.push(`/stays/${stay._id}/book?${params.toString()}`);
  };

  const handleBookNow = () => {
    if (isBnb) {
      handleBnbBooking();
      return;
    }
    if (!pricing.totalRooms || soldOutForDates) return;

    const params = new URLSearchParams({
      checkIn,
      checkOut,
      adults: String(adults),
      children: String(children),
      infants: String(infants),
    });

    pricing.selectedRooms.forEach(({ room, quantity }) => {
      const roomKey = room._id?.toString() || room.name;
      params.append("rooms", `${roomKey}:${quantity}`);
    });

    router.push(`/stays/${stay._id}/book?${params.toString()}`);
  };

  const locationString = useMemo(
    () =>
      [stay.location.address, stay.location.city, stay.location.state, stay.location.country]
        .filter(Boolean)
        .join(", "),
    [stay.location.address, stay.location.city, stay.location.state, stay.location.country]
  );

  const mapEmbedUrl = useMemo(
    () => `https://www.google.com/maps?q=${encodeURIComponent(locationString)}&output=embed`,
    [locationString]
  );

  const mapDirectionsUrl = useMemo(
    () => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(locationString)}`,
    [locationString]
  );


  const stayFacilities = stay.popularFacilities || [];
  const hasRating = stay.rating?.average != null;

  return (
    <div className="min-h-screen bg-sky-50 text-black">
      <header className="relative isolate overflow-hidden bg-linear-to-br from-green-600 via-green-500 to-lime-400 pb-20 pt-16 text-white">

        <div className="relative mx-auto max-w-7xl px-6 lg:px-2 mt-5">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm text-white backdrop-blur transition hover:bg-white/25"
          >
            <FaArrowLeft /> Back to Stays
          </button>

          <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)]">
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-6">
                <div className="max-w-2xl">
                  <p className="uppercase tracking-wide text-white/80">{stay.category}</p>
                  <h1 className="mt-2 text-3xl font-bold leading-snug sm:text-4xl md:text-5xl">{stay.name}</h1>
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
                        await removeFromCart(stay._id, "Stay");
                        toast.success("Removed from cart");
                      } else {
                        await addToCart(stay._id, "Stay", 1);
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
                    <FaStar className="text-yellow-300" /> {stay.rating!.average.toFixed(1)} · {stay.rating!.count} reviews
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
                {stay.tags?.slice(0, 3).map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 font-semibold">
                    <FaTag /> {tag}
                  </span>
                ))}
              </div>

              {stay.heroHighlights?.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {stay.heroHighlights.slice(0, 3).map((highlight) => (
                    <div
                      key={highlight}
                      className="rounded-2xl bg-white/15 px-4 py-3 text-sm font-medium text-white shadow-sm backdrop-blur"
                    >
                      {highlight}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="h-full rounded-3xl bg-white/95 p-6 text-gray-900 shadow-lg backdrop-blur">
              <h2 className="text-lg font-semibold text-gray-900">Plan your stay</h2>
              <p className="mt-1 text-sm text-gray-600">Choose dates and guests just like you would on Booking.com.</p>
              <div className="mt-5 space-y-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="flex flex-col gap-1 text-sm text-gray-700">
                    Check-in
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => {
                        const value = e.target.value;
                        setCheckIn(value);
                        if (new Date(value) >= new Date(checkOut)) {
                          const next = new Date(value);
                          next.setDate(next.getDate() + 1);
                          setCheckOut(formatDateInput(next));
                        }
                      }}
                      className="rounded-lg border border-gray-200 px-3 py-2 focus:border-green-500 focus:outline-none"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-sm text-gray-700">
                    Check-out
                    <input
                      type="date"
                      value={checkOut}
                      min={checkIn}
                      onChange={(e) => setCheckOut(e.target.value)}
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
                <p className="text-sm text-gray-600">Staying for {nights} night{nights === 1 ? "" : "s"}.</p>
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
                        ? "These dates are sold out. Pick different dates to continue."
                        : "Great news — these dates are available."}
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
                  type="button"
                  onClick={() => {
                    const target = document.getElementById("availability-section");
                    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-green-700"
                >
                  View available rooms
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto mt-10 flex max-w-7xl flex-col gap-12 px-6 pb-16 lg:px-2">
        <section className="grid gap-6 rounded-3xl bg-white p-6 shadow md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="flex flex-col justify-between space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Stay location</h2>
              <p className="mt-2 text-sm text-gray-600">
                Nestled at {locationString}. Explore the neighbourhood and get directions instantly.
              </p>
            </div>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-green-600" />
                <span>{stay.location.city}, {stay.location.state}</span>
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
              title={`${stay.name} map`}
              loading="lazy"
              className="h-full w-full"
              allowFullScreen
            />
          </div>
        </section>

        <section className="grid gap-4 p-6 shadow-xl md:grid-cols-5 rounded-3xl">
          {/* LEFT SIDE - Large main image */}
          <div className="relative h-64 w-full overflow-hidden rounded-2xl md:col-span-3 md:h-[500px]">
            {images.length > 0 ? (
              <Image
                src={images[0]}
                alt={stay?.name || "Stay image"}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gray-100 text-gray-500">
                No photos
              </div>
            )}

            {/* View all photos button */}
            {images.length > 0 && (
              <button
                onClick={() => setGalleryOpen(true)}
                className="absolute bottom-4 right-4 rounded-lg bg-white/90 px-4 py-2 text-sm font-semibold text-gray-800 shadow-md hover:bg-white "
              >
                View all photos
              </button>
            )}
          </div>

          {/* RIGHT SIDE */}
          <div className="grid gap-4 md:col-span-2">
            {/* Top two medium images */}
            <div className="grid grid-cols-2 gap-4">
              {images[1] && (
                <div className="relative h-40 overflow-hidden rounded-2xl">
                  <Image
                    src={images[1]}
                    alt="photo 2"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              {images[2] && (
                <div className="relative h-40 overflow-hidden rounded-2xl">
                  <Image
                    src={images[2]}
                    alt="photo 3"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>

            {/* Bottom row thumbnails */}
            <div className="grid grid-cols-4 gap-2">
              {images.slice(3, 7).map((img, idx) => (
                <div
                  key={idx}
                  className="relative h-24 overflow-hidden rounded-xl bg-gray-100"
                >
                  <Image
                    src={img}
                    alt={`thumbnail ${idx}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}


            </div>
          </div>
        </section>

        {stayFacilities.length > 0 && (
          <section className="rounded-3xl bg-white p-6 shadow">
            <h2 className="text-xl font-semibold text-gray-900">Most popular facilities</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {stayFacilities.map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-1 text-sm font-medium text-green-700"
                >
                  <span className="text-base leading-none">{getFacilityIcon(badge)}</span>
                  {badge}
                </span>
              ))}
            </div>
          </section>
        )}

        {stay.curatedHighlights && stay.curatedHighlights.length > 0 && (
          <section className="rounded-3xl bg-white p-6 shadow">
            <h2 className="text-xl font-semibold text-gray-900">Why guests love this stay</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {stay.curatedHighlights.map((item, idx) => (
                <div key={item.title + idx} className="flex gap-3 rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-800">
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

        {/* Meals section for Homestays */}
        {stay.category === "homestays" && stay.meals && stay.meals.length > 0 && (
          <section className="rounded-3xl bg-white p-6 shadow">
            <h2 className="text-xl font-semibold text-gray-900">Meals Provided</h2>
            <p className="mt-2 text-sm text-gray-600">The following meals are provided during your stay:</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {stay.meals.map((meal) => (
                <span
                  key={meal}
                  className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-medium text-green-700"
                >
                  <FaUtensils className="text-green-600" />
                  {meal}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* BnB Details section */}
        {stay.category === "bnbs" && stay.bnb && (
          <section className="rounded-3xl bg-white p-6 shadow">
            <h2 className="text-xl font-semibold text-gray-900">BnB Details</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-gray-200 p-4">
                <p className="text-sm font-medium text-gray-500">Unit Type</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">{stay.bnb.unitType}</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-4">
                <p className="text-sm font-medium text-gray-500">Bedrooms</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">{stay.bnb.bedrooms}</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-4">
                <p className="text-sm font-medium text-gray-500">Bathrooms</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">{stay.bnb.bathrooms}</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-4">
                <p className="text-sm font-medium text-gray-500">Kitchen</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {stay.bnb.kitchenAvailable ? "Available" : "Not Available"}
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 p-4">
                <p className="text-sm font-medium text-gray-500">Total Beds</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">{stay.bnb.beds}</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-4">
                <p className="text-sm font-medium text-gray-500">Guest Capacity</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">{stay.bnb.capacity} guests</p>
              </div>
            </div>
            {stay.bnb.features && stay.bnb.features.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-500">Features</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {stay.bnb.features.map((feature) => (
                    <span
                      key={feature}
                      className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                    >
                      <FaCheck className="text-green-600" />
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4">
              <p className="text-sm font-medium text-gray-500">Price per night</p>
              <p className="mt-1 text-2xl font-bold text-green-700">₹{stay.bnb.price.toLocaleString()}</p>
            </div>
            <button
              type="button"
              onClick={handleBnbBooking}
              className="mt-4 inline-flex items-center justify-center rounded-full bg-green-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-green-700"
            >
              Book this BnB
            </button>
          </section>
        )}

        <section className="grid gap-6 rounded-3xl bg-white p-6 shadow md:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">About this stay</h2>
            <h3 className="mt-2 text-lg font-semibold text-gray-800">{stay.about.heading}</h3>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-700">
              {stay.about.description}
            </p>
            {stay.vendorMessage && (
              <div className="mt-4 rounded-2xl bg-green-50 p-4 text-sm text-green-800">
                <p className="font-semibold">Vendor message</p>
                <p className="mt-2 whitespace-pre-line">{stay.vendorMessage}</p>
              </div>
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Check-in & rules</h2>
            <div className="mt-3 space-y-3 rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
              <p>
                <span className="font-semibold text-gray-900">Check-in:</span> {stay.checkInOutRules.checkIn}
              </p>
              <p>
                <span className="font-semibold text-gray-900">Check-out:</span> {stay.checkInOutRules.checkOut}
              </p>
              {stay.checkInOutRules.rules?.length > 0 && (
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {stay.checkInOutRules.rules.map((rule, idx) => (
                    <li key={rule + idx}>{rule}</li>
                  ))}
                </ul>
              )}
            </div>
            {stay.defaultCancellationPolicy && (
              <div className="mt-3 rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
                <p className="font-semibold text-gray-900">Cancellation policy</p>
                <p className="mt-2 whitespace-pre-line">{stay.defaultCancellationPolicy}</p>
              </div>
            )}
            {stay.defaultHouseRules && stay.defaultHouseRules.length > 0 && (
              <div className="mt-3 rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
                <p className="font-semibold text-gray-900">House rules</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {stay.defaultHouseRules.map((rule, idx) => (
                    <li key={rule + idx}>{rule}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        <section id="availability-section" className="space-y-5 rounded-3xl bg-white p-6 shadow">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Availability</h2>
              <p className="text-sm text-gray-600">
                Pick your room for {nights} night{nights === 1 ? "" : "s"} — you can select multiple room types just like on Booking.com.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-semibold text-green-700">
              <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1">
                <FaCheck /> Instant confirmation
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1">
                <FaShieldAlt /> Secure booking
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
                {soldOutForDates
                  ? "Sold out for the selected dates."
                  : "Available for the selected dates."}
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

          {/* Rooms table - only show for hotels, homestays, and rooms categories */}
          {(stay.category === "hotels" || stay.category === "homestays" || stay.category === "rooms") && (
            <div className={`overflow-x-auto rounded-2xl border border-gray-200 ${soldOutForDates ? "pointer-events-none opacity-60" : ""}`}>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Room type</th>
                    <th className="px-4 py-3">Sleeps</th>
                    <th className="px-4 py-3">Price / night</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {stay.rooms.map((room, idx) => {
                    const roomImages = ((room.images || []) as string[]).filter(Boolean);
                    const hasRoomImages = roomImages.length > 0;
                    const roomKey = room._id?.toString() || room.name;
                    const quantity = roomSelections[roomKey] || 0;
                    const isSelected = quantity > 0;
                    const isExpanded = expandedRoomKey === roomKey;
                    const available = room.available ?? 0;
                    const taxesNote = room.taxes ? `Taxes ₹${room.taxes.toLocaleString()} extra` : "Taxes included";
                    const roomUnavailable = available <= 0 || isRoomUnavailable(roomKey);

                    return (
                      <Fragment key={roomKey}>
                        <tr className={isSelected ? "bg-green-50/60 transition" : "transition hover:bg-gray-50/60"}>
                          <td className="align-top px-4 py-4 text-sm text-gray-700">
                            <div className="flex flex-col gap-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-base font-semibold text-gray-900">{room.name}</span>
                                {isSelected && (
                                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                                    Selected
                                  </span>
                                )}
                                {roomUnavailable && (
                                  <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700">
                                    Sold out
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500">
                                {room.bedType} · {room.beds} bed{room.beds === 1 ? "" : "s"}
                              </p>
                              <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                                <span className="inline-flex items-center gap-1">
                                  <FaBed className="text-gray-400" /> Sleeps {room.capacity}
                                </span>
                                {room.isRefundable ? (
                                  <span className="inline-flex items-center gap-1 text-green-700">
                                    <FaCheck /> Free cancellation up to {room.refundableUntilHours ?? 48}h
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-amber-600">
                                    <FaShieldAlt /> Non-refundable
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="align-top px-4 py-4 text-sm text-gray-700">
                            <div className="flex flex-col gap-2">
                              <span className="inline-flex items-center gap-2">
                                <FaUsers className="text-gray-400" /> {room.capacity} guest{room.capacity === 1 ? "" : "s"}
                              </span>
                              {room.features?.length ? (
                                <div className="flex flex-wrap gap-1 text-xs text-gray-500">
                                  {room.features.slice(0, 3).map((feature) => (
                                    <span key={feature} className="rounded-full bg-gray-100 px-2 py-0.5">
                                      {feature}
                                    </span>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                          </td>
                          <td className="align-top px-4 py-4 text-sm text-gray-700">
                            <div className="flex flex-col">
                              <span className="text-lg font-semibold text-gray-900">₹{room.price.toLocaleString()}</span>
                              <span className="text-xs text-gray-500">{taxesNote}</span>
                            </div>
                          </td>
                          <td className="align-top px-4 py-4">
                            <div className="flex flex-col items-stretch gap-3 text-sm sm:flex-row sm:items-center sm:justify-end">
                              <button
                                type="button"
                                onClick={() => setExpandedRoomKey(isExpanded ? null : roomKey)}
                                className="inline-flex items-center justify-center rounded-full border border-gray-200 px-4 py-2 font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
                              >
                                {isExpanded ? "Hide details" : "Show details"}
                              </button>
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => stepRoomQuantity(roomKey, -1, available)}
                                  disabled={quantity <= 0 || roomUnavailable}
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-lg font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  –
                                </button>
                                <span className="min-w-[2ch] text-center text-sm font-semibold text-gray-900">{quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => stepRoomQuantity(roomKey, 1, available)}
                                  disabled={available <= 0 || quantity >= available || roomUnavailable}
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-lg font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  +
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={() => toggleRoomSelection(roomKey, available)}
                                disabled={roomUnavailable}
                                className={`inline-flex items-center justify-center rounded-full px-4 py-2 font-semibold transition ${isSelected
                                  ? "bg-green-600 text-white shadow hover:bg-green-700"
                                  : "border border-green-600 text-green-700 hover:bg-green-50 disabled:border-gray-300 disabled:text-gray-400"
                                  } ${roomUnavailable
                                    ? "cursor-not-allowed border border-gray-200 bg-gray-100 text-gray-400"
                                    : ""
                                  }`}
                              >
                                {roomUnavailable ? "Unavailable" : isSelected ? "Selected" : "Select"}
                              </button>
                            </div>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr>
                            <td colSpan={4} className="bg-gray-50 px-4 py-6">
                              <div className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
                                <div className="space-y-4">
                                  {room.description && (
                                    <p className="text-sm leading-relaxed text-gray-700">{room.description}</p>
                                  )}
                                  <div className="grid gap-3 sm:grid-cols-3">
                                    {roomImages.slice(0, 3).map((image, imageIdx) => (
                                      <div key={image + imageIdx} className="relative h-28 overflow-hidden rounded-xl">
                                        <Image src={image} alt={`${room.name} photo ${imageIdx + 1}`} fill className="object-cover" />
                                      </div>
                                    ))}
                                    {roomImages.length > 3 && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setActiveRoomIndex(idx);
                                          setRoomImageIndex(0);
                                        }}
                                        className="flex h-28 items-center justify-center rounded-xl border border-dashed border-gray-300 text-xs font-semibold text-gray-600 transition hover:border-gray-400 hover:text-gray-800"
                                      >
                                        View {roomImages.length - 3} more photos
                                      </button>
                                    )}
                                  </div>
                                  {room.size && (
                                    <p className="flex items-center gap-2 text-sm text-gray-600">
                                      <FaTag className="text-gray-400" /> Room size: {room.size}
                                    </p>
                                  )}
                                </div>

                                <div className="space-y-4 text-sm text-gray-700">
                                  {room.amenities?.length ? (
                                    <div>
                                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Room facilities</p>
                                      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                        {room.amenities.slice(0, 8).map((amenity) => (
                                          <span key={amenity} className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-sm">
                                            <span className="text-green-600">{getFacilityIcon(amenity)}</span>
                                            <span>{amenity}</span>
                                          </span>
                                        ))}
                                      </div>
                                      {room.amenities.length > 8 && (
                                        <p className="mt-2 text-xs text-gray-500">
                                          +{room.amenities.length - 8} more facilities
                                        </p>
                                      )}
                                    </div>
                                  ) : null}
                                  {room.features?.length ? (
                                    <div>
                                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Highlights</p>
                                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
                                        {room.features.map((feature) => (
                                          <span key={feature} className="rounded-full bg-gray-100 px-3 py-1">
                                            {feature}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  ) : null}
                                  {hasRoomImages && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveRoomIndex(idx);
                                        setRoomImageIndex(0);
                                      }}
                                      className="inline-flex items-center justify-center rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-100"
                                    >
                                      Open full gallery
                                    </button>
                                  )}
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
          )}
        </section>

        <section id="booking-summary" className="grid gap-6 rounded-3xl bg-white p-6 shadow md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Booking summary</h2>
            {isBnb && bnbPricing ? (
              <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
                <p className="flex items-center gap-2">
                  <FaCalendarAlt /> {nights} night{nights === 1 ? "" : "s"}
                </p>
                <p className="mt-2 flex items-center gap-2">
                  <FaUsers /> {adults} adult{adults === 1 ? "" : "s"}
                  {children > 0 && ` · ${children} child${children === 1 ? "" : "ren"}`}
                  {infants > 0 && ` · ${infants} infant${infants === 1 ? "" : "s"}`}
                </p>
                <div className="mt-4 space-y-2 border-t border-gray-200 pt-3 text-sm">
                  <div className="flex justify-between">
                    <span>Price per night</span>
                    <span>₹{bnbPricing.pricePerNight.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-base font-semibold text-gray-900">
                    <span>Total for stay</span>
                    <span>₹{bnbPricing.total.toLocaleString()}</span>
                  </div>
                </div>
                <p className="mt-3 text-xs text-gray-500">
                  Contact the host to finalize booking details for this BnB unit.
                </p>
                <button
                  type="button"
                  onClick={handleBnbBooking}
                  className="mt-4 w-full rounded-full bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow transition hover:bg-green-700"
                >
                  Book this BnB
                </button>
              </div>
            ) : (
              <>
                <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
                  <p className="flex items-center gap-2">
                    <FaCalendarAlt /> {nights} night{nights === 1 ? "" : "s"}
                  </p>
                  <p className="mt-2 flex items-center gap-2">
                    <FaUsers /> {adults} adult{adults === 1 ? "" : "s"}
                    {children > 0 && ` · ${children} child${children === 1 ? "" : "ren"}`}
                    {infants > 0 && ` · ${infants} infant${infants === 1 ? "" : "s"}`}
                  </p>
                  <p className="mt-2 text-gray-600">Rooms selected: {pricing.totalRooms}</p>
                  <div className="mt-4 space-y-2 border-t border-gray-200 pt-3 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹{pricing.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxes & fees</span>
                      <span>₹{pricing.taxes.toLocaleString()}</span>
                    </div>
                    {pricing.totalRooms > 0 && (
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

                {pricing.selectedRooms.length > 0 && (
                  <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-700 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Selected rooms</p>
                    <ul className="space-y-3">
                      {pricing.selectedRooms.map(({ room, quantity }) => (
                        <li key={(room._id as string) || room.name} className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-gray-900">{room.name}</p>
                            <p className="text-xs text-gray-500">
                              {quantity} room{quantity === 1 ? "" : "s"} · Sleeps {room.capacity}
                            </p>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">
                            ₹{(room.price * quantity).toLocaleString()}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {soldOutForDates && (
                  <p className="text-xs text-rose-600">
                    These dates are sold out. Choose different dates to continue.
                  </p>
                )}
                <button
                  type="button"
                  onClick={handleBookNow}
                  className="w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={!pricing.totalRooms || soldOutForDates}
                >
                  {soldOutForDates
                    ? "Unavailable for these dates"
                    : pricing.totalRooms
                      ? "Book now"
                      : "Select a room to book"}
                </button>
                {!pricing.totalRooms && (
                  <p className="text-xs text-amber-600">
                    Choose at least one room from the availability table above to continue.
                  </p>
                )}
              </>
            )}
          </div>

          <div className="flex flex-col justify-between rounded-2xl bg-linear-to-br from-green-50 via-white to-green-100 p-5 text-sm text-gray-700 shadow-inner">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">What happens next?</h3>
              {isBnb ? (
                <p>
                  Reach out to the host to finalize your BnB reservation and coordinate arrival details.
                </p>
              ) : (
                <>
                  <p>
                    Clicking <strong>Book now</strong> will take you to a dedicated page where you can:
                  </p>
                  <ul className="ml-4 list-disc space-y-2 text-sm">
                    <li>Review your stay summary and price breakdown</li>
                    <li>Provide guest details like name, email, phone, and address</li>
                    <li>Add special requests before submitting the reservation</li>
                  </ul>
                </>
              )}
            </div>
            <p className="mt-4 text-xs text-gray-500">
              {isBnb
                ? "BnB bookings are coordinated directly with the host after submission."
                : "We hold your selection for a short time. Complete the guest form on the next page to confirm your booking."}
            </p>
          </div>
        </section>

        {stay.amenities && Object.keys(stay.amenities).length > 0 && (
          <section className="rounded-3xl bg-white p-6 shadow">
            <h2 className="text-xl font-semibold text-gray-900">Amenities & facilities</h2>
            <div className="mt-4 grid gap-6 md:grid-cols-2">
              {Object.entries(stay.amenities).map(([category, items]) => (
                <div key={category}>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">{category}</h3>
                  <ul className="mt-3 space-y-2 text-sm text-gray-700">
                    {items.map((item, idx) => (
                      <li key={item + idx} className="flex items-start gap-3">
                        <span className="mt-0.5 text-green-600">{getFacilityIcon(item)}</span>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {(stay.videos?.inside?.length ?? 0) > 0 || (stay.videos?.outside?.length ?? 0) > 0 ? (
          <section className="rounded-3xl bg-white p-6 shadow">
            <h2 className="text-xl font-semibold text-gray-900">Experience in motion</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {["inside", "outside"].map((key) => {
                const videos = stay.videos?.[key as keyof typeof stay.videos] ?? [];
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
        <ReviewDisplay targetId={stay._id} targetType="Stay" />
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

      {showActiveRoomGallery && activeRoomIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <button
            type="button"
            onClick={() => setActiveRoomIndex(null)}
            className="absolute right-10 top-19 rounded-full bg-white/20 px-3 py-1 text-sm text-white shadow"
          >
            Close
          </button>
          <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900">{stay.rooms[activeRoomIndex].name}</h3>
            <div className="relative mt-4 h-72 overflow-hidden rounded-2xl">
              <Image
                src={activeRoomImages[roomImageIndex]}
                alt={`${stay.rooms[activeRoomIndex].name} image ${roomImageIndex + 1}`}
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() =>
                  setRoomImageIndex((prev) =>
                    (prev - 1 + activeRoomImages.length) % activeRoomImages.length
                  )
                }
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white"
              >
                <FaChevronLeft />
              </button>
              <button
                type="button"
                onClick={() =>
                  setRoomImageIndex((prev) =>
                    (prev + 1) % activeRoomImages.length
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white"
              >
                <FaChevronRight />
              </button>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {activeRoomImages.map((image, idx) => (
                <button
                  type="button"
                  key={image + idx}
                  onClick={() => setRoomImageIndex(idx)}
                  className={`relative h-20 overflow-hidden rounded-lg ${roomImageIndex === idx ? "ring-2 ring-green-500" : ""
                    }`}
                >
                  <Image src={image} alt={`${stay.rooms[activeRoomIndex].name} thumb ${idx + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
            {stay.rooms[activeRoomIndex].description && (
              <p className="mt-4 text-sm text-gray-600">
                {stay.rooms[activeRoomIndex].description}
              </p>
            )}
            {stay.rooms[activeRoomIndex].amenities?.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">Amenities</p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
                  {stay.rooms[activeRoomIndex].amenities.map((amenity) => (
                    <span key={amenity} className="rounded-full bg-gray-100 px-3 py-1">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StayDetailClient;
