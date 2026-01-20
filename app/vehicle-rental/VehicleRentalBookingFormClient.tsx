"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaArrowLeft, FaCalendarAlt, FaCheckCircle, FaMapMarkerAlt, FaPhoneAlt, FaTag } from "react-icons/fa";
import type { VehicleRentalDetailPayload } from "./vehiclerentalDetailsClient";

const PLATFORM_FEE = 15;

const formatDateDisplay = (value: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const calculateDays = (start: string, end: string) => {
  if (!start || !end) return 1;
  const pickup = new Date(start);
  const dropoff = new Date(end);
  if (Number.isNaN(pickup.getTime()) || Number.isNaN(dropoff.getTime()) || dropoff <= pickup) return 1;
  return Math.max(1, Math.ceil((dropoff.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24)));
};

type Props = {
  rental: VehicleRentalDetailPayload;
  searchParams: Record<string, string | string[] | undefined>;
};

type SelectionItem = {
  key: string;
  option: VehicleRentalDetailPayload["options"][number];
  quantity: number;
  subtotal: number;
  taxes: number;
};

const VehicleRentalBookingFormClient: React.FC<Props> = ({ rental, searchParams }) => {
  const router = useRouter();

  const pickup = typeof searchParams.pickup === "string" ? searchParams.pickup : "";
  const dropoff = typeof searchParams.dropoff === "string" ? searchParams.dropoff : "";

  const parsedVehicles = useMemo(() => {
    const raw = searchParams.vehicles;
    const entries = Array.isArray(raw) ? raw : raw ? [raw] : [];
    return entries
      .map((entry) => {
        if (typeof entry !== "string") return null;
        const [encodedKey, qty = "1"] = entry.split(":");
        const key = decodeURIComponent(encodedKey);
        const quantity = Number(qty);
        if (!key || !Number.isFinite(quantity) || quantity <= 0) return null;
        return { key, quantity };
      })
      .filter(Boolean) as Array<{ key: string; quantity: number }>;
  }, [searchParams.vehicles]);

  const selection = useMemo(() => {
    const items: SelectionItem[] = [];
    parsedVehicles.forEach(({ key, quantity }) => {
      const option =
        rental.options.find((opt) => (opt._id?.toString() || opt.model) === key) ||
        rental.options.find((opt) => opt.model === key);
      if (!option) return;
      const safeQuantity = Math.min(quantity, Math.max(1, option.available ?? quantity));
      const days = calculateDays(pickup, dropoff);
      const subtotal = option.pricePerDay * safeQuantity * days;
      const taxes = (option.taxes ?? 0) * safeQuantity * days;
      items.push({
        key,
        option,
        quantity: safeQuantity,
        subtotal,
        taxes,
      });
    });

    const subtotal = items.reduce((acc, item) => acc + item.subtotal, 0);
    const taxes = items.reduce((acc, item) => acc + item.taxes, 0);
    const total = subtotal + taxes + (items.length ? PLATFORM_FEE : 0);

    return {
      items,
      subtotal,
      taxes,
      total,
      totalVehicles: items.reduce((acc, item) => acc + item.quantity, 0),
    };
  }, [parsedVehicles, rental.options, pickup, dropoff]);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    licenceNumber: "",
    specialRequests: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  // Coupon states
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch("/api/auth/verify", { credentials: "include" });
        if (!res.ok) return;
        const data = await res.json().catch(() => null);
        const verifiedUser = data?.user;
        if (!verifiedUser) return;
        setCurrentUser(verifiedUser);
        setFormData((prev) => ({
          ...prev,
          fullName: prev.fullName || verifiedUser.fullName || "",
          email: prev.email || verifiedUser.email || "",
          phone: prev.phone || verifiedUser.contactNumber || "",
        }));
      } catch (error) {
        console.warn("Unable to preload user details", error);
      }
    };

    loadUser();
  }, []);

  useEffect(() => {
    if (!bookingSuccess) return;
    const timer = setTimeout(() => {
      router.push("/bookings");
    }, 2400);
    return () => clearTimeout(timer);
  }, [bookingSuccess, router]);

  const handleFieldChange =
    (key: keyof typeof formData) =>
      (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData((prev) => ({ ...prev, [key]: event.target.value }));
      };

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setValidatingCoupon(true);
    setCouponError(null);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode,
          subtotal: selection.subtotal + selection.taxes,
        }),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Invalid coupon");
      }

      setAppliedCoupon(data.coupon);
      setCouponCode("");
    } catch (err: any) {
      setCouponError(err.message);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    if (!selection.totalVehicles) {
      setSubmitError("Please select at least one vehicle on the previous page.");
      return;
    }

    const sanitizedForm = {
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      addressLine: formData.addressLine.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      postalCode: formData.postalCode.trim(),
      country: formData.country.trim(),
      licenceNumber: formData.licenceNumber.trim(),
      specialRequests: formData.specialRequests.trim(),
    };

    if (
      !sanitizedForm.fullName ||
      !sanitizedForm.email ||
      !sanitizedForm.phone ||
      !sanitizedForm.addressLine ||
      !sanitizedForm.city ||
      !sanitizedForm.state ||
      !sanitizedForm.postalCode ||
      !sanitizedForm.country ||
      !sanitizedForm.licenceNumber
    ) {
      setSubmitError("Please complete the required driver and contact information.");
      return;
    }

    const formattedAddress = [
      sanitizedForm.addressLine,
      sanitizedForm.city,
      sanitizedForm.state,
      sanitizedForm.postalCode,
      sanitizedForm.country,
    ]
      .filter(Boolean)
      .join(", ");

    setSubmitting(true);
    try {
      const payload = {
        serviceType: "vehicle",
        vehicleRentalId: rental._id,
        pickupDate: pickup,
        dropoffDate: dropoff,
        guests: { adults: 1, children: 0, infants: 0 },
        customer: {
          fullName: sanitizedForm.fullName,
          email: sanitizedForm.email,
          phone: sanitizedForm.phone,
          notes: sanitizedForm.specialRequests ? sanitizedForm.specialRequests : undefined,
        },
        currency: selection.items[0]?.option.currency || "INR",
        items: selection.items.map(({ option, quantity }) => ({
          optionId: option._id,
          optionName: option.model,
          quantity,
          price: option.pricePerDay,
          pricePerDay: option.pricePerDay,
          taxes: option.taxes ?? 0,
        })),
        fees: PLATFORM_FEE,
        metadata: {
          address: formattedAddress,
          licenceNumber: sanitizedForm.licenceNumber,
        },
        couponCode: appliedCoupon?.code,
      };

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.message || "We couldn't complete your booking. Please try again.");
      }

      setBookingSuccess(data.booking);
    } catch (error: any) {
      setSubmitError(error?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const rentalLocation = useMemo(
    () => [rental.location.address, rental.location.city, rental.location.state, rental.location.country].filter(Boolean).join(", "),
    [rental.location.address, rental.location.city, rental.location.state, rental.location.country]
  );

  if (!selection.items.length) {
    return (
      <div className="min-h-screen bg-sky-50">
        <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 text-center">
          <div className="rounded-3xl bg-white p-10 shadow-xl">
            <h1 className="text-2xl font-semibold text-gray-900">Let’s pick your vehicle again</h1>
            <p className="mt-3 text-sm text-gray-600">
              It looks like the booking session expired or no vehicle was selected. Head back to the rental page to choose your ride.
            </p>
            <button
              type="button"
              onClick={() => router.push(`/vehicle-rental/${rental._id}`)}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-green-700"
            >
              <FaArrowLeft /> Back to vehicle list
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-sky-50">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <div className="rounded-3xl bg-white p-10 text-center shadow-xl">
            <FaCheckCircle className="mx-auto text-4xl text-green-500" />
            <h1 className="mt-4 text-2xl font-semibold text-gray-900">Booking locked in!</h1>
            <p className="mt-3 text-sm text-gray-600">
              Confirmation sent to {bookingSuccess.customer?.email}. Your booking reference is{" "}
              <span className="font-semibold text-gray-900">{bookingSuccess._id}</span>. Redirecting you to your rentals shortly.
            </p>
            <div className="mt-6 space-y-2 text-sm text-gray-600">
              <p>
                <FaCalendarAlt className="mr-2 inline text-green-500" />
                {formatDateDisplay(pickup)} → {formatDateDisplay(dropoff)} ({calculateDays(pickup, dropoff)} day
                {calculateDays(pickup, dropoff) === 1 ? "" : "s"})
              </p>
            </div>
            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => router.push("/bookings")}
                className="inline-flex items-center gap-2 rounded-full bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-green-700"
              >
                Go to my bookings
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sky-50 pb-20 pt-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-4 rounded-3xl bg-white/80 p-6 text-gray-900 shadow">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <button
                type="button"
                onClick={() => router.push(`/vehicle-rental/${rental._id}`)}
                className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 transition hover:bg-green-100"
              >
                <FaArrowLeft /> Back to vehicle selection
              </button>
              <h1 className="mt-3 text-2xl font-semibold text-gray-900">Driver & reservation details</h1>
              <p className="mt-1 text-sm text-gray-600">
                Share driver information and pickup notes to confirm your rental without online payment.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700">
              <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1">
                <FaCalendarAlt className="text-green-500" />
                {formatDateDisplay(pickup)} · {formatDateDisplay(dropoff)}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1">
                {selection.totalVehicles} vehicle{selection.totalVehicles === 1 ? "" : "s"}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
          <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl bg-white p-6 shadow-lg">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Driver details</h2>
              <p className="mt-1 text-sm text-gray-600">We’ll share these with the rental partner for pickup verification.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm text-gray-700">
                Driver full name <span className="text-xs text-rose-500">*</span>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleFieldChange("fullName")}
                  className="rounded-lg border border-gray-200 px-3 py-2 focus:border-green-500 focus:outline-none"
                  placeholder="As per driving licence"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-gray-700">
                Email address <span className="text-xs text-rose-500">*</span>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleFieldChange("email")}
                  className="rounded-lg border border-gray-200 px-3 py-2 focus:border-green-500 focus:outline-none"
                  placeholder="you@example.com"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-gray-700">
                Mobile number <span className="text-xs text-rose-500">*</span>
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 focus-within:border-green-500">
                  <FaPhoneAlt className="text-gray-400" />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleFieldChange("phone")}
                    className="w-full border-none bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </label>
              <label className="flex flex-col gap-1 text-sm text-gray-700">
                Driving licence number <span className="text-xs text-rose-500">*</span>
                <input
                  type="text"
                  required
                  value={formData.licenceNumber}
                  onChange={handleFieldChange("licenceNumber")}
                  className="rounded-lg border border-gray-200 px-3 py-2 focus:border-green-500 focus:outline-none"
                  placeholder="Enter licence ID"
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm text-gray-700">
                Address line <span className="text-xs text-rose-500">*</span>
                <input
                  type="text"
                  required
                  value={formData.addressLine}
                  onChange={handleFieldChange("addressLine")}
                  className="rounded-lg border border-gray-200 px-3 py-2 focus:border-green-500 focus:outline-none"
                  placeholder="Street address, apartment, suite, etc."
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-gray-700">
                City <span className="text-xs text-rose-500">*</span>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={handleFieldChange("city")}
                  className="rounded-lg border border-gray-200 px-3 py-2 focus:border-green-500 focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-gray-700">
                State / Province <span className="text-xs text-rose-500">*</span>
                <input
                  type="text"
                  required
                  value={formData.state}
                  onChange={handleFieldChange("state")}
                  className="rounded-lg border border-gray-200 px-3 py-2 focus:border-green-500 focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-gray-700">
                Postal code <span className="text-xs text-rose-500">*</span>
                <input
                  type="text"
                  required
                  value={formData.postalCode}
                  onChange={handleFieldChange("postalCode")}
                  className="rounded-lg border border-gray-200 px-3 py-2 focus:border-green-500 focus:outline-none"
                />
              </label>
              <label className="md:col-span-2 flex flex-col gap-1 text-sm text-gray-700">
                Country / Region <span className="text-xs text-rose-500">*</span>
                <input
                  type="text"
                  required
                  value={formData.country}
                  onChange={handleFieldChange("country")}
                  className="rounded-lg border border-gray-200 px-3 py-2 focus:border-green-500 focus:outline-none"
                />
              </label>
            </div>

            <label className="flex flex-col gap-1 text-sm text-gray-700">
              Special requests & pickup notes
              <textarea
                rows={4}
                value={formData.specialRequests}
                onChange={handleFieldChange("specialRequests")}
                className="rounded-lg border border-gray-200 px-3 py-2 focus:border-green-500 focus:outline-none"
                placeholder="Mention additional drivers, preferred pickup window, or requests for helmets/child seats."
              />
            </label>

            {submitError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-green-600 px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Processing booking…" : "Confirm booking"}
            </button>
          </form>

          <aside className="space-y-4 rounded-3xl bg-white p-6 shadow-lg">
            <div className="relative h-40 w-full overflow-hidden rounded-2xl">
              {rental.images?.length ? (
                <Image src={rental.images[0]} alt={rental.name} fill className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center bg-gray-100 text-sm text-gray-500">Image coming soon</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <p className="text-xs uppercase tracking-wide text-white/80">{rental.category}</p>
                <h3 className="text-lg font-semibold">{rental.name}</h3>
              </div>
            </div>

            <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
              <p className="flex items-center gap-2 text-gray-900">
                <FaMapMarkerAlt className="text-green-600" /> {rentalLocation}
              </p>
              <p className="mt-2 flex items-center gap-2">
                <FaCalendarAlt className="text-green-600" />
                {formatDateDisplay(pickup)} → {formatDateDisplay(dropoff)} ({calculateDays(pickup, dropoff)} day{calculateDays(pickup, dropoff) === 1 ? "" : "s"})
              </p>
            </div>

            <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-700">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Vehicles selected</p>
              <ul className="space-y-3">
                {selection.items.map(({ option, quantity }) => (
                  <li key={(option._id as string) || option.model} className="rounded-xl bg-gray-50 px-3 py-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-900">{option.model}</p>
                        <p className="text-xs text-gray-500">
                          {quantity} vehicle{quantity === 1 ? "" : "s"} · {option.type}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        ₹{(option.pricePerDay * quantity * calculateDays(pickup, dropoff)).toLocaleString()}
                      </span>
                    </div>
                    {option.amenities?.length ? (
                      <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-gray-500">
                        {option.amenities.slice(0, 4).map((amenity) => (
                          <span key={amenity} className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 shadow">
                            <FaTag className="text-gray-400" />
                            {amenity}
                          </span>
                        ))}
                        {option.amenities.length > 4 && <span>+{option.amenities.length - 4} more</span>}
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-900">HAVE A COUPON?</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="COUPON CODE"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm uppercase font-bold text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={validatingCoupon || !couponCode}
                  className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-50"
                >
                  {validatingCoupon ? "..." : "Apply"}
                </button>
              </div>
              {couponError && <p className="text-xs text-rose-500">{couponError}</p>}
              {appliedCoupon && (
                <div className="flex items-center justify-between rounded-xl bg-green-50 px-3 py-2 border border-green-100">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 font-bold text-xs">{appliedCoupon.code}</span>
                    <span className="text-[10px] text-green-600">Applied!</span>
                  </div>
                  <button onClick={handleRemoveCoupon} type="button" className="text-[10px] font-bold text-rose-500 hover:underline">
                    REMOVE
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-2 rounded-2xl bg-gray-900 px-5 py-4 text-sm text-white">
              <div className="flex justify-between text-gray-200">
                <span>Subtotal</span>
                <span>₹{selection.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-200">
                <span>Taxes & fees</span>
                <span>₹{selection.taxes.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-200">
                <span>Platform fee</span>
                <span>₹{PLATFORM_FEE.toLocaleString()}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-green-400 font-medium italic">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span>-₹{appliedCoupon.appliedDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-white/20 pt-2 text-base font-semibold">
                <span>Total</span>
                <span>₹{(selection.total - (appliedCoupon?.appliedDiscount || 0)).toLocaleString()}</span>
              </div>
              <p className="text-xs text-white/70">
                Payment is handled directly with the rental partner at pickup. This form only secures your reservation.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default VehicleRentalBookingFormClient;

