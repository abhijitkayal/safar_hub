// app/vehicle-rental/vehicleRentalDetailClient.tsx
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
  FaStar,
  FaTag,
  FaVideo,
  FaCar,
  FaGasPump,
  FaCogs,
  FaTimes,
  FaSnowflake,
  FaShieldAlt,
  FaKey,
  FaBluetooth,
  FaUsb,
  FaCamera,
  FaInfoCircle,
  FaSwimmer,
  FaWifi,
  FaParking,
  FaSpa,
  FaUtensils,
  FaGlassCheers,
  FaCoffee,
  FaDumbbell,
  FaConciergeBell,
  FaChild,
  FaWheelchair,
  FaAccessibleIcon,
  FaBath,
  FaShower,
  FaTv,
  FaHotjar,
  FaMountain,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useCart } from "../hooks/useCart";
import { useAvailability } from "../hooks/useAvailability";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

export type VehicleRentalDetailPayload = {
  _id: string;
  name: string;
  category: "cars-rental" | "bikes-rentals";
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
  amenities?: Record<string, string[]>;
  options: Array<{
    _id?: string;
    model: string;
    description?: string;
    type: string;
    pricePerDay: number;
    securityDepositAmount?: number;
    taxes?: number;
    currency?: string;
    features: string[];
    amenities?: string[];
    images: string[];
    available?: number;
    isRefundable?: boolean;
    refundableUntilHours?: number;
    driver?: {
      name?: string;
      age?: number;
      experienceYears?: number;
    };
  }>;
  about: { heading: string; description: string };
  checkInOutRules: { pickup: string; dropoff: string; rules: string[] };
  defaultCancellationPolicy?: string;
  defaultHouseRules?: string[];
  vendorMessage?: string;
};

const getSecurityDepositValue = (vehicle: VehicleRentalDetailPayload["options"][number]) => {
  const raw =
    vehicle.securityDepositAmount ??
    (vehicle as any).securityDeposit ??
    (vehicle as any).deposit ??
    (vehicle as any).securityDepositFee ??
    0;
  const cleaned =
    typeof raw === "string" ? Number(raw.replace(/[^0-9.-]/g, "")) : Number(raw);
  return Number.isFinite(cleaned) && cleaned > 0 ? cleaned : 0;
};

// Unified icon map (same as adventure page + vehicle icons)
const facilityIconMap: Record<string, JSX.Element> = {
  ac: <FaSnowflake />,
  "air conditioning": <FaSnowflake />,
  bluetooth: <FaBluetooth />,
  usb: <FaUsb />,
  camera: <FaCamera />,
  gps: <FaMapMarkerAlt />,
  fuel: <FaGasPump />,
  transmission: <FaCogs />,
  insurance: <FaShieldAlt />,
  keyless: <FaKey />,
  pool: <FaSwimmer />,
  wifi: <FaWifi />,
  parking: <FaParking />,
  spa: <FaSpa />,
  restaurant: <FaUtensils />,
  bar: <FaGlassCheers />,
  breakfast: <FaCoffee />,
  gym: <FaDumbbell />,
  concierge: <FaConciergeBell />,
  family: <FaChild />,
  security: <FaShieldAlt />,
  safety: <FaShieldAlt />,
  wheelchair: <FaWheelchair />,
  accessible: <FaAccessibleIcon />,
  bathroom: <FaBath />,
  shower: <FaShower />,
  tv: <FaTv />,
  heating: <FaHotjar />,
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
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
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
  return { pickup: formatDateInput(today), dropoff: formatDateInput(tomorrow) };
};

interface Props {
  rental: VehicleRentalDetailPayload;
}

