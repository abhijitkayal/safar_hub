// properties/tours/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Pages/vendor/Sidebar";
import Image from "next/image";
import { FaEdit, FaTrash, FaMapMarkerAlt, FaClock, FaUsers, FaEye } from "react-icons/fa";

interface TourOption {
  name: string;
  duration: string;
  capacity: number;
  price: number;
  features: string[];
  images: string[];
}

interface Tour {
  _id: string;
  name: string;
  category: "group-tours" | "tour-packages";
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
  };
  images: string[];
  heroHighlights: string[];
  popularFacilities: string[];
  options: TourOption[];
  vendorMessage?: string;
  isActive: boolean;
  createdAt: string;
}

export default function VendorToursPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tours, setTours] = useState<Tour[]>([]);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [vendorId, setVendorId] = useState<string | null>(null);
  
  // Get navigation function from global context
  const navigate = typeof window !== 'undefined' ? (window as any).__VENDOR_NAVIGATE__?.navigate : null;

  useEffect(() => {
    const loadTours = async () => {
      try {
        // Get vendor ID from localStorage
        const stored = JSON.parse(localStorage.getItem("user") || "{}");
        const id = stored._id || stored.id;
        if (!id) {
          router.replace("/login");
          return;
        }

        // Verify lock status from server
        const vRes = await fetch(`/api/admin/vendors?id=${id}`, { credentials: "include" });
        const vData = await vRes.json();
        if (vData?.vendor?.isVendorLocked) {
          router.replace("/vendor");
          return;
        }

        setVendorId(id);

        // Fetch tours for this vendor
        const res = await fetch(`/api/vendor/tours?vendorId=${id}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          setTours(data.tours || []);
        } else if (res.status === 403) {
          router.replace("/vendor");
          return;
        }
      } catch (error) {
        console.error("Error loading tours:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTours();
  }, [router]);

  const handleDelete = async (tourId: string) => {
    if (!confirm("Are you sure you want to delete this tour?")) return;

    try {
      const res = await fetch(`/api/vendor/tours?id=${tourId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setTours(tours.filter((t) => t._id !== tourId));
      } else {
        alert(data.message || "Failed to delete tour");
      }
    } catch (error) {
      console.error("Error deleting tour:", error);
      alert("Failed to delete tour");
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      "group-tours": "Group Tours",
      "tour-packages": "Tour Packages",
    };
    return labels[category] || category;
  };

  const renderTourCard = (tour: Tour) => {
    const optionCount = tour.options.length;
    const minCapacity = optionCount ? Math.min(...tour.options.map((opt) => opt.capacity)) : null;
    const maxCapacity = optionCount ? Math.max(...tour.options.map((opt) => opt.capacity)) : null;
    const minPrice = optionCount ? Math.min(...tour.options.map((opt) => opt.price)) : null;
    const hasHighlights = Boolean(tour.heroHighlights && tour.heroHighlights.length);
    const hasPrimaryFeatures = optionCount > 0 && tour.options[0].features.length > 0;

    return (
      <div
        key={tour._id}
        className="overflow-hidden rounded-xl bg-white shadow-md transition hover:shadow-lg"
      >
        {/* Image */}
        <div className="relative h-48 w-full">
          {tour.images.length > 0 ? (
            <Image
              src={tour.images[0]}
              alt={tour.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-200">
              <FaClock className="text-4xl text-gray-400" />
            </div>
          )}
          <div className="absolute top-2 right-2">
            <span className="rounded px-2 py-1 text-xs font-medium text-white bg-green-600">
              {getCategoryLabel(tour.category)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="mb-2 truncate text-lg font-semibold text-gray-900">{tour.name}</h3>
          <div className="mb-2 flex items-center text-sm text-gray-700">
            <FaMapMarkerAlt className="mr-1" />
            <span className="truncate">
              {tour.location.city}, {tour.location.state}
            </span>
          </div>
          <div className="text-sm text-gray-700">
            <div className="mb-2 flex items-center gap-2">
              <FaClock className="text-gray-600" />
              <span>
                {optionCount} option{optionCount === 1 ? "" : "s"}
                {optionCount && minCapacity !== null && maxCapacity !== null
                  ? ` • ${minCapacity} - ${maxCapacity} guests`
                  : ""}
              </span>
            </div>
            {optionCount && minPrice !== null && (
              <p className="text-xs text-gray-600">
                From ₹{minPrice.toLocaleString()}
              </p>
            )}
          </div>

          {hasHighlights && (
            <div className="mt-3 flex flex-wrap gap-2">
              {tour.heroHighlights.slice(0, 3).map((highlight) => (
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
              <p className="text-xs font-semibold text-gray-800">Popular option features</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {tour.options[0].features.slice(0, 4).map((feature) => (
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
              onClick={() => navigate ? navigate(`/tours/${tour._id}`) : router.push(`/tours/${tour._id}`)}
              className="flex-1 rounded-lg bg-blue-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-600"
            >
              <FaEye className="mr-1 inline" />
              View
            </button>
            <button
              onClick={() => navigate ? navigate(`/vendor/properties/tours/add?editId=${tour._id}`) : router.push(`/vendor/properties/tours/add?editId=${tour._id}`)}
              className="rounded-lg bg-yellow-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-yellow-600"
            >
              <FaEdit />
            </button>
            <button
              onClick={() => handleDelete(tour._id)}
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
    <div className="flex h-screen bg-gray-50 relative">
      {/* Desktop sidebar */}
      {/* <div className="hidden lg:block lg:sticky lg:top-0 lg:h-screen pt-15 overflow-y-auto overflow-x-hidden">
              <Sidebar />
            </div> */}

      {/* Main content */}
      <div className="flex-1 flex flex-col  overflow-hidden">
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
      My Tours
    </h1>

    {/* Empty spacer for alignment on mobile */}
    <div className="w-8 lg:hidden" />
    {/* Content below the topbar */}
<div className="p-4 flex flex-col items-center gap-4">

  {/* Add New Stay button */}
  <button
    onClick={() =>
      navigate
        ? navigate("/vendor/properties/tours/add")
        : router.push("/vendor/properties/tours/add")
    }
    className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition shadow-md"
  >
    + Add New Tours
  </button>

</div>
  </div>
</div>

        <main className="flex-1 overflow-y-auto overflow-x-auto lg:overflow-x-hidden p-4 sm:p-6">
          {tours.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-8 text-center">
              <p className="text-gray-600 mb-4">No tours added yet.</p>
              <button
                onClick={() => navigate ? navigate("/vendor/tours/add") : router.push("/vendor/tours/add")}
                className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition shadow-md"
              >
                Add Your First Tour
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {tours.map(renderTourCard)}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Sidebar Drawer */}
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