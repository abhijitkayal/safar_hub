"use client";

import { useEffect, useState } from "react";

type Purchase = {
  _id: string;
  type: "Service" | "Product";
  name: string;
  status: string;
  price: number;
};

export default function OrderTable({ refreshKey = 0 }: { refreshKey?: number }) {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const res = await fetch(`/api/vendor/stats?t=${Date.now()}`, { 
          credentials: "include",
          cache: "no-store"
        });
        const data = await res.json();
        if (data.success && data.recentPurchases) {
          setPurchases(data.recentPurchases);
        }
      } catch (error) {
        console.error("Failed to fetch purchases", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, [refreshKey]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    // Handle case where status might be undefined or null
    if (!status) {
      return "bg-gray-100 text-gray-600";
    }
    
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-600";
      case "confirmed":
        return "bg-blue-100 text-blue-600";
      case "pending":
        return "bg-yellow-100 text-yellow-600";
      case "cancelled":
        return "bg-red-100 text-red-600";
      case "processing":
        return "bg-indigo-100 text-indigo-600";
      case "shipped":
        return "bg-sky-100 text-sky-600";
      case "delivered":
        return "bg-emerald-100 text-emerald-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow text-gray-900">
      <h3 className="font-semibold mb-4">Recent Purchases</h3>
      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : purchases.length === 0 ? (
        <p className="text-sm text-gray-500">No recent purchases</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-50 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Item Type</th>
                <th className="px-4 py-3">Item Name</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {purchases.map((purchase) => (
                <tr key={purchase._id} className="transition hover:bg-gray-50/60">
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                        purchase.type === "Product" ? "bg-purple-50 text-purple-700" : "bg-teal-50 text-teal-700"
                      }`}
                    >
                      {purchase.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{purchase.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{purchase.type.toLowerCase()} booking</p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(purchase.status)}`}>
                      {purchase.status || "N/A"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatPrice(purchase.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
