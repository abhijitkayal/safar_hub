"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import PageLoader from "../common/PageLoader";

export const ORDER_STATUS_OPTIONS = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"] as const;

export type OrderFulfillmentRow = {
  orderId: string;
  itemId: string;
  variantId?: string | null;
  productName: string;
  productImage?: string | null;
  quantity: number;
  unitPrice?: number;
  soldAmount: number;
  buyerName: string;
  buyerEmail?: string | null;
  buyerPhone?: string | null;
  buyerAddress: {
    line1?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  deliveryDate?: string | null;
  status: string;
  orderStatus?: string;
  orderCreatedAt?: string | null;
  vendorName?: string | null;
  vendorId?: string | null;
  cancelledAt?: string | null;
  cancellationReason?: string | null;
  cancelledByRole?: string | null;
};

type Props = {
  fetchUrl: string;
  title: string;
  description?: string;
  showVendorColumn?: boolean;
  emptyMessage?: string;
  readOnly?: boolean; // If true, status cannot be edited (for admin view)
};

const toInputDate = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
};

const formatDisplayDate = (value?: string | null) => {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";
  return date.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
};

const normalizeStatus = (status?: string) => {
  if (!status || status === "Placed") return "Pending";
  if (ORDER_STATUS_OPTIONS.includes(status as any)) return status;
  return "Pending";
};

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

type FormState = Record<
  string,
  {
    status: string;
    deliveryDate: string;
  }
>;

