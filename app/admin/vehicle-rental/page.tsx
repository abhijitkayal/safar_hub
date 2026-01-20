"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/app/components/Pages/admin/Sidebar";
import Link from "next/link";
import { FaCar, FaEye, FaMapMarkerAlt, FaClock, } from "react-icons/fa";
import { LuBike } from "react-icons/lu";


interface VehicleOptionSummary {
  model: string;
  type: string;
  pricePerDay: number;
}

interface VehicleRentalSummary {
  _id: string;
  name: string;
  category: "cars-rental" | "bikes-rentals" | "car-with-driver";
  location: {
    city: string;
    state: string;
  };
  vendorId?: {
    fullName: string;
    email: string;
  } | null;
  options: VehicleOptionSummary[];
  heroHighlights: string[];
  createdAt: string;
}

export default function AdminVehicleRentalsPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rentals, setRentals] = useState<VehicleRentalSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRentals = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/vendor/vehicle-rental?all=true", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data?.message || "Failed to fetch vehicle rentals");
        setRentals(data.rentals || []);
      } catch (err: any) {
        setError(err?.message || "Unable to fetch vehicle rentals");
      } finally {
        setLoading(false);
      }
    };

    loadRentals();
  }, []);

  const getCategoryLabel = (category: string) => {
    const map: Record<string, string> = {
      "cars-rental": "Cars",
      "bikes-rentals": "Bikes",
      "car-with-driver": "Car with Driver",
    };
    return map[category] || category;
  };

  const getCategoryIcon = (category: string) => {
    return category === "bikes-rentals" ? <LuBike className="text-green-600" /> : <FaCar className="text-blue-600" />;
  };

  return (
    <div className="flex h-screen bg-sky-50 text-black overflow-hidden">
      {/* <div className="hidden lg:block lg:flex-shrink-0">
        <Sidebar />
      </div> */}

      <div className="flex-1 flex flex-col  overflow-hidden">
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
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Vehicle Rentals</h1>
            </div>
            <p className="text-sm text-gray-600">Monitor all vendor-submitted vehicles for rent.</p>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto overflow-x-auto lg:overflow-x-hidden p-4 sm:p-6">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
            </div>
          ) : error ? (
            <div className="rounded-xl bg-red-50 p-6 text-red-700">{error}</div>
          ) : rentals.length === 0 ? (
            <div className="rounded-xl bg-white p-8 text-center shadow">
              <FaCar className="mx-auto mb-4 text-4xl text-gray-400" />
              <p className="text-gray-600">No vehicle rentals have been submitted yet.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl bg-white shadow">
              {/* Desktop Table */}
              <div className="hidden w-full min-w-[900px] lg:block">
                <table className="w-full text-left text-sm text-gray-700">
                  <thead className="bg-gray-100 text-xs uppercase text-gray-600">
                    <tr>
                      <th className="px-4 py-3">Rental</th>
                      <th className="px-4 py-3">Vendor</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Options & Pricing</th>
                      <th className="px-4 py-3">Highlights</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {rentals.map((rental) => {
                      const lowestPrice = rental.options?.length
                        ? Math.min(...rental.options.map((opt) => opt.pricePerDay)).toLocaleString()
                        : "—";
                      const uniqueTypes = rental.options?.length
                        ? [...new Set(rental.options.map(o => o.type))].slice(0, 2).join(" • ")
                        : "—";

                      return (
                        <tr key={rental._id} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <p className="font-semibold text-gray-900">{rental.name}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <FaMapMarkerAlt className="text-gray-400" />
                              {rental.location.city}, {rental.location.state}
                            </p>
                          </td>
                          <td className="px-4 py-4">
                            {rental.vendorId ? (
                              <div className="space-y-1">
                                <p className="font-medium text-gray-900">{rental.vendorId.fullName}</p>
                                <p className="text-xs text-gray-500">{rental.vendorId.email}</p>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-500">Vendor removed</span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold flex items-center gap-1.5 w-fit
                              ${rental.category === "bikes-rentals" ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"}
                            `}>
                              {getCategoryIcon(rental.category)}
                              {getCategoryLabel(rental.category)}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-700">
                            <p className="flex items-center gap-2 text-gray-900">
                              <FaClock className="text-gray-500" /> {rental.options?.length || 0} vehicle(s)
                            </p>
                            <p className="text-xs text-gray-500">
                              From: ₹{lowestPrice}/day • {uniqueTypes}
                            </p>
                          </td>
                          <td className="px-4 py-4 text-xs text-gray-600">
                            <div className="flex flex-wrap gap-2">
                              {rental.heroHighlights?.slice(0, 3).map((highlight, i) => (
                                <span
                                  key={i}
                                  className="rounded-full bg-gray-100 px-3 py-1 text-gray-700"
                                >
                                  {highlight}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <Link
                              href={`/vehicle-rentals/${rental._id}`}
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
                {rentals.map((rental) => {
                  const lowestPrice = rental.options?.length
                    ? Math.min(...rental.options.map((opt) => opt.pricePerDay)).toLocaleString()
                    : "—";

                  return (
                    <div
                      key={rental._id}
                      className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-base font-semibold text-gray-900">{rental.name}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <FaMapMarkerAlt className="text-gray-400" />
                            {rental.location.city}, {rental.location.state}
                          </p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold flex items-center gap-1.5
                          ${rental.category === "cars-rental" ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"}
                        `}>
                          {getCategoryIcon(rental.category)}
                          {getCategoryLabel(rental.category)}
                        </span>
                      </div>

                      <div className="mt-3 space-y-2 text-xs text-gray-600">
                        <p>
                          Vendor: {rental.vendorId?.fullName || "Removed"}
                          {rental.vendorId?.email ? ` • ${rental.vendorId.email}` : ""}
                        </p>
                        <p>Vehicles: {rental.options?.length || 0}</p>
                        <p>Starting: ₹{lowestPrice}/day</p>
                        {rental.heroHighlights?.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {rental.heroHighlights.slice(0, 2).map((highlight, i) => (
                              <span
                                key={i}
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
                          href={`/vehicle-rentals/${rental._id}`}
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