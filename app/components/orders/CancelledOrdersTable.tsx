"use client";

type Address = {
  line1?: string;
  city?: string;
  state?: string;
  pincode?: string;
};

export type CancelledOrderRecord = {
  orderId: string;
  productName: string;
  quantity: number;
  unitPrice?: number;
  soldAmount?: number;
  buyerName: string;
  buyerEmail?: string | null;
  buyerPhone?: string | null;
  buyerAddress?: Address;
  vendorName?: string | null;
  vendorEmail?: string | null;
  vendorPhone?: string | null;
  orderCreatedAt?: string | null;
  cancelledAt?: string | null;
  cancellationReason?: string | null;
  cancelledByRole?: string | null;
};

type Props = {
  title: string;
  description?: string;
  rows: CancelledOrderRecord[];
  variant: "vendor" | "admin";
  refreshing?: boolean;
  onRefresh?: () => void;
  emptyMessage: string;
};

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const CancelledOrdersTable = ({
  title,
  description,
  rows,
  variant,
  refreshing = false,
  onRefresh,
  emptyMessage,
}: Props) => {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
          <p className="mt-2 text-xs uppercase tracking-wide text-gray-400">
            {rows.length} record{rows.length === 1 ? "" : "s"} {refreshing && "(refreshing…)"}
          </p>
        </div>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:border-gray-300"
          >
            Refresh
          </button>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="py-12 text-center text-sm text-gray-500">{emptyMessage}</div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm text-gray-700">
            <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">Product</th>
                {variant === "admin" && <th className="px-4 py-3 text-left">Vendor</th>}
                <th className="px-4 py-3 text-left">Quantity</th>
                <th className="px-4 py-3 text-left">Amount</th>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Address</th>
                <th className="px-4 py-3 text-left">Order Date</th>
                <th className="px-4 py-3 text-left">Cancelled On</th>
                <th className="px-4 py-3 text-left">Cancelled By</th>
                <th className="px-4 py-3 text-left">Reason</th>
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
                  {variant === "admin" && (
                    <td className="px-4 py-3 text-xs text-gray-600">
                      <div className="font-semibold text-gray-900">{row.vendorName || "Admin store"}</div>
                      <div>{row.vendorEmail || "—"}</div>
                      <div>{row.vendorPhone || "—"}</div>
                    </td>
                  )}
                  <td className="px-4 py-3">{row.quantity}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    {currencyFormatter.format(row.soldAmount ?? (row.unitPrice ?? 0) * row.quantity)}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    <div className="font-semibold text-gray-900">{row.buyerName}</div>
                    {row.buyerEmail && <div>{row.buyerEmail}</div>}
                    {row.buyerPhone && <div>{row.buyerPhone}</div>}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    <div>{row.buyerAddress?.line1 || "—"}</div>
                    <div>
                      {[row.buyerAddress?.city, row.buyerAddress?.state].filter(Boolean).join(", ")}
                    </div>
                    {row.buyerAddress?.pincode && <div>{row.buyerAddress.pincode}</div>}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{formatDate(row.orderCreatedAt)}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{formatDate(row.cancelledAt)}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 capitalize">
                    {row.cancelledByRole || "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {row.cancellationReason ? (
                      <span className="line-clamp-2">{row.cancellationReason}</span>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default CancelledOrdersTable;