const OrderFulfillmentTable = ({
  fetchUrl,
  title,
  description,
  showVendorColumn = false,
  emptyMessage = "No orders found yet.",
  readOnly = false,
}: Props) => {
  const [rows, setRows] = useState<OrderFulfillmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formState, setFormState] = useState<FormState>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const rowKey = (row: OrderFulfillmentRow) => `${row.orderId}_${row.itemId}_${row.variantId ?? "base"}`;

  const syncFormState = (nextRows: OrderFulfillmentRow[]) => {
    const nextState: FormState = {};
    nextRows.forEach((row) => {
      const key = rowKey(row);
      nextState[key] = {
        status: normalizeStatus(row.status),
        deliveryDate: toInputDate(row.deliveryDate),
      };
    });
    setFormState(nextState);
  };

  const loadRows = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(fetchUrl, { credentials: "include" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.message || "Failed to load orders");
      }
      const payload: OrderFulfillmentRow[] = data.data || [];
      setRows(payload);
      syncFormState(payload);
    } catch (err: any) {
      console.error("Fulfillment table fetch failed", err);
      setError(err?.message || "Unable to fetch orders");
    } finally {
      setLoading(false);
      setSavingKey(null);
    }
  };

  useEffect(() => {
    loadRows();
  }, [fetchUrl]);

  const handleFieldChange = (key: string, field: "status" | "deliveryDate", value: string) => {
    setFormState((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || { status: "Pending", deliveryDate: "" }),
        [field]: value,
      },
    }));
  };

  const isDirty = (row: OrderFulfillmentRow) => {
    const key = rowKey(row);
    const state = formState[key];
    if (!state) return false;
    const statusChanged = normalizeStatus(row.status) !== state.status;
    const deliveryChanged = toInputDate(row.deliveryDate) !== state.deliveryDate;
    return statusChanged || deliveryChanged;
  };

  const handleUpdate = async (row: OrderFulfillmentRow) => {
    const key = rowKey(row);
    const state = formState[key];
    if (!state) return;
    setSavingKey(key);
    try {
      const payload = {
        itemType: "Product",
        itemId: row.itemId,
        variantId: row.variantId,
        status: state.status,
        deliveryDate: state.deliveryDate || null,
      };

      const res = await fetch(`/api/orders/${row.orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.message || "Failed to update order");
      }

      await loadRows();
    } catch (err: any) {
      console.error("Order update failed", err);
      alert(err?.message || "Unable to update order right now. Please retry.");
      setSavingKey(null);
    }
  };

  const tableContent = useMemo(() => {
    if (loading) {
      return (
        <div className="py-12">
          <PageLoader fullscreen={false} />
        </div>
      );
    }

    if (error) {
      return (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          <p className="font-semibold">We couldn&apos;t fetch the orders.</p>
          <p className="mt-1">{error}</p>
          <button
            type="button"
            onClick={loadRows}
            className="mt-4 inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-white text-xs font-semibold"
          >
            Retry
          </button>
        </div>
      );
    }

    if (!rows.length) {
      return (
        <div className="py-14 text-center text-sm text-gray-500">
          <p>{emptyMessage}</p>
          <button
            type="button"
            onClick={loadRows}
            className="mt-4 inline-flex items-center rounded-full border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700"
          >
            Refresh
          </button>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100 text-sm">
          <thead>
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="py-3 pr-4">Product</th>
              {showVendorColumn && <th className="py-3 pr-4">Vendor</th>}
              <th className="py-3 pr-4">Sold Amount</th>
              <th className="py-3 pr-4">Quantity</th>
              <th className="py-3 pr-4">Buyer</th>
              <th className="py-3 pr-4">Address</th>
              <th className="py-3 pr-4">Delivery Date</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3 pr-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row) => {
              const key = rowKey(row);
              const form = formState[key] || { status: normalizeStatus(row.status), deliveryDate: toInputDate(row.deliveryDate) };
              const isSaving = savingKey === key;
              return (
                <tr key={key} className="align-top">
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-gray-100">
                        {row.productImage ? (
                          <Image src={row.productImage} alt={row.productName} fill className="object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">No image</div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{row.productName}</p>
                        <p className="text-xs text-gray-500">
                          #{row.orderId?.slice(-6)?.toUpperCase()} •{" "}
                          {row.orderCreatedAt ? new Date(row.orderCreatedAt).toLocaleDateString("en-IN") : "Unknown date"}
                        </p>
                      </div>
                    </div>
                  </td>
                  {showVendorColumn && (
                    <td className="py-4 pr-4">
                      <p className="font-medium text-gray-900">{row.vendorName || "Admin"}</p>
                      {row.vendorId && <p className="text-xs text-gray-500">#{row.vendorId.slice(-6)}</p>}
                    </td>
                  )}
                  <td className="py-4 pr-4 font-semibold text-gray-900">{currencyFormatter.format(row.soldAmount ?? 0)}</td>
                  <td className="py-4 pr-4 text-gray-700">{row.quantity}</td>
                  <td className="py-4 pr-4 text-sm text-gray-700">
                    <p className="font-semibold text-gray-900">{row.buyerName}</p>
                    {row.buyerEmail && <p className="text-xs text-gray-500">{row.buyerEmail}</p>}
                    {row.buyerPhone && <p className="text-xs text-gray-500">{row.buyerPhone}</p>}
                  </td>
                  <td className="py-4 pr-4 text-xs text-gray-600">
                    <p>
                      {row.buyerAddress.line1}
                      {row.buyerAddress.city ? `, ${row.buyerAddress.city}` : ""}
                    </p>
                    <p>
                      {row.buyerAddress.state}
                      {row.buyerAddress.pincode ? ` - ${row.buyerAddress.pincode}` : ""}
                    </p>
                  </td>
                  <td className="py-4 pr-4">
                    <label className="flex flex-col text-xs font-semibold text-gray-500">
                      <span>Expected</span>
                      {readOnly ? (
                        <div className="mt-1 w-36 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-sm text-gray-700">
                          {formatDisplayDate(row.deliveryDate)}
                        </div>
                      ) : (
                        <>
                          <input
                            type="date"
                            value={form.deliveryDate}
                            onChange={(event) => handleFieldChange(key, "deliveryDate", event.target.value)}
                            className="mt-1 w-36 rounded border border-gray-200 px-2 py-1 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none"
                            disabled={isSaving}
                          />
                          <span className="text-[10px] font-normal text-gray-400">{formatDisplayDate(row.deliveryDate)}</span>
                        </>
                      )}
                    </label>
                  </td>
                  <td className="py-4 pr-4">
                    {readOnly ? (
                      <div className="w-36 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-sm text-gray-700">
                        {form.status}
                      </div>
                    ) : (
                      <select
                        value={form.status}
                        onChange={(event) => handleFieldChange(key, "status", event.target.value)}
                        className="w-36 rounded border border-gray-200 px-2 py-1 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none"
                        disabled={isSaving}
                      >
                        {ORDER_STATUS_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="py-4 text-right">
                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() => handleUpdate(row)}
                        disabled={!isDirty(row) || isSaving}
                        className={`inline-flex items-center rounded-full px-4 py-1.5 text-xs font-semibold ${
                          !isDirty(row) || isSaving
                            ? "cursor-not-allowed border border-gray-200 text-gray-400"
                            : "bg-indigo-600 text-white hover:bg-indigo-700"
                        }`}
                      >
                        {isSaving ? "Saving..." : "Update"}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }, [loading, error, rows, formState, savingKey, showVendorColumn, readOnly]);

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
          <p className="mt-2 text-xs uppercase tracking-wide text-gray-400">{rows.length} records</p>
        </div>
        <button
          type="button"
          onClick={loadRows}
          className="inline-flex items-center rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:border-gray-300"
        >
          Refresh
        </button>
      </div>
      <div className="mt-6">{tableContent}</div>
    </section>
  );
};

export default OrderFulfillmentTable;