const VehicleRentalDetailClient: React.FC<Props> = ({ rental }) => {
  const router = useRouter();
  const { addToCart, removeFromCart, isInCart, loading: cartLoading } = useCart({ autoLoad: true });

  const inCart = isInCart(rental._id, "VehicleRental");

  const images = useMemo(() => [...rental.images, ...(rental.gallery || [])].filter(Boolean), [rental.images, rental.gallery]);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIdx, setGalleryIdx] = useState(0);
  const [activeVehicleIdx, setActiveVehicleIdx] = useState<number | null>(null);
  const [vehicleImageIdx, setVehicleImageIdx] = useState(0);

  const { pickup: defaultPickup, dropoff: defaultDropoff } = useMemo(() => getDefaultDates(), []);
  const [pickupDate, setPickupDate] = useState(defaultPickup);
  const [dropoffDate, setDropoffDate] = useState(defaultDropoff);

  const initialSelections = useMemo(() => {
    const map: Record<string, number> = {};
    rental.options.forEach((v) => {
      const key = v._id?.toString() || v.model;
      map[key] = 0;
    });
    return map;
  }, [rental.options]);

  const [vehicleSelections, setVehicleSelections] = useState<Record<string, number>>(initialSelections);
  const [expandedVehicleKey, setExpandedVehicleKey] = useState<string | null>(null);

  const days = useMemo(() => calculateDays(pickupDate, dropoffDate), [pickupDate, dropoffDate]);

  const availability = useAvailability("vehicle", rental._id, pickupDate, dropoffDate);
  const availableVehicleKeys = availability.availableOptionKeys ?? [];
  const bookedSummaries = availability.bookedRanges.slice(0, 3);
  const soldOutForDates = !availability.loading && rental.options.length > 0 && availableVehicleKeys.length === 0;
  const isVehicleUnavailable = (key: string) => {
    if (availability.loading) return false;
    if (availableVehicleKeys.length === 0) return soldOutForDates;
    return !availableVehicleKeys.includes(key);
  };

  const pricing = useMemo(() => {
    const selectedVehicles = rental.options.reduce(
      (acc, v) => {
        const key = v._id?.toString() || v.model;
        const qty = vehicleSelections[key] || 0;
        if (qty > 0) acc.push({ vehicle: v, qty });
        return acc;
      },
      [] as Array<{ vehicle: typeof rental.options[number]; qty: number }>
    );
    const subtotal = selectedVehicles.reduce((sum, { vehicle, qty }) => sum + vehicle.pricePerDay * qty * days, 0);
    const taxes = selectedVehicles.reduce((sum, { vehicle, qty }) => sum + (vehicle.taxes ?? 0) * qty * days, 0);
    const securityDeposit = selectedVehicles.reduce(
      (sum, { vehicle, qty }) => sum + getSecurityDepositValue(vehicle) * qty,
      0
    );
    return { subtotal, taxes, total: subtotal + taxes, securityDeposit, selectedVehicles };
  }, [vehicleSelections, rental.options, days]);

  const platformFee = pricing.selectedVehicles.length ? 15 : 0;
  const grandTotal = pricing.total + platformFee;
  const depositBadges = useMemo(() => {
    return rental.options
      .map((opt) => ({
        key: opt._id?.toString() || opt.model,
        model: opt.model,
        amount: getSecurityDepositValue(opt),
      }))
      .filter((opt) => opt.amount > 0);
  }, [rental.options]);
  const hasSecurityDeposits = depositBadges.length > 0;

  const locationString = useMemo(
    () => [rental.location.address, rental.location.city, rental.location.state, rental.location.country].filter(Boolean).join(", "),
    [rental.location]
  );

  const mapEmbedUrl = useMemo(() => `https://www.google.com/maps?q=${encodeURIComponent(locationString)}&output=embed`, [locationString]);
  const mapDirectionsUrl = useMemo(() => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(locationString)}`, [locationString]);

  const toggleSelection = (key: string, available: number) => {
    if (available <= 0 || isVehicleUnavailable(key)) return;

    // Check if we are selecting (currently 0)
    const currentQty = vehicleSelections[key] || 0;
    if (currentQty === 0) {
      setTimeout(() => {
        const el = document.getElementById("vehicle-booking-summary");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }

    setVehicleSelections((prev) => ({ ...prev, [key]: prev[key] ? 0 : 1 }));
  };

  const stepQuantity = (key: string, delta: number, max: number) => {
    if (isVehicleUnavailable(key)) return;
    setVehicleSelections((prev) => {
      const curr = prev[key] || 0;
      const next = Math.min(Math.max(curr + delta, 0), max ?? 0);
      return { ...prev, [key]: next };
    });
  };

  const handleBookNow = () => {
    if (!pricing.selectedVehicles.length || soldOutForDates) return;
    const params = new URLSearchParams({ pickup: pickupDate, dropoff: dropoffDate });
    pricing.selectedVehicles.forEach(({ vehicle, qty }) => {
      const key = vehicle._id?.toString() || vehicle.model;
      params.append("vehicles", `${key}:${qty}`);
    });
    router.push(`/vehicle-rental/${rental._id}/book?${params.toString()}`);
  };

  const facilities = rental.popularFacilities || [];
  const hasRating = rental.rating?.average != null;
  return (
    <div className="min-h-screen bg-sky-50 text-black">
      {/* Header */}
      <header className="relative isolate overflow-hidden  bg-linear-to-br from-green-600 via-green-500 to-lime-400 pb-20 pt-16 text-white">
        <div className="relative mx-auto max-w-7xl px-6 lg:px-2 mt-5">
          <button onClick={() => router.back()} className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm backdrop-blur hover:bg-white/25">
            <FaArrowLeft /> Back to rentals
          </button>

          <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)]">
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-6">
                <div className="max-w-2xl">
                  <p className="uppercase tracking-wide text-white/80">
                    {rental.category === "cars-rental" ? "Car Rental" : "Bike Rental"}
                  </p>
                  <h1 className="mt-2 text-3xl font-bold leading-snug sm:text-4xl md:text-5xl">{rental.name}</h1>
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
                        await removeFromCart(rental._id, "VehicleRental");
                        toast.success("Removed from cart");
                      } else {
                        await addToCart(rental._id, "VehicleRental", 1);
                        toast.success("Added to cart!");
                      }
                    } catch (err: any) {
                      toast.error(err.message || "Failed to update cart");
                    }
                  }}
                  disabled={cartLoading}
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-full transition-colors cursor-pointer ${cartLoading ? "cursor-not-allowed opacity-60" : ""
                    } ${inCart ? "bg-green-600 text-green-50 hover:bg-green-700" : "bg-green-50 text-green-600 hover:bg-green-100"
                    }`}
                >
                  <FaShoppingCart className="text-xl" />
                </motion.button>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm text-white/90">
                {hasRating && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 font-semibold">
                    <FaStar className="text-yellow-300" /> {rental.rating!.average.toFixed(1)} · {rental.rating!.count} reviews
                  </span>
                )}
                <a href={mapDirectionsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 font-semibold hover:bg-white/25">
                  <FaMapMarkerAlt /> View on map
                </a>
                {rental.tags?.slice(0, 3).map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 font-semibold">
                    <FaTag /> {tag}
                  </span>
                ))}
              </div>

              {rental.heroHighlights?.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {rental.heroHighlights.slice(0, 3).map((h) => (
                    <div key={h} className="rounded-2xl bg-white/15 px-4 py-3 text-sm font-medium shadow-sm backdrop-blur">
                      {h}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Plan Card */}
            <div className="w-full max-w-xl rounded-2xl bg-white/95 p-6 text-gray-900 shadow-lg backdrop-blur">
              <h2 className="text-lg font-semibold">Plan your ride</h2>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm">
                  Pickup
                  <input
                    type="date"
                    value={pickupDate}
                    onChange={(e) => {
                      const v = e.target.value;
                      setPickupDate(v);
                      if (new Date(v) >= new Date(dropoffDate)) {
                        const next = new Date(v);
                        next.setDate(next.getDate() + 1);
                        setDropoffDate(formatDateInput(next));
                      }
                    }}
                    className="rounded-lg border border-gray-200 px-3 py-2 focus:border-green-500 focus:outline-none"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  Drop-off
                  <input
                    type="date"
                    min={pickupDate}
                    value={dropoffDate}
                    onChange={(e) => setDropoffDate(e.target.value)}
                    className="rounded-lg border border-gray-200 px-3 py-2 focus:border-green-500 focus:outline-none"
                  />
                </label>
              </div>
              <p className="mt-3 text-sm text-gray-600">Rental duration: {days} day{days > 1 ? "s" : ""}</p>
              <div className={`mt-3 rounded-2xl border px-4 py-3 text-sm ${soldOutForDates ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
                {availability.loading ? "Checking…" : soldOutForDates ? "Sold out for these dates" : "Available"}
              </div>
              <button onClick={() => document.getElementById("vehicle-availability")?.scrollIntoView({ behavior: "smooth" })} className="mt-4 w-full rounded-lg bg-green-600 py-3 font-semibold text-white hover:bg-green-700">
                View available vehicles
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 pb-16 lg:px-2 mt-10">
        {hasSecurityDeposits && (
          <section className="mb-10 rounded-3xl border border-emerald-100 bg-emerald-50 p-6 text-emerald-900 shadow">
            <h2 className="text-xl font-semibold">Refundable security deposits</h2>
            <p className="mt-1 text-sm text-emerald-700/90">
              Collected at pickup and released after the post-trip inspection.
            </p>
            <div className="mt-4 space-y-3 text-sm">
              {depositBadges.map(({ key, model, amount }) => (
                <div
                  key={key}
                  className="flex flex-wrap items-center justify-between rounded-2xl bg-white p-3 text-emerald-900 shadow-sm"
                >
                  <span className="font-semibold">{model}</span>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                    ₹{amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-emerald-700">
              Tip: Inform guests to carry the deposit amount in cash or via approved offline payment modes.
            </p>
          </section>
        )}
        {/* Location Map */}
        <section className="grid gap-6 rounded-3xl bg-white p-6 shadow md:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="text-xl font-semibold">Rental location</h2>
            <p className="mt-2 text-sm text-gray-600">Find the exact pickup point and plan your route.</p>
            <a href={mapDirectionsUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-100">
              <FaMapMarkerAlt /> Open in Google Maps
            </a>
          </div>
          <div className="h-72 overflow-hidden rounded-2xl border border-gray-100">
            <iframe src={mapEmbedUrl} title="Map" className="h-full w-full" loading="lazy" allowFullScreen />
          </div>
        </section>

        {/* Gallery */}
        <section className="mt-10 grid gap-4 rounded-3xl bg-white p-6 shadow-xl md:grid-cols-5">
          <div className="relative h-64 overflow-hidden rounded-2xl md:col-span-3">
            {images.length ? <Image src={images[galleryIdx]} alt={rental.name} fill className="object-cover" /> : <div className="flex h-full items-center justify-center bg-gray-100">No photos</div>}
            {images.length > 0 && (
              <button onClick={() => setGalleryOpen(true)} className="absolute bottom-4 right-4 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold shadow">
                View all
              </button>
            )}
          </div>
          <div className="grid gap-4 md:col-span-2">
            {images.slice(1, 4).map((src, i) => (
              <div key={i} className="relative h-32 overflow-hidden rounded-2xl">
                <Image src={src} alt="" fill className="object-cover" />
              </div>
            ))}
          </div>
        </section>

        {/* Popular Facilities */}
        {facilities.length > 0 && (
          <section className="mt-10 rounded-3xl bg-white p-6 shadow">
            <h2 className="text-xl font-semibold text-gray-900">Popular facilities</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {facilities.map((f) => (
                <span key={f} className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-1 text-sm font-medium text-green-700">
                  <span className="text-base">{getFacilityIcon(f)}</span>
                  {f}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Curated Highlights */}
        {rental.curatedHighlights && rental.curatedHighlights.length > 0 && (
          <section className="mt-10 rounded-3xl bg-white p-6 shadow">
            <h2 className="text-xl font-semibold text-gray-900">Why guests love it</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {rental.curatedHighlights.map((item, i) => (
                <div key={i} className="flex gap-3 rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-800">
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

        {/* About + Rules */}
        <section className="mt-10 grid gap-6 rounded-3xl bg-white p-6 shadow md:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">About this rental</h2>
            <h3 className="mt-2 text-lg font-semibold text-gray-800">{rental.about.heading}</h3>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-700">{rental.about.description}</p>
            {rental.vendorMessage && (
              <div className="mt-4 rounded-2xl bg-green-50 p-4 text-sm text-green-800">
                <p className="font-semibold">Vendor message</p>
                <p className="mt-2 whitespace-pre-line">{rental.vendorMessage}</p>
              </div>
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Pickup & Drop-off</h2>
            <div className="mt-3 space-y-3 rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
              <p><strong>Pickup:</strong> {rental.checkInOutRules.pickup}</p>
              <p><strong>Drop-off:</strong> {rental.checkInOutRules.dropoff}</p>
              {rental.checkInOutRules.rules?.length > 0 && (
                <ul className="mt-3 list-disc space-y-1 pl-5">
                  {rental.checkInOutRules.rules.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              )}
            </div>
            {rental.defaultCancellationPolicy && (
              <div className="mt-4 rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
                <p className="font-semibold">Cancellation policy</p>
                <p className="mt-2 whitespace-pre-line">{rental.defaultCancellationPolicy}</p>
              </div>
            )}
          </div>
        </section>
        {/* Vehicle Availability Table */}
        <section id="vehicle-availability" className="mt-10 space-y-5 rounded-3xl bg-white p-6 shadow">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Vehicle availability</h2>
              <p className="text-sm text-gray-600">Choose one or more vehicles for {days} day{days > 1 ? "s" : ""}.</p>
            </div>
          </div>

          <div className={`rounded-2xl border px-4 py-3 text-sm ${soldOutForDates ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
            {availability.loading && "Checking availability…"}
            {!availability.loading && !availability.error && (soldOutForDates ? "Sold out for these dates." : "Available for these dates.")}
          </div>

          <div className={`overflow-x-auto rounded-2xl border border-gray-200 ${soldOutForDates ? "pointer-events-none opacity-60" : ""}`}>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Vehicle</th>
                  <th className="px-4 py-3">Specs & highlights</th>
                  <th className="px-4 py-3">Price / day</th>
                  <th className="px-4 py-3">Security deposit</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {rental.options.map((vehicle, idx) => {
                  const key = vehicle._id?.toString() || vehicle.model;
                  const qty = vehicleSelections[key] || 0;
                  const isSelected = qty > 0;
                  const isExpanded = expandedVehicleKey === key;
                  const available = vehicle.available ?? 0;
                  const taxesNote = vehicle.taxes ? `Taxes ₹${vehicle.taxes.toLocaleString()} extra` : "Taxes included";
                  const unavailable = available <= 0 || isVehicleUnavailable(key);

                  return (
                    <Fragment key={key}>
                      <tr className={isSelected ? "bg-green-50/50" : "hover:bg-gray-50"}>
                        <td className="px-4 py-4 text-sm">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-base font-semibold text-gray-900">{vehicle.model}</span>
                              {isSelected && <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">Selected</span>}
                              {unavailable && <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700">Sold out</span>}
                            </div>
                            <p className="text-xs text-gray-500">{vehicle.type}</p>
                            {vehicle.description && (
                              <p className="text-sm text-gray-600">{vehicle.description}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-700">
                          <div className="flex flex-wrap gap-1">
                            {vehicle.features?.slice(0, 3).map((f) => (
                              <span key={f} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">{f}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <span className="text-lg font-semibold">₹{vehicle.pricePerDay.toLocaleString()}</span>
                          <p className="text-xs text-gray-500">{taxesNote}</p>
                        </td>
                        <td className="px-4 py-4 text-sm">
                          {(() => {
                            const deposit = getSecurityDepositValue(vehicle);
                            return deposit > 0 ? (
                              <div className="flex flex-col gap-1">
                                <span className="font-semibold text-emerald-700">
                                  ₹{deposit.toLocaleString()}
                                </span>
                                <span className="text-xs text-gray-500">Refundable at pickup</span>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-500">No deposit</span>
                            );
                          })()}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => setExpandedVehicleKey(isExpanded ? null : key)} className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-50">
                              {isExpanded ? "Hide" : "Details"}
                            </button>
                            <div className="flex items-center gap-1">
                              <button onClick={() => stepQuantity(key, -1, available)} disabled={qty <= 0 || unavailable} className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 disabled:opacity-50">−</button>
                              <span className="w-8 text-center font-semibold">{qty}</span>
                              <button onClick={() => stepQuantity(key, 1, available)} disabled={unavailable || qty >= available} className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 disabled:opacity-50">+</button>
                            </div>
                            <button
                              onClick={() => toggleSelection(key, available)}
                              disabled={unavailable}
                              className={`rounded-full px-4 py-2 font-semibold transition ${isSelected ? "bg-green-600 text-white" : "border border-green-600 text-green-600 hover:bg-green-50"} disabled:opacity-50`}
                            >
                              {unavailable ? "Unavailable" : isSelected ? "Selected" : "Select"}
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={5} className="bg-gray-50 px-6 py-6">
                            <div className="grid gap-6 lg:grid-cols-2">
                              <div className="grid grid-cols-3 gap-3">
                                {vehicle.images?.slice(0, 3).map((img, i) => (
                                  <div key={i} className="relative h-32 overflow-hidden rounded-xl">
                                    <Image src={img} alt="" fill className="object-cover" />
                                  </div>
                                ))}
                                {vehicle.images && vehicle.images.length > 3 && (
                                  <button onClick={() => { setActiveVehicleIdx(idx); setVehicleImageIdx(0); }} className="flex h-32 items-center justify-center rounded-xl border border-dashed border-gray-400 text-xs font-semibold">
                                    +{vehicle.images.length - 3} more
                                  </button>
                                )}
                              </div>
                              <div className="space-y-4 text-sm">
                                {Array.isArray(vehicle.amenities) && vehicle.amenities.length > 0 && (
                                  <div>
                                    <p className="font-semibold uppercase text-xs text-gray-500">Amenities</p>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                      {vehicle.amenities.map((a) => (
                                        <span key={a} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 shadow-sm">
                                          {getFacilityIcon(a)} {a}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {vehicle.driver && (
                                  <div>
                                    <p className="font-semibold uppercase text-xs text-gray-500">Driver</p>
                                    <ul className="mt-2 space-y-1 text-gray-700">
                                      {vehicle.driver.name && <li>Name: {vehicle.driver.name}</li>}
                                      {vehicle.driver.age && <li>Age: {vehicle.driver.age} years</li>}
                                      {vehicle.driver.experienceYears && <li>Experience: {vehicle.driver.experienceYears} years</li>}
                                    </ul>
                                  </div>
                                )}
                                {getSecurityDepositValue(vehicle) > 0 && (
                                  <div>
                                    <p className="font-semibold uppercase text-xs text-gray-500">Security deposit</p>
                                    <p className="mt-2 text-gray-700 bg-emerald-50 p-2 rounded-md border border-emerald-200">
                                      <span className="font-semibold">₹{getSecurityDepositValue(vehicle).toLocaleString()}</span> payable at pickup (fully refundable after inspection)
                                    </p>
                                  </div>
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
        </section>

        <section id="vehicle-booking-summary" className="grid gap-6 rounded-3xl bg-white p-6 shadow md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] mt-10">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Booking summary</h2>
            <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
              <p className="flex items-center gap-2">
                <FaCalendarAlt /> {pickupDate} → {dropoffDate} ({days} day{days === 1 ? "" : "s"})
              </p>
              <p className="mt-2 text-gray-600">Vehicles selected: {pricing.selectedVehicles.length}</p>
              <div className="mt-4 space-y-2 border-t border-gray-200 pt-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{pricing.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes & fees</span>
                  <span>₹{pricing.taxes.toLocaleString()}</span>
                </div>
                {pricing.selectedVehicles.length > 0 && (
                  <div className="flex justify-between">
                    <span>Platform fee</span>
                    <span>₹{platformFee.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-semibold text-gray-900">
                  <span>Total</span>
                  <span>₹{grandTotal.toLocaleString()}</span>
                </div>
                {pricing.securityDeposit > 0 && (
                  <div className="flex justify-between rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-emerald-800">
                    <span className="text-sm font-medium">Security deposit (pay at pickup)</span>
                    <span className="font-semibold">₹{pricing.securityDeposit.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
            {!pricing.selectedVehicles.length && (
              <p className="text-xs text-amber-600">Select at least one vehicle to continue to the booking form.</p>
            )}
            {soldOutForDates && (
              <p className="text-xs text-rose-600">
                These dates are sold out. Choose different dates to continue.
              </p>
            )}
            <button
              type="button"
              onClick={handleBookNow}
              disabled={!pricing.selectedVehicles.length || soldOutForDates}
              className="w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {soldOutForDates
                ? "Unavailable for these dates"
                : pricing.selectedVehicles.length
                  ? "Book now"
                  : "Select a vehicle to book"}
            </button>
          </div>
          <div className="flex flex-col justify-between rounded-2xl bg-linear-to-br from-green-50 via-white to-green-100 p-5 text-sm text-gray-700 shadow-inner">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">What happens next?</h3>
              <p>Click <strong>Book now</strong> to complete your reservation on the next page:</p>
              <ul className="ml-4 list-disc space-y-2 text-sm">
                <li>Review driver details and contact information</li>
                <li>Confirm pickup & drop-off instructions with the vendor</li>
                <li>Add licence notes or special requests before submitting</li>
              </ul>
            </div>
            <p className="mt-4 text-xs text-gray-500">
              We reserve your selected vehicles temporarily. Complete the next step to confirm the booking with the vendor.
            </p>
          </div>
        </section>

        {rental.amenities && Object.keys(rental.amenities).length > 0 && (
          <section className="rounded-3xl bg-white p-6 shadow mt-10">
            <h2 className="text-xl font-semibold">Amenities & Features</h2>
            <div className="mt-4 grid gap-6 md:grid-cols-2">
              {Object.entries(rental.amenities).map(([sectionKey, items]) => (
                <div key={sectionKey}>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">{sectionKey}</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {items.map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700"
                      >
                        <FaCheck className="text-green-600" /> {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {(rental.videos?.inside?.length ?? 0) > 0 || (rental.videos?.outside?.length ?? 0) > 0 ? (
          <section className="rounded-3xl bg-white p-6 shadow mt-10">
            <h2 className="text-xl font-semibold text-gray-900">Experience in motion</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {["inside", "outside"].map((key) => {
                const videos = rental.videos?.[key as keyof typeof rental.videos] ?? [];
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
                setGalleryIdx((prev) => (prev - 1 + images.length) % images.length);
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
                key={galleryIdx}
                src={images[galleryIdx]}
                alt={`Gallery photo ${galleryIdx + 1}`}
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
                setGalleryIdx((prev) => (prev + 1) % images.length);
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
                  onClick={() => setGalleryIdx(idx)}
                  className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-lg transition-all ${galleryIdx === idx
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
              {galleryIdx + 1} / {images.length}
            </div>
          </div>
        </div>
      )}

      {activeVehicleIdx !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <button
            type="button"
            onClick={() => setActiveVehicleIdx(null)}
            className="absolute right-6 top-6 rounded-full bg-white/20 px-3 py-1 text-sm text-white shadow"
          >
            Close
          </button>
          <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900">{rental.options[activeVehicleIdx].model}</h3>
            <div className="relative mt-4 h-72 overflow-hidden rounded-2xl">
              <Image
                src={rental.options[activeVehicleIdx].images[vehicleImageIdx]}
                alt={`${rental.options[activeVehicleIdx].model} image ${vehicleImageIdx + 1}`}
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() =>
                  setVehicleImageIdx((i) => (i - 1 + rental.options[activeVehicleIdx].images.length) % rental.options[activeVehicleIdx].images.length)
                }
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white"
              >
                <FaChevronLeft />
              </button>
              <button
                type="button"
                onClick={() =>
                  setVehicleImageIdx((i) => (i + 1) % rental.options[activeVehicleIdx].images.length)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white"
              >
                <FaChevronRight />
              </button>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {rental.options[activeVehicleIdx].images.map((img, idx) => (
                <button
                  key={img + idx}
                  type="button"
                  onClick={() => setVehicleImageIdx(idx)}
                  className={`relative h-20 overflow-hidden rounded-lg ${vehicleImageIdx === idx ? "ring-2 ring-green-500" : ""}`}
                >
                  <Image src={img} alt={`${rental.options[activeVehicleIdx].model} thumb ${idx + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
            {rental.options[activeVehicleIdx].description && (
              <p className="mt-4 text-sm text-gray-600">{rental.options[activeVehicleIdx].description}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleRentalDetailClient;