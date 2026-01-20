"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/app/components/Pages/admin/Sidebar";
import Link from "next/link";
import { FaBed, FaEye, FaHotel } from "react-icons/fa";

interface RoomSummary {
  name: string;
  price: number;
}

interface StaySummary {
  _id: string;
  name: string;
  category: string;
  location: {
    city: string;
    state: string;
  };
  vendorId?: {
    fullName: string;
    email: string;
  } | null;
  rooms: RoomSummary[];
  heroHighlights: string[];
  createdAt: string;
}

export default function AdminStaysPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stays, setStays] = useState<StaySummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStays = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/vendor/stays?all=true", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data?.message || "Failed to fetch stays");
        setStays(data.stays || []);
      } catch (err: any) {
        setError(err?.message || "Unable to fetch stays");
      } finally {
        setLoading(false);
      }
    };

    loadStays();
  }, []);

  const getCategoryLabel = (category: string) => {
    const map: Record<string, string> = {
      rooms: "Rooms",
      hotels: "Hotels",
      homestays: "Homestays",
      bnbs: "BnBs",
    };
    return map[category] || category;
  };

  return (
    <div className="flex h-screen bg-sky-50 text-black overflow-hidden">
      {/* <div className="hidden lg:block lg:flex-shrink-0">
        <Sidebar />
      </div> */}

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="sticky top-0 z-40 bg-sky-50">
          <div className="flex items-center justify-between gap-3 p-3 border-b">
            <div className="flex items-center gap-3">
              {/* <button
                className="lg:hidden px-3 py-2 rounded border text-gray-700"
                onClick={() => setMobileSidebarOpen(true)}
                aria-label="Open menu"
              >
                ☰
              </button> */}
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Stays catalogue</h1>
            </div>
            <p className="text-sm text-gray-600">Monitor vendor submitted stays and their room inventory.</p>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto   p-4 sm:p-6">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
            </div>
          ) : error ? (
            <div className="rounded-xl bg-red-50 p-6 text-red-700">{error}</div>
          ) : stays.length === 0 ? (
            <div className="rounded-xl bg-white p-8 text-center shadow">
              <FaHotel className="mx-auto mb-4 text-4xl text-gray-400" />
              <p className="text-gray-600">No stays have been submitted yet.</p>
            </div>
          ) : (
            <div className=" rounded-xl bg-white shadow">
              <div className="hidden w-full min-w-[900px] lg:block">
                <table className="w-full text-left text-sm text-gray-700">
                  <thead className="bg-gray-100 text-xs uppercase text-gray-600">
                    <tr>
                      <th className="px-4 py-3">Stay</th>
                      <th className="px-4 py-3">Vendor</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Rooms & pricing</th>
                      <th className="px-4 py-3">Highlights</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {stays.map((stay) => {
                      const lowestPrice = stay.rooms?.length
                        ? Math.min(...stay.rooms.map((room) => room.price)).toLocaleString()
                        : "—";
                      return (
                        <tr key={stay._id} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <p className="font-semibold text-gray-900">{stay.name}</p>
                            <p className="text-xs text-gray-500">
                              {stay.location.city}, {stay.location.state}
                            </p>
                          </td>
                          <td className="px-4 py-4">
                            {stay.vendorId ? (
                              <div className="space-y-1">
                                <p className="font-medium text-gray-900">{stay.vendorId.fullName}</p>
                                <p className="text-xs text-gray-500">{stay.vendorId.email}</p>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-500">Vendor removed</span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                              {getCategoryLabel(stay.category)}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-700">
                            <p className="flex items-center gap-2 text-gray-900">
                              <FaBed className="text-gray-500" /> {stay.rooms?.length || 0} room(s)
                            </p>
                            <p className="text-xs text-gray-500">Starting price: ₹{lowestPrice}</p>
                          </td>
                          <td className="px-4 py-4 text-xs text-gray-600">
                            <div className="flex flex-wrap gap-2">
                              {stay.heroHighlights?.slice(0, 3).map((highlight) => (
                                <span key={highlight} className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">
                                  {highlight}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <Link
                              href={`/stays/${stay._id}`}
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

              {/* Mobile cards */}
              <div className="grid gap-4 p-4 lg:hidden">
                {stays.map((stay) => (
                  <div key={stay._id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-base font-semibold text-gray-900">{stay.name}</p>
                        <p className="text-xs text-gray-500">
                          {stay.location.city}, {stay.location.state}
                        </p>
                      </div>
                      <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                        {getCategoryLabel(stay.category)}
                      </span>
                    </div>
                    <div className="mt-3 space-y-2 text-xs text-gray-600">
                      <p>
                        Vendor: {stay.vendorId?.fullName || "Removed"}
                        {stay.vendorId?.email ? ` • ${stay.vendorId.email}` : ""}
                      </p>
                      <p>Rooms: {stay.rooms?.length || 0}</p>
                      {stay.heroHighlights?.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {stay.heroHighlights.slice(0, 2).map((highlight) => (
                            <span key={highlight} className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">
                              {highlight}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="mt-3 text-right">
                      <Link
                        href={`/stays/${stay._id}`}
                        className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-600"
                      >
                        <FaEye /> View details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

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
