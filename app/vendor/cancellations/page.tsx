"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import BookingTable, { type BookingRecord } from "@/app/components/bookings/BookingTable";
import CancelledOrdersTable, { type CancelledOrderRecord } from "@/app/components/orders/CancelledOrdersTable";
import { useVendorLayout } from "../VendorLayoutContext";

const POLL_INTERVAL_MS = 8000;

const VendorCancellationsPage = () => {
  const { user } = useVendorLayout();
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [orders, setOrders] = useState<CancelledOrderRecord[]>([]);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const hasServices = Array.isArray(user?.vendorServices) && user.vendorServices.length > 0;
  const isSeller = Boolean(user?.isSeller);

  const loadBookings = useCallback(async () => {
    if (!hasServices) return;
    try {
      setBookingError(null);
      setLoadingBookings(true);
      const res = await fetch("/api/bookings?status=cancelled", { credentials: "include", cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.message || "Unable to load booking cancellations");
      }
      setBookings(data.bookings ?? []);
    } catch (error) {
      console.error("Vendor booking cancellations fetch failed", error);
      const message = error instanceof Error ? error.message : "Failed to load booking cancellations.";
      setBookingError(message);
    } finally {
      setLoadingBookings(false);
    }
  }, [hasServices]);

  const loadOrders = useCallback(async () => {
    if (!isSeller) return;
    try {
      setOrderError(null);
      setLoadingOrders(true);
      const res = await fetch("/api/vendor/orders?status=Cancelled", { credentials: "include", cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.message || "Unable to load cancelled orders");
      }
      setOrders(data.data ?? []);
    } catch (error) {
      console.error("Vendor cancelled orders fetch failed", error);
      const message = error instanceof Error ? error.message : "Failed to load cancelled orders.";
      setOrderError(message);
    } finally {
      setLoadingOrders(false);
    }
  }, [isSeller]);

  useEffect(() => {
    loadBookings();
    loadOrders();
  }, [loadBookings, loadOrders]);

  useEffect(() => {
    if (!hasServices && !isSeller) return;
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        loadBookings();
        loadOrders();
      }
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [hasServices, isSeller, loadBookings, loadOrders]);

  const vendorTypeLabel = useMemo(() => {
    if (hasServices && isSeller) return "bookings and orders";
    if (hasServices) return "bookings";
    if (isSeller) return "orders";
    return "cancellations";
  }, [hasServices, isSeller]);

  return (
    <div className="space-y-8 lg:pt-15 pt-0">
      <header className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-wide text-green-600 font-semibold">Cancellation centre</p>
        <h1 className="text-3xl font-bold text-gray-900">Your cancelled {vendorTypeLabel}</h1>
        <p className="text-sm text-gray-600">
          Every cancellation is synced instantly so you can free inventory, follow up with travellers, and keep the admin
          team aligned.
        </p>
      </header>

      {hasServices && (
        <section className="space-y-4 rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Cancelled bookings</h2>
              <p className="text-sm text-gray-500">Includes every stay or experience guests cancelled.</p>
              {loadingBookings && <p className="text-xs uppercase tracking-wide text-gray-400 mt-2">Refreshing…</p>}
            </div>
            <button
              type="button"
              onClick={loadBookings}
              className="inline-flex items-center rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:border-gray-300"
            >
              Refresh
            </button>
          </div>

          {bookingError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
              <p className="font-semibold">We couldn&apos;t retrieve cancelled bookings.</p>
              <p className="mt-1">{bookingError}</p>
            </div>
          ) : (
            <BookingTable
              bookings={bookings}
              variant="vendor"
              showCancellationMeta
              emptyMessage="Cancelled bookings will appear here instantly, so you can free up those dates."
            />
          )}
        </section>
      )}

      {isSeller && (
        <div className="space-y-4">
          {orderError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">We couldn&apos;t retrieve cancelled orders.</p>
                  <p className="mt-1">{orderError}</p>
                </div>
                <button
                  type="button"
                  onClick={loadOrders}
                  className="rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:border-gray-300"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : (
            <CancelledOrdersTable
              title="Cancelled product orders"
              description="When a user cancels a product order we automatically restore your stock levels."
              rows={orders}
              variant="vendor"
              refreshing={loadingOrders}
              onRefresh={loadOrders}
              emptyMessage="As soon as a customer cancels a product order it will appear here."
            />
          )}
        </div>
      )}

      {!hasServices && !isSeller && (
        <div className="rounded-3xl border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-gray-600">
          Your vendor account does not include services or products yet. Once you publish listings or products, cancelled
          entries will appear here automatically.
        </div>
      )}
    </div>
  );
};

export default VendorCancellationsPage;