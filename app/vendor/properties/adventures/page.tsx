// app/properties/adventures/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Pages/vendor/Sidebar";
import Image from "next/image";
import { FaEdit, FaTrash, FaMapMarkerAlt, FaClock, FaEye, FaMountain, FaUsers } from "react-icons/fa";

interface Option {
  name: string;
  duration: string;
  difficulty: string;
  capacity: number;
  price: number;
  features: string[];
  images: string[];
}

interface Adventure {
  _id: string;
  name: string;
  category: "trekking" | "hiking" | "camping" | "water-rafting";
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
  };
  images: string[];
  heroHighlights: string[];
  popularFacilities: string[];
  options: Option[];
  vendorMessage?: string;
  isActive: boolean;
  createdAt: string;
}

export default function VendorAdventuresPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [adventures, setAdventures] = useState<Adventure[]>([]);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [vendorId, setVendorId] = useState<string | null>(null);

  // Get navigation function from global context
  const navigate = typeof window !== 'undefined' ? (window as any).__VENDOR_NAVIGATE__?.navigate : null;

  useEffect(() => {
    const loadAdventures = async () => {
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

        const res = await fetch(`/api/vendor/adventures?vendorId=${id}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          setAdventures(data.adventures || []);
        } else if (res.status === 403) {
          router.replace("/vendor");
          return;
        }
      } catch (error) {
        console.error("Error loading adventures:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAdventures();
  }, [router]);

  const handleDelete = async (advId: string) => {
    if (!confirm("Are you sure you want to delete this adventure? This cannot be undone.")) return;

    try {
      const res = await fetch(`/api/vendor/adventures?id=${advId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setAdventures(adventures.filter((a) => a._id !== advId));
      } else {
        alert(data.message || "Failed to delete adventure");
      }
    } catch (error) {
      console.error("Error deleting adventure:", error);
      alert("Failed to delete adventure");
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      trekking: "Trekking",
      hiking: "Hiking",
      camping: "Camping",
      "water-rafting": "Water Rafting",
    };
    return labels[category] || category;
  };

  const renderAdventureCard = (adv: Adventure) => {
    const optionCount = adv.options.length;
    const minPrice = optionCount ? Math.min(...adv.options.map((o) => o.price)) : null;
    const minCapacity = optionCount ? Math.min(...adv.options.map((o) => o.capacity)) : null;
    const maxCapacity = optionCount ? Math.max(...adv.options.map((o) => o.capacity)) : null;
    const durations = [...new Set(adv.options.map((o) => o.duration))].slice(0, 2).join(" • ");
    const difficulties = [...new Set(adv.options.map((o) => o.difficulty))].slice(0, 2).join(" • ");
    const hasHighlights = adv.heroHighlights.length > 0;
    const hasPrimaryFeatures = optionCount > 0 && adv.options[0].features.length > 0;

    return (
      <div
        key={adv._id}
        className=" rounded-xl bg-white shadow-md transition hover:shadow-lg overflow-x-hidden"
      >
        {/* Image */}
        <div className="relative h-48 w-full">
          {adv.images.length > 0 ? (
            <Image
              src={adv.images[0]}
              alt={adv.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-200">
              <FaMountain className="text-4xl text-gray-400" />
            </div>
          )}
          <div className="absolute top-2 right-2">
            <span className="rounded px-2 py-1 text-xs font-medium text-white bg-green-600">
              {getCategoryLabel(adv.category)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="mb-2 truncate text-lg font-semibold text-gray-900">{adv.name}</h3>
          <div className="mb-2 flex items-center text-sm text-gray-700">
            <FaMapMarkerAlt className="mr-1" />
            <span className="truncate">
              {adv.location.city}, {adv.location.state}
            </span>
          </div>

          <div className="text-sm text-gray-700 space-y-1">
            <div className="flex items-center gap-2">
              <FaClock className="text-gray-600" />
              <span>
                {optionCount} option{optionCount === 1 ? "" : "s"}
                {optionCount && minCapacity !== null && maxCapacity !== null
                  ? ` • ${minCapacity}-${maxCapacity} pax`
                  : ""}
              </span>
            </div>
            {durations && (
              <p className="text-xs text-gray-600">
                Duration: {durations}
              </p>
            )}
            {difficulties && (
              <p className="text-xs text-gray-600">
                Level: {difficulties}
              </p>
            )}
            {optionCount && minPrice !== null && (
              <p className="text-xs font-medium text-green-700">
                From ₹{minPrice.toLocaleString()}
              </p>
            )}
          </div>

          {hasHighlights && (
            <div className="mt-3 flex flex-wrap gap-2">
              {adv.heroHighlights.slice(0, 3).map((highlight) => (
                <span
                  key={highlight}
                  className="inline-flex items-center rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-green-700"
                >
                  {highlight}
                </span>
              ))}
            </div>
          )}

          {hasPrimaryFeatures && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-gray-800">Includes</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {adv.options[0].features.slice(0, 4).map((feature) => (
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
              onClick={() => navigate ? navigate(`/adventures/${adv._id}`) : router.push(`/adventures/${adv._id}`)}
              className="flex-1 rounded-lg bg-blue-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-600 flex items-center justify-center gap-1"
            >
              <FaEye className="text-xs" />
              View
            </button>
            <button
              onClick={() => navigate ? navigate(`/vendor/properties/adventures/add?editId=${adv._id}`) : router.push(`/vendor/properties/adventures/add?editId=${adv._id}`)}
              className="rounded-lg bg-yellow-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-yellow-600"
            >
              <FaEdit />
            </button>
            <button
              onClick={() => handleDelete(adv._id)}
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
      <div className=" flex-1 flex flex-col">
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
      My Adventures
    </h1>

    {/* Empty spacer for alignment on mobile */}
    <div className="w-8 lg:hidden" />
    {/* Content below the topbar */}
<div className="p-4 flex flex-col items-center gap-4">

  {/* Add New Stay button */}
  <button
    onClick={() =>
      navigate
        ? navigate("/vendor/properties/adventures/add")
        : router.push("/vendor/properties/adventures/add")
    }
    className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition shadow-md"
  >
    + Add New Adventures
  </button>

</div>
  </div>
</div>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {adventures.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-8 text-center">
              <FaMountain className="mx-auto text-5xl text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">No adventures added yet.</p>
              <button
                onClick={() => navigate ? navigate("/vendor/properties/adventures/add") : router.push("/vendor/properties/adventures/add")}
                className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition shadow-md"
              >
                List Your First Adventure
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {adventures.map(renderAdventureCard)}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Sidebar Drawer */}
      {/* {mobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-100 bg-black/40 lg:hidden "
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl  p-0 lg:hidden overflow-y-auto z-100">
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