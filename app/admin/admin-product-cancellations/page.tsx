"use client";

import { useEffect, useState } from "react";
import type { CancelledOrderRecord } from "@/app/components/orders/CancelledOrdersTable";

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
};

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const AdminProductCancellationsPage = () => {
  const [rows, setRows] = useState<CancelledOrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const res = await fetch("/api/admin/orders?scope=admin&status=Cancelled", {
        credentials: "include",
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.message || "Unable to load cancellations");
      }
      setRows(data.data ?? []);
    } catch (err: any) {
      setError(err?.message || "Failed to load cancellations");
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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
        <p className="text-xs uppercase tracking-wide text-green-600 font-semibold">Admin catalogue</p>
        <h1 className="text-3xl font-bold text-gray-900">Admin product cancellations</h1>
        <p className="text-sm text-gray-600">
          Only cancellations from the admin-managed catalogue are included here so you can reconcile pricing, stock, and
          buyer communication quickly.
        </p>
        {refreshing && (
          <span className="inline-flex items-center gap-2 text-xs text-gray-500">
            <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-500" />
            Updating…
          </span>
        )}
      </header>

      <section className="space-y-6 rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Cancellation log</h2>
            <p className="text-sm text-gray-500">
              Buyer details, quantities, pricing, and the latest reason captured at cancellation time.
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

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
            <p className="font-semibold">We couldn&apos;t retrieve admin-side cancellations.</p>
            <p className="mt-1">{error}</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-500">
            When an admin-listed product order gets cancelled it will show up here instantly.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm text-gray-700">
              <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left">Product</th>
                  <th className="px-4 py-3 text-left">Buyer details</th>
                  <th className="px-4 py-3 text-left">Quantity</th>
                  <th className="px-4 py-3 text-left">Product price</th>
                  <th className="px-4 py-3 text-left">Cancellation reason</th>
                  <th className="px-4 py-3 text-left">Cancellation date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {rows.map((row) => (
                  <tr key={`${row.orderId}-${row.productName}-${row.quantity}`} className="align-top hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      <div className="flex flex-col">
                        <span>{row.productName}</span>
                        <span className="text-xs text-gray-500">#{row.orderId.slice(-8).toUpperCase()}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      <div className="font-semibold text-gray-900">{row.buyerName}</div>
                      {row.buyerEmail && <div>{row.buyerEmail}</div>}
                      {row.buyerPhone && <div>{row.buyerPhone}</div>}
                      {row.buyerAddress?.city && (
                        <div className="text-gray-500">
                          {[row.buyerAddress?.city, row.buyerAddress?.state].filter(Boolean).join(", ")}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">{row.quantity}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {currencyFormatter.format(row.soldAmount ?? (row.unitPrice ?? 0) * row.quantity)}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {row.cancellationReason ? <span className="line-clamp-3">{row.cancellationReason}</span> : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{formatDate(row.cancelledAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminProductCancellationsPage;


