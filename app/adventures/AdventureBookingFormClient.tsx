"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaArrowLeft, FaCalendarAlt, FaCheckCircle, FaMapMarkerAlt, FaPhoneAlt, FaUsers, FaTag } from "react-icons/fa";
import type { AdventureDetailPayload } from "./adventureDetailClient";

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
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate <= startDate) return 1;
  return Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
};

type AdventureBookingFormProps = {
  adventure: AdventureDetailPayload;
  searchParams: Record<string, string | string[] | undefined>;
};

type SelectionItem = {
  key: string;
  option: AdventureDetailPayload["options"][number];
  quantity: number;
  subtotal: number;
  taxes: number;
};

const AdventureBookingFormClient: React.FC<AdventureBookingFormProps> = ({ adventure, searchParams }) => {
  const router = useRouter();

  const start = typeof searchParams.start === "string" ? searchParams.start : "";
  const end = typeof searchParams.end === "string" ? searchParams.end : "";
  const adults = Number(searchParams.adults ?? 2) || 2;
  const children = Number(searchParams.children ?? 0) || 0;
  const infants = Number(searchParams.infants ?? 0) || 0;

  const parsedOptions = useMemo(() => {
    const raw = searchParams.options;
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
  }, [searchParams.options]);

  const selection = useMemo(() => {
    const items: SelectionItem[] = [];
    parsedOptions.forEach(({ key, quantity }) => {
      const option =
        adventure.options.find((opt) => (opt._id?.toString() || opt.name) === key) ||
        adventure.options.find((opt) => opt.name === key);
      if (!option) return;
      const safeQuantity = Math.min(quantity, Math.max(1, option.available ?? quantity));
      const days = calculateDays(start, end);
      const subtotal = option.price * safeQuantity * days;
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
      totalOptions: items.reduce((acc, item) => acc + item.quantity, 0),
    };
  }, [parsedOptions, adventure.options, start, end]);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
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
        console.warn("Unable to prefill guest details", error);
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

    if (!selection.totalOptions) {
      setSubmitError("Please select at least one adventure option on the previous page.");
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
      !sanitizedForm.country
    ) {
      setSubmitError("Please complete all required guest, contact, and address details.");
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
        serviceType: "adventure",
        adventureId: adventure._id,
        startDate: start,
        endDate: end,
        guests: { adults, children, infants },
        customer: {
          fullName: sanitizedForm.fullName,
          email: sanitizedForm.email,
          phone: sanitizedForm.phone,
          notes: sanitizedForm.specialRequests ? sanitizedForm.specialRequests : undefined,
        },
        currency: selection.items[0]?.option.currency || "INR",
        items: selection.items.map(({ option, quantity }) => ({
          optionId: option._id,
          optionName: option.name,
          quantity,
          price: option.price,
          taxes: option.taxes ?? 0,
        })),
        fees: PLATFORM_FEE,
        metadata: {
          address: formattedAddress,
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

  const adventureLocation = useMemo(
    () => [adventure.location.address, adventure.location.city, adventure.location.state, adventure.location.country].filter(Boolean).join(", "),
    [adventure.location.address, adventure.location.city, adventure.location.state, adventure.location.country]
  );

  if (!selection.items.length) {
    return (
      <div className="min-h-screen bg-sky-50">
        <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 text-center">
          <div className="rounded-3xl bg-white p-10 shadow-xl">
            <h1 className="text-2xl font-semibold text-gray-900">Pick an adventure option first</h1>
            <p className="mt-3 text-sm text-gray-600">
              It looks like your booking session expired or no option was selected. Head back to the adventure details and choose the experiences you want.
            </p>
            <button
              type="button"
              onClick={() => router.push(`/adventures/${adventure._id}`)}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-green-700"
            >
              <FaArrowLeft /> Back to adventure
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
            <h1 className="mt-4 text-2xl font-semibold text-gray-900">Booking confirmed!</h1>
            <p className="mt-3 text-sm text-gray-600">
              We’ve emailed {bookingSuccess.customer?.email} with your confirmation. Reference number{" "}
              <span className="font-semibold text-gray-900">{bookingSuccess._id}</span>. Redirecting you to your bookings dashboard.
            </p>
            <div className="mt-6 space-y-2 text-sm text-gray-600">
              <p>
                <FaCalendarAlt className="mr-2 inline text-green-500" />
                {formatDateDisplay(start)} — {formatDateDisplay(end)} ({calculateDays(start, end)} day{calculateDays(start, end) === 1 ? "" : "s"})
              </p>
              <p>
                <FaUsers className="mr-2 inline text-green-500" />
                {adults} adult{adults === 1 ? "" : "s"}
                {children > 0 && ` · ${children} child${children === 1 ? "" : "ren"}`}
                {infants > 0 && ` · ${infants} infant${infants === 1 ? "" : "s"}`}
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
                onClick={() => router.push(`/adventures/${adventure._id}`)}
                className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 transition hover:bg-green-100"
              >
                <FaArrowLeft /> Back to adventure details
              </button>
              <h1 className="mt-3 text-2xl font-semibold text-gray-900">Complete your booking</h1>
              <p className="mt-1 text-sm text-gray-600">
                Share traveller information and any special notes so the guide can prepare for your arrival.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700">
              <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1">
                <FaCalendarAlt className="text-green-500" />
                {formatDateDisplay(start)} · {formatDateDisplay(end)}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1">
                <FaUsers className="text-green-500" /> {adults} adult{adults === 1 ? "" : "s"}
                {children > 0 && ` · ${children} child${children === 1 ? "" : "ren"}`}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
          <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl bg-white p-6 shadow-lg">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Lead traveller details</h2>
              <p className="mt-1 text-sm text-gray-600">
                We’ll share these with your adventure host. Emergency contact info helps guides plan safely.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm text-gray-700">
                Full name <span className="text-xs text-rose-500">*</span>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleFieldChange("fullName")}
                  className="rounded-lg border border-gray-200 px-3 py-2 focus:border-green-500 focus:outline-none"
                  placeholder="Primary traveller name"
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
            </div>

            <div className="grid gap-4 md:grid-cols-2">
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
              <label className="flex flex-col gap-1 text-sm text-gray-700">
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
              Special requests & fitness notes
              <textarea
                rows={4}
                value={formData.specialRequests}
                onChange={handleFieldChange("specialRequests")}
                className="rounded-lg border border-gray-200 px-3 py-2 focus:border-green-500 focus:outline-none"
                placeholder="Share dietary needs, health conditions, or expectations for your guide."
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
              {adventure.images?.length ? (
                <Image src={adventure.images[0]} alt={adventure.name} fill className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center bg-gray-100 text-sm text-gray-500">Image coming soon</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <p className="text-xs uppercase tracking-wide text-white/80">{adventure.category}</p>
                <h3 className="text-lg font-semibold">{adventure.name}</h3>
              </div>
            </div>

            <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
              <p className="flex items-center gap-2 text-gray-900">
                <FaMapMarkerAlt className="text-green-600" /> {adventureLocation}
              </p>
              <p className="mt-2 flex items-center gap-2">
                <FaCalendarAlt className="text-green-600" />
                {formatDateDisplay(start)} → {formatDateDisplay(end)} ({calculateDays(start, end)} day{calculateDays(start, end) === 1 ? "" : "s"})
              </p>
              <p className="mt-2 flex items-center gap-2">
                <FaUsers className="text-green-600" /> {adults} adult{adults === 1 ? "" : "s"}
                {children > 0 && ` · ${children} child${children === 1 ? "" : "ren"}`}
                {infants > 0 && ` · ${infants} infant${infants === 1 ? "" : "s"}`}
              </p>
            </div>

            <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-700">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Your selections</p>
              <ul className="space-y-3">
                {selection.items.map(({ option, quantity }) => (
                  <li key={(option._id as string) || option.name} className="rounded-xl bg-gray-50 px-3 py-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-900">{option.name}</p>
                        <p className="text-xs text-gray-500">
                          {quantity} spot{quantity === 1 ? "" : "s"} · {option.duration} · {option.difficulty}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        ₹{(option.price * quantity * calculateDays(start, end)).toLocaleString()}
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
              <div className="flex gap-2">                <input
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
                Payment is coordinated with the adventure operator. This site collects your booking details only.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default AdventureBookingFormClient;

