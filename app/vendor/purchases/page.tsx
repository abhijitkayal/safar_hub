"use client";

import { useEffect, useState } from "react";
import BookingTable, { type BookingRecord } from "@/app/components/bookings/BookingTable";
import PageLoader from "@/app/components/common/PageLoader";
import OrderFulfillmentTable from "@/app/components/orders/OrderFulfillmentTable";
import { useVendorLayout } from "../VendorLayoutContext";

const VendorPurchasesPage = () => {
  const { user } = useVendorLayout();
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [initialFetch, setInitialFetch] = useState(true);
  const [actionBookingId, setActionBookingId] = useState<string | null>(null);

  const hasServices = Array.isArray(user?.vendorServices) && user.vendorServices.length > 0;
  const isSeller = Boolean(user?.isSeller);

  const loadBookings = async () => {
    if (!hasServices) {
      setInitialFetch(false);
      return;
    }

    try {
      setBookingError(null);
      const res = await fetch("/api/bookings", { credentials: "include" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.message || "Unable to load bookings");
      }
      setBookings(data.bookings ?? []);
    } catch (err: any) {
      console.error("Vendor bookings fetch failed", err);
      setBookingError(err?.message || "Failed to load bookings. Please try again.");
    } finally {
      setActionBookingId(null);
      setInitialFetch(false);
    }
  };

  useEffect(() => {
    if (user && hasServices) {
      loadBookings();
    } else {
      setInitialFetch(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id, hasServices]);

  const handleStatusChange = async (bookingId: string, status: string) => {
    const payload: Record<string, any> = { status };

    if (status === "cancelled") {
      const reason = window.prompt("Please explain why this booking is being cancelled.");
      if (reason === null) {
        return;
      }
      if (!reason.trim()) {
        alert("A short cancellation reason is required.");
        return;
      }
      payload.reason = reason.trim();
    }

    setActionBookingId(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.message || "Failed to update booking status");
      }
      await loadBookings();
    } catch (err: any) {
      alert(err?.message || "Unable to update status. Please try again.");
      setActionBookingId(null);
    }
  };

  if (!user) return <PageLoader fullscreen={false} />;

  return (
    <div className="space-y-8 lg:pt-15 pt-0">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Purchases</h1>
        <p className="text-sm text-gray-600">
          Manage every booking or product order connected to your account. Only the experiences or products you offer are
          shown below.
        </p>
      </div>

      {hasServices && (
        <section className="space-y-4 rounded-3xl bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Booking Requests</h2>
            <p className="text-sm text-gray-500">
              These bookings are for the services you registered (stays, tours, adventures, etc.).
            </p>
          </div>

          {initialFetch ? (
            <PageLoader fullscreen={false} className="py-12" />
          ) : bookingError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
              <p className="font-semibold">We couldn&apos;t retrieve your bookings.</p>
              <p className="mt-2">{bookingError}</p>
              <button
                type="button"
                onClick={() => loadBookings()}
                className="mt-4 inline-flex items-center justify-center rounded-full bg-green-600 px-5 py-2 text-sm font-semibold text-white shadow transition hover:bg-green-700"
              >
                Refresh page
              </button>
            </div>
          ) : (
            <div className="w-full">
              <div className="overflow-x-auto -mx-4 sm:mx-0 overflow-y-auto">
                <div className="inline-block min-w-full align-middle">
                  <div className="overflow-hidden">
                    <BookingTable
                      bookings={bookings}
                      variant="vendor"
                      loadingBookingId={actionBookingId}
                      onUpdateStatus={handleStatusChange}
                      emptyMessage="Bookings for your services will display here as soon as customers complete checkout."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {isSeller && (
        <OrderFulfillmentTable
          fetchUrl="/api/vendor/orders"
          title="Product Orders"
          description="Orders placed for the products you sell on the marketplace."
          emptyMessage="Orders for your products will appear here once customers start purchasing from your storefront."
        />
      )}
    </div>
  );
};

export default VendorPurchasesPage;

