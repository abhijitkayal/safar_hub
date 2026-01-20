// app/vendor/properties/stays/page.tsx   (or wherever your file is)
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Pages/vendor/Sidebar";
import Image from "next/image";
import { FaEdit, FaTrash, FaMapMarkerAlt, FaBed, FaEye } from "react-icons/fa";

interface Room {
  name: string;
  bedType: string;
  beds: number;
  capacity: number;
  price: number;
  size?: string;
  features: string[];
  images: string[];
}

interface Stay {
  _id: string;
  name: string;
  category: "rooms" | "hotels" | "homestays" | "bnbs";
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
  };
  images: string[];
  heroHighlights: string[];
  popularFacilities: string[];
  rooms: Room[];
  bnb?: {
    unitType: string;
    bedrooms: number;
    bathrooms: number;
    kitchenAvailable: boolean;
    beds: number;
    capacity: number;
    features: string[];
    price: number;
  };
  vendorMessage?: string;
  isActive: boolean;
  createdAt: string;
}

export default function VendorStaysPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stays, setStays] = useState<Stay[]>([]);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [vendorId, setVendorId] = useState<string | null>(null);
  
  // Get navigation function from global context
  const navigate = typeof window !== 'undefined' ? (window as any).__VENDOR_NAVIGATE__?.navigate : null;

  useEffect(() => {
    const loadStays = async () => {
      try {
        const stored = JSON.parse(localStorage.getItem("user") || "{}");
        const id = stored._id || stored.id;
        if (!id) {
          router.replace("/login");
          return;
        }

        // Check if vendor is locked
        const vRes = await fetch(`/api/admin/vendors?id=${id}`, { credentials: "include" });
        const vData = await vRes.json();
        if (vData?.vendor?.isVendorLocked) {
          router.replace("/vendor");
          return;
        }

        setVendorId(id);

        const res = await fetch(`/api/vendor/stays?vendorId=${id}`, {
          credentials: "include",
        });
        const data = await res.json();

        if (data.success) {
          setStays(data.stays || []);
        } else if (res.status === 403) {
          router.replace("/vendor");
        }
      } catch (error) {
        console.error("Error loading stays:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStays();
  }, [router]);

  const handleDelete = async (stayId: string) => {
    if (!confirm("Are you sure you want to delete this stay?")) return;

    try {
      const res = await fetch(`/api/vendor/stays?id=${stayId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setStays((prev) => prev.filter((s) => s._id !== stayId));
      } else {
        alert(data.message || "Failed to delete stay");
      }
    } catch (error) {
        alert("Failed to delete stay");
      }
    };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      rooms: "Rooms",
      hotels: "Hotels",
      homestays: "Homestays",
      bnbs: "BnBs",
    };
    return labels[category] || category;
  };

  // ───── Render Stay Card (unchanged – kept exactly as you had it) ─────
  const renderStayCard = (stay: Stay) => {
    const roomCount = stay.rooms.length;
    const isBnb = stay.category === "bnbs" && stay.bnb;
    const minCapacity = roomCount ? Math.min(...stay.rooms.map((r) => r.capacity)) : null;
    const maxCapacity = roomCount ? Math.max(...stay.rooms.map((r) => r.capacity)) : null;
    const minPrice = roomCount ? Math.min(...stay.rooms.map((r) => r.price)) : null;
    const displayPrice = isBnb ? stay.bnb!.price : minPrice;

    return (
      <div key={stay._id} className="overflow-hidden rounded-xl bg-white shadow-md transition hover:shadow-lg">
        <div className="relative h-48 w-full">
          {stay.images.length > 0 ? (
            <Image src={stay.images[0]} alt={stay.name} fill className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-200">
              <FaBed className="text-4xl text-gray-400" />
            </div>
          )}
          <div className="absolute top-2 right-2">
            <span className="rounded px-2 py-1 text-xs font-medium text-white bg-green-600">
              {getCategoryLabel(stay.category)}
            </span>
          </div>
        </div>

        <div className="p-4">
          <h3 className="mb-2 truncate text-lg font-semibold text-gray-900">{stay.name}</h3>
          <div className="mb-2 flex items-center text-sm text-gray-700">
            <FaMapMarkerAlt className="mr-1" />
            <span className="truncate">{stay.location.city}, {stay.location.state}</span>
          </div>

          <div className="text-sm text-gray-700">
            {isBnb ? (
              <>
                <div className="mb-2 flex flex-wrap gap-2 text-xs text-gray-600">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1">
                    Bedrooms: {stay.bnb!.bedrooms}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1">
                    Bathrooms: {stay.bnb!.bathrooms}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1">
                    Guests: {stay.bnb!.capacity}
                  </span>
                </div>
                {displayPrice != null && (
                  <p className="text-xs text-gray-600">Price per night ₹{displayPrice.toLocaleString()}</p>
                )}
              </>
            ) : (
              <>
                <div className="mb-2 flex items-center gap-2">
                  <FaBed className="text-gray-600" />
                  <span>
                    {roomCount} room{roomCount > 1 ? "s" : ""}{" "}
                    {minCapacity && maxCapacity && `• ${minCapacity} - ${maxCapacity} guests`}
                  </span>
                </div>
                {displayPrice != null && (
                  <p className="text-xs text-gray-600">Starting at ₹{displayPrice.toLocaleString()}</p>
                )}
              </>
            )}
          </div>

          {/* Highlights & Features kept exactly as you wrote them */}
          {stay.heroHighlights?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {stay.heroHighlights.slice(0, 3).map((h) => (
                <span key={h} className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                  {h}
                </span>
              ))}
            </div>
          )}

          {(
            (stay.category === "bnbs" ? stay.bnb?.features : stay.rooms[0]?.features) || []
          ).length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-gray-800">Popular room features</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {(
                  stay.category === "bnbs" ? stay.bnb?.features : stay.rooms[0]?.features
                )
                  ?.slice(0, 4)
                  .map((f) => (
                  <span key={f} className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">
                    {f}
                  </span>
                ))} 
              </div>
            </div>
          )}

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => navigate ? navigate(`/stays/${stay._id}`) : router.push(`/stays/${stay._id}`)}
              className="flex-1 rounded-lg bg-blue-500 px-3 py-2 text-sm font-medium text-white hover:bg-blue-600 flex items-center justify-center gap-1"
            >
              <FaEye /> View
            </button>
            <button
              onClick={() => navigate ? navigate(`/vendor/properties/stays/add?editId=${stay._id}`) : router.push(`/vendor/properties/stays/add?editId=${stay._id}`)}
              className="rounded-lg bg-yellow-500 px-3 py-2 text-sm font-medium text-white hover:bg-yellow-600"
            >
              <FaEdit />
            </button>
            <button
              onClick={() => handleDelete(stay._id)}
              className="rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white hover:bg-red-600"
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

  // ──────────────────────── EXACT SAME LAYOUT AS /vendor/page.tsx ────────────────────────
  return (
    <div className="flex h-screen bg-gray-50 relative ">
      {/* Desktop Sidebar */}
      {/* <div className="hidden lg:block lg:sticky lg:top-0 lg:h-screen pt-15 overflow-y-auto">
        <Sidebar />
      </div> */}

      {/* Main Content Area */}
      
        {/* Topbar with mobile menu button */}
        <div className="flex-1 flex flex-col  overflow-hidden">
       {/* Topbar with mobile menu button */}
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
      My Stays
    </h1>

    {/* Empty spacer for alignment on mobile */}
    <div className="w-8 lg:hidden" />
    {/* Content below the topbar */}
<div className="p-4 flex flex-col items-center gap-4">

  {/* Add New Stay button */}
  <button
    onClick={() =>
      navigate
        ? navigate("/vendor/properties/stays/add")
        : router.push("/vendor/properties/stays/add")
    }
    className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition shadow-md"
  >
    + Add New Stay
  </button>

</div>
  </div>
</div>



        {/* Page Content */}
        <main className="flex-1 overflow-y-auto overflow-x-auto lg:overflow-x-hidden p-4 sm:p-6">
          {stays.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-8 text-center">
              <p className="text-gray-600 mb-6">No stays added yet.</p>
              <button
                onClick={() => navigate ? navigate("/vendor/properties/stays/add") : router.push("/vendor/properties/stays/add")}
                className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition shadow-md"
              >
                Add Your First Stay
              </button>
            </div>
          ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {stays.map(renderStayCard)}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Sidebar Drawer – identical to your vendor page */}
      {/* {mobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-100 bg-black/40 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-100 lg:hidden overflow-y-auto">
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