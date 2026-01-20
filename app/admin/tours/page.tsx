// app/admin/tours/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaClock, FaEye, FaMapMarkerAlt } from "react-icons/fa";

interface OptionSummary {
  name: string;
  price: number;
  duration: string;
}

interface TourSummary {
  _id: string;
  name: string;
  category: "group-tours" | "tour-packages";
  location: {
    city: string;
    state: string;
  };
  vendorId?: {
    fullName: string;
    email: string;
  } | null;
  options: OptionSummary[];
  heroHighlights: string[];
  createdAt: string;
}

export default function AdminToursPage() {
  const [loading, setLoading] = useState(true);
  const [tours, setTours] = useState<TourSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTours = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/vendor/tours?all=true", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data?.message || "Failed to fetch tours");
        setTours(data.tours || []);
      } catch (err: any) {
        setError(err?.message || "Unable to fetch tours");
      } finally {
        setLoading(false);
      }
    };

    loadTours();
  }, []);

  const getCategoryLabel = (category: string) => {
    const map: Record<string, string> = {
      "group-tours": "Group Tours",
      "tour-packages": "Tour Packages",
    };
    return map[category] || category;
  };

  const formatDuration = (duration: string) => {
    return duration.replace("Full day", "8+ hrs");
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Tours catalogue</h1>
        <p className="mt-1 text-sm text-gray-600">Monitor all vendor-submitted tours and their options.</p>
      </div>

      <div>
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
            </div>
          ) : error ? (
            <div className="rounded-xl bg-red-50 p-6 text-red-700">{error}</div>
          ) : tours.length === 0 ? (
            <div className="rounded-xl bg-white p-8 text-center shadow">
              <FaMapMarkerAlt className="mx-auto mb-4 text-4xl text-gray-400" />
              <p className="text-gray-600">No tours have been submitted yet.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl bg-white shadow">
              {/* Desktop Table */}
              <div className="hidden w-full min-w-[900px] lg:block">
                <table className="w-full text-left text-sm text-gray-700">
                  <thead className="bg-gray-100 text-xs uppercase text-gray-600">
                    <tr>
                      <th className="px-4 py-3">Tour</th>
                      <th className="px-4 py-3">Vendor</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Options & pricing</th>
                      <th className="px-4 py-3">Highlights</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {tours.map((tour) => {
                      const lowestPrice = tour.options?.length
                        ? Math.min(...tour.options.map((opt) => opt.price)).toLocaleString()
                        : "—";
                      const durations = tour.options?.map((o) => o.duration).filter(Boolean);
                      const uniqueDurations = durations?.length
                        ? [...new Set(durations)].slice(0, 2).map(formatDuration).join(" • ")
                        : "—";

                      return (
                        <tr key={tour._id} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <p className="font-semibold text-gray-900">{tour.name}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <FaMapMarkerAlt className="text-gray-400" />
                              {tour.location.city}, {tour.location.state}
                            </p>
                          </td>
                          <td className="px-4 py-4">
                            {tour.vendorId ? (
                              <div className="space-y-1">
                                <p className="font-medium text-gray-900">{tour.vendorId.fullName}</p>
                                <p className="text-xs text-gray-500">{tour.vendorId.email}</p>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-500">Vendor removed</span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                              {getCategoryLabel(tour.category)}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-700">
                            <p className="flex items-center gap-2 text-gray-900">
                              <FaClock className="text-gray-500" /> {tour.options?.length || 0} option(s)
                            </p>
                            <p className="text-xs text-gray-500">
                              From: ₹{lowestPrice} • {uniqueDurations}
                            </p>
                          </td>
                          <td className="px-4 py-4 text-xs text-gray-600">
                            <div className="flex flex-wrap gap-2">
                              {tour.heroHighlights?.slice(0, 3).map((highlight) => (
                                <span
                                  key={highlight}
                                  className="rounded-full bg-gray-100 px-3 py-1 text-gray-700"
                                >
                                  {highlight}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <Link
                              href={`/tours/${tour._id}`}
                              className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-600"
                            >
                              <FaEye /> View
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="grid gap-4 p-4 lg:hidden">
                {tours.map((tour) => {
                  const lowestPrice = tour.options?.length
                    ? Math.min(...tour.options.map((opt) => opt.price)).toLocaleString()
                    : "—";

                  return (
                    <div
                      key={tour._id}
                      className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-base font-semibold text-gray-900">{tour.name}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <FaMapMarkerAlt className="text-gray-400" />
                            {tour.location.city}, {tour.location.state}
                          </p>
                        </div>
                        <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                          {getCategoryLabel(tour.category)}
                        </span>
                      </div>

                      <div className="mt-3 space-y-2 text-xs text-gray-600">
                        <p>
                          Vendor: {tour.vendorId?.fullName || "Removed"}
                          {tour.vendorId?.email ? ` • ${tour.vendorId.email}` : ""}
                        </p>
                        <p>Options: {tour.options?.length || 0}</p>
                        <p>Starting: ₹{lowestPrice}</p>
                        {tour.heroHighlights?.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {tour.heroHighlights.slice(0, 2).map((highlight) => (
                              <span
                                key={highlight}
                                className="rounded-full bg-gray-100 px-3 py-1 text-gray-700"
                              >
                                {highlight}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-3 text-right">
                        <Link
                          href={`/tours/${tour._id}`}
                          className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-600"
                        >
                          <FaEye /> View details
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
      </div>
    </div>
  );
}