"use client";

import { useEffect, useState } from "react";
import BookingTable, { type BookingRecord } from "@/app/components/bookings/BookingTable";
import CancelledOrdersTable, { type CancelledOrderRecord } from "@/app/components/orders/CancelledOrdersTable";

const POLL_INTERVAL_MS = 8000;

const AdminCancellationPage = () => {
  const [bookingRows, setBookingRows] = useState<BookingRecord[]>([]);
  const [orderRows, setOrderRows] = useState<CancelledOrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);

  const fetchBookings = async () => {
    const res = await fetch("/api/bookings?status=cancelled", { credentials: "include", cache: "no-store" });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data?.message || "Unable to load cancelled bookings");
    }
    return data.bookings ?? [];
  };

  const fetchOrders = async () => {
    const scopes = ["admin", "vendor"];
    const payloads = await Promise.all(
      scopes.map(async (scope) => {
        const res = await fetch(`/api/admin/orders?scope=${scope}&status=Cancelled`, {
          credentials: "include",
          cache: "no-store",
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data?.message || "Unable to load cancelled orders");
        }
        return data.data ?? [];
      })
    );
    return payloads.flat();
  };

  const loadData = async () => {
    try {
      setRefreshing(true);
      setBookingError(null);
      setOrderError(null);
      const [bookings, orders] = await Promise.all([fetchBookings(), fetchOrders()]);
      setBookingRows(bookings);
      setOrderRows(orders);
    } catch (error: any) {
      const message = error?.message || "Failed to refresh cancellations.";
      if (message.toLowerCase().includes("booking")) {
        setBookingError(message);
      } else if (message.toLowerCase().includes("order")) {
        setOrderError(message);
      } else {
        setBookingError(message);
        setOrderError(message);
      }
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        loadData();
      }
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8 ">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-green-600 font-semibold">Realtime overview</p>
        <h1 className="text-3xl font-bold text-gray-900">Platform cancellations</h1>
        <p className="text-sm text-gray-600">
          Bookings and product orders are synced the moment a user or vendor cancels so the operations team can react
          quickly.
        </p>
        {refreshing && (
          <span className="inline-flex items-center gap-2 text-xs text-gray-500">
            <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-500" />
            Updating…
          </span>
        )}
      </header>

      <section className="space-y-4 rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Cancelled bookings</h2>
            <p className="text-sm text-gray-500">
              Every cancelled stay, tour, adventure, or rental with guest and vendor context.
            </p>
          </div>
          <button
            type="button"
            onClick={loadData}
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
            bookings={bookingRows}
            variant="admin"
            showCancellationMeta
            emptyMessage="Cancelled bookings across every service will appear here immediately."
          />
        )}
      </section>

      <div>
        {orderError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">We couldn&apos;t retrieve cancelled orders.</p>
                <p className="mt-1">{orderError}</p>
              </div>
              <button
                type="button"
                onClick={loadData}
                className="rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:border-gray-300"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <CancelledOrdersTable
            title="Cancelled product orders"
            description="Includes admin-managed catalogue and seller storefront orders."
            rows={orderRows}
            variant="admin"
            refreshing={refreshing}
            onRefresh={loadData}
            emptyMessage="As soon as a product order is cancelled it will appear here."
          />
        )}
      </div>
    </div>
  );
};

export default AdminCancellationPage;

