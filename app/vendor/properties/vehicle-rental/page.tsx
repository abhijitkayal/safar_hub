// app/properties/vehicle-rental/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Pages/vendor/Sidebar";
import Image from "next/image";
import { FaEdit, FaTrash, FaMapMarkerAlt, FaCar, FaMotorcycle, FaEye } from "react-icons/fa";

interface VehicleOption {
  model: string;
  type: string;
  pricePerDay: number;
  features: string[];
  images: string[];
}

interface VehicleRental {
  _id: string;
  name: string;
  category: "cars-rental" | "bikes-rentals" | "car-with-driver";
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
  };
  images: string[];
  heroHighlights: string[];
  popularFacilities: string[];
  options: VehicleOption[];
  checkInOutRules: {
    pickup: string;
    dropoff: string;
  };
  vendorMessage?: string;
  isActive: boolean;
  createdAt: string;
}

export default function VendorVehicleRentalsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [rentals, setRentals] = useState<VehicleRental[]>([]);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [vendorId, setVendorId] = useState<string | null>(null);
  
  // Get navigation function from global context
  const navigate = typeof window !== 'undefined' ? (window as any).__VENDOR_NAVIGATE__?.navigate : null;

  useEffect(() => {
    const loadRentals = async () => {
      try {
        const stored = JSON.parse(localStorage.getItem("user") || "{}");
        const id = stored._id || stored.id;
        if (!id) {
          router.replace("/login");
          return;
        }

        // Verify lock
        const vRes = await fetch(`/api/admin/vendors?id=${id}`, { credentials: "include" });
        const vData = await vRes.json();
        if (vData?.vendor?.isVendorLocked) {
          router.replace("/vendor");
          return;
        }

        setVendorId(id);

        const res = await fetch(`/api/vendor/vehicle-rental?vendorId=${id}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          setRentals(data.rentals || []);
        } else if (res.status === 403) {
          router.replace("/vendor");
          return;
        }
      } catch (error) {
        console.error("Error loading vehicle rentals:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRentals();
  }, [router]);

  const handleDelete = async (rentalId: string) => {
    if (!confirm("Are you sure you want to delete this rental?")) return;

    try {
      const res = await fetch(`/api/vendor/vehicle-rental?id=${rentalId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setRentals(rentals.filter((r) => r._id !== rentalId));
      } else {
        alert(data.message || "Failed to delete rental");
      }
    } catch (error) {
      console.error("Error deleting rental:", error);
      alert("Failed to delete rental");
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      "cars-rental": "Cars",
      "bikes-rentals": "Bikes",
      "car-with-driver": "Car with Driver",
    };
    return labels[category] || category;
  };

  const renderRentalCard = (rental: VehicleRental) => {
    const optionCount = rental.options.length;
    const minPrice = optionCount ? Math.min(...rental.options.map((opt) => opt.pricePerDay)) : null;
    const hasHighlights = Boolean(rental.heroHighlights?.length);
    const hasPrimaryFeatures = optionCount > 0 && rental.options[0].features.length > 0;

    return (
      <div
        key={rental._id}
        className="overflow-hidden rounded-xl bg-white shadow-md transition hover:shadow-lg"
      >
        {/* Image */}
        <div className="relative h-48 w-full">
          {rental.images.length > 0 ? (
            <Image
              src={rental.images[0]}
              alt={rental.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-200">
              {rental.category === "cars-rental" || rental.category === "car-with-driver" ? (
                <FaCar className="text-4xl text-gray-400" />
              ) : (
                <FaMotorcycle className="text-4xl text-gray-400" />
              )}
            </div>
          )}
          <div className="absolute top-2 right-2">
            <span className="rounded px-2 py-1 text-xs font-medium text-white bg-green-600">
              {getCategoryLabel(rental.category)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="mb-2 truncate text-lg font-semibold text-gray-900">{rental.name}</h3>
          <div className="mb-2 flex items-center text-sm text-gray-700">
            <FaMapMarkerAlt className="mr-1" />
            <span className="truncate">
              {rental.location.city}, {rental.location.state}
            </span>
          </div>

          <div className="text-sm text-gray-700">
            <div className="mb-2 flex items-center gap-2">
              {rental.category === "cars-rental" || rental.category === "car-with-driver" ? (
                <FaCar className="text-gray-600" />
              ) : (
                <FaMotorcycle className="text-gray-600" />
              )}
              <span>
                {optionCount} vehicle{optionCount === 1 ? "" : "s"}
              </span>
            </div>
            {optionCount && minPrice !== null && (
              <p className="text-xs text-gray-600">
                From ₹{minPrice.toLocaleString()}/day
              </p>
            )}
          </div>

          {hasHighlights && (
            <div className="mt-3 flex flex-wrap gap-2">
              {rental.heroHighlights.slice(0, 3).map((highlight) => (
                <span
                  key={highlight}
                  className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700"
                >
                  {highlight}
                </span>
              ))}
            </div>
          )}

          {hasPrimaryFeatures && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-gray-800">Key features</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {rental.options[0].features.slice(0, 4).map((feature) => (
                  <span
                    key={feature}
                    className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => navigate ? navigate(`/vehicle-rental/${rental._id}`) : router.push(`/vehicle-rental/${rental._id}`)}
              className="flex-1 rounded-lg bg-blue-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-600"
            >
              <FaEye className="mr-1 inline" />
              View
            </button>
            <button
              onClick={() => navigate ? navigate(`/vendor/properties/vehicle-rental/add?editId=${rental._id}`) : router.push(`/vendor/properties/vehicle-rental/add?editId=${rental._id}`)}
              className="rounded-lg bg-yellow-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-yellow-600"
            >
              <FaEdit />
            </button>
            <button
              onClick={() => handleDelete(rental._id)}
              className="rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-600"
            >
              <FaTrash />
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-12">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
      </div>
    );
  }

  return (
     <div className="flex min-h-screen bg-slate-50">
          {/* Desktop sidebar */}
          {/* <div className="hidden lg:block lg:sticky lg:top-0 lg:h-screen pt-15 overflow-y-auto overflow-x-hidden">
                  <Sidebar />
                </div> */}

      {/* Main content */}
      <div className=" flex-1 flex flex-col ">
        {/* Top bar */}
            <div className="sticky top-0 z-40 bg-sky-50 border-b lg:pt-15 pt-0">
   {/* Mobile menu button */}
    {/* <button
      className="lg:hidden px-3 py-2 rounded border text-gray-700 "
      onClick={() => setMobileSidebarOpen(true)}
      aria-label="Open menu"
    >
      ☰
    </button> */}

  <div className="flex items-center justify-between ">
    
   
    {/* Title */}
    <h1 className="text-xl sm:text-2xl font-semibold text-black">
      My Vehicle Rentals
    </h1>

    {/* Empty spacer for alignment on mobile */}
    <div className="w-8 lg:hidden" />
    {/* Content below the topbar */}
<div className="p-4 flex flex-col items-center gap-4">

  {/* Add New Stay button */}
  <button
    onClick={() =>
      navigate
        ? navigate("/vendor/properties/vehicle-rental/add")
        : router.push("/vendor/properties/vehicle-rental/add")
    }
    className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition shadow-md"
  >
    + Add New Rentalss
  </button>

</div>
  </div>
</div>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {rentals.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-8 text-center">
              <p className="text-gray-600 mb-4">No vehicle rentals added yet.</p>
              <button
                onClick={() => navigate ? navigate("/vendor/properties/vehicle-rental/add") : router.push("/vendor/properties/vehicle-rental/add")}
                className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition shadow-md"
              >
                Add Your First Rental
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {rentals.map(renderRentalCard)}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Sidebar */}
      {/* {mobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-100 bg-black/40 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-100 p-0 lg:hidden overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-800">Menu</span>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="px-3 py-1.5 rounded-md border text-gray-700"
              >
                Close
              </button>
            </div>
            <Sidebar />
          </div>
        </>
      )} */}
    </div>
  );
}