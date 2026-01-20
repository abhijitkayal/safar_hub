// app/admin/adventures/page.tsx
"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/app/components/Pages/admin/Sidebar";
import Link from "next/link";
import { FaClock, FaEye, FaMapMarkerAlt, FaMountain } from "react-icons/fa";

interface OptionSummary {
  name: string;
  price: number;
  duration: string;
  difficulty: string;
}

interface AdventureSummary {
  _id: string;
  name: string;
  category: "trekking" | "hiking" | "camping" | "water-rafting";
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

export default function AdminAdventuresPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adventures, setAdventures] = useState<AdventureSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAdventures = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/vendor/adventures?all=true", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data?.message || "Failed to fetch adventures");
        setAdventures(data.adventures || []);
      } catch (err: any) {
        setError(err?.message || "Unable to fetch adventures");
      } finally {
        setLoading(false);
      }
    };

    loadAdventures();
  }, []);

  const getCategoryLabel = (category: string) => {
    const map: Record<string, string> = {
      trekking: "Trekking",
      hiking: "Hiking",
      camping: "Camping",
      "water-rafting": "Water Rafting",
    };
    return map[category] || category;
  };

  const getDifficultyBadge = (difficulty: string) => {
    const colors: Record<string, string> = {
      easy: "bg-green-100 text-green-700",
      moderate: "bg-yellow-100 text-yellow-700",
      hard: "bg-orange-100 text-orange-700",
      extreme: "bg-red-100 text-red-700",
    };
    return colors[difficulty.toLowerCase()] || "bg-gray-100 text-gray-700";
  };

  const formatDuration = (duration: string) => {
    return duration.replace("Full day", "8+ hrs");
  };

  return (
    <div className="flex h-screen bg-sky-50 text-black overflow-hidden">
      {/* Desktop Sidebar */}
      {/* <div className="hidden lg:block lg:flex-shrink-0">
        <Sidebar />
      </div> */}

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-sky-50">
          <div className="flex items-center justify-between gap-3 p-3 border-b">
            <div className="flex items-center gap-3">
              {/* <button
                className="lg:hidden px-3 py-2 rounded border text-gray-700"
                onClick={() => setMobileSidebarOpen(true)}
                aria-label="Open menu"
              >
                Menu
              </button> */}
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 flex items-center gap-2">
                {/* <FaMountain className="text-green-600" /> */}
                Adventures catalogue
              </h1>
            </div>
            <p className="text-sm text-gray-600">Monitor all vendor-submitted adventure activities.</p>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto overflow-x-auto lg:overflow-x-hidden p-4 sm:p-6">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
            </div>
          ) : error ? (
            <div className="rounded-xl bg-red-50 p-6 text-red-700">{error}</div>
          ) : adventures.length === 0 ? (
            <div className="rounded-xl bg-white p-8 text-center shadow">
              <FaMountain className="mx-auto mb-4 text-4xl text-gray-400" />
              <p className="text-gray-600">No adventures have been submitted yet.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl bg-white shadow">
              {/* Desktop Table */}
              <div className="hidden w-full min-w-[900px] lg:block">
                <table className="w-full text-left text-sm text-gray-700">
                  <thead className="bg-gray-100 text-xs uppercase text-gray-600">
                    <tr>
                      <th className="px-4 py-3">Adventure</th>
                      <th className="px-4 py-3">Vendor</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Options & pricing</th>
                      <th className="px-4 py-3">Difficulty</th>
                      <th className="px-4 py-3">Highlights</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {adventures.map((adv) => {
                      const lowestPrice = adv.options?.length
                        ? Math.min(...adv.options.map((opt) => opt.price)).toLocaleString()
                        : "—";
                      const durations = adv.options?.map((o) => o.duration).filter(Boolean);
                      const uniqueDurations = durations?.length
                        ? [...new Set(durations)].slice(0, 2).map(formatDuration).join(" • ")
                        : "—";

                      return (
                        <tr key={adv._id} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <p className="font-semibold text-gray-900">{adv.name}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <FaMapMarkerAlt className="text-gray-400" />
                              {adv.location.city}, {adv.location.state}
                            </p>
                          </td>
                          <td className="px-4 py-4">
                            {adv.vendorId ? (
                              <div className="space-y-1">
                                <p className="font-medium text-gray-900">{adv.vendorId.fullName}</p>
                                <p className="text-xs text-gray-500">{adv.vendorId.email}</p>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-500">Vendor removed</span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                              {getCategoryLabel(adv.category)}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-700">
                            <p className="flex items-center gap-2 text-gray-900">
                              <FaClock className="text-gray-500" /> {adv.options?.length || 0} option(s)
                            </p>
                            <p className="text-xs text-gray-500">
                              From: ₹{lowestPrice} • {uniqueDurations}
                            </p>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-wrap gap-1">
                              {adv.options?.map((opt, i) => (
                                <span
                                  key={i}
                                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getDifficultyBadge(
                                    opt.difficulty
                                  )}`}
                                >
                                  {opt.difficulty}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-xs text-gray-600">
                            <div className="flex flex-wrap gap-2">
                              {adv.heroHighlights?.slice(0, 3).map((highlight) => (
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
                              href={`/adventures/${adv._id}`}
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
                {adventures.map((adv) => {
                  const lowestPrice = adv.options?.length
                    ? Math.min(...adv.options.map((opt) => opt.price)).toLocaleString()
                    : "—";

                  return (
                    <div
                      key={adv._id}
                      className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-base font-semibold text-gray-900">{adv.name}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <FaMapMarkerAlt className="text-gray-400" />
                            {adv.location.city}, {adv.location.state}
                          </p>
                        </div>
                        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                          {getCategoryLabel(adv.category)}
                        </span>
                      </div>

                      <div className="mt-3 space-y-2 text-xs text-gray-600">
                        <p>
                          Vendor: {adv.vendorId?.fullName || "Removed"}
                          {adv.vendorId?.email ? ` • ${adv.vendorId.email}` : ""}
                        </p>
                        <p>Options: {adv.options?.length || 0}</p>
                        <p>Starting: ₹{lowestPrice}</p>

                        {/* Difficulty badges */}
                        {adv.options?.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {adv.options.map((opt, i) => (
                              <span
                                key={i}
                                className={`rounded-full px-2 py-0.5 text-xs font-medium ${getDifficultyBadge(
                                  opt.difficulty
                                )}`}
                              >
                                {opt.difficulty}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Highlights */}
                        {adv.heroHighlights?.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {adv.heroHighlights.slice(0, 2).map((highlight) => (
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
                          href={`/adventures/${adv._id}`}
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
        </main>
      </div>

      {/* Mobile Sidebar */}
      {mobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-50 p-0 lg:hidden overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-900">Menu</span>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="px-3 py-1.5 rounded-md border text-gray-900"
              >
                Close
              </button>
            </div>
            <Sidebar />
          </div>
        </>
      )}
    </div>
  );
}