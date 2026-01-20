//properties/stays/add/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "@/app/components/Pages/vendor/Sidebar";
import { FaMapMarkerAlt, FaPlus, FaTimes, FaUpload } from "react-icons/fa";
import PageLoader from "@/app/components/common/PageLoader";

const HERO_HIGHLIGHTS = [
  "Outdoor swimming pool",
  "Free WiFi",
  "Family rooms",
  "Free parking",
  "Fitness centre",
  "3 restaurants",
  "Spa and wellness centre",
  "Tea/coffee maker in all rooms",
  "Bar",
  "Very good breakfast",
  "Great for your stay",
];

const POPULAR_FACILITIES = [
  "Outdoor swimming pool",
  "Free WiFi",
  "Family rooms",
  "Free parking",
  "Fitness centre",
  "Spa and wellness centre",
  "Tea/coffee maker in all rooms",
  "Bar",
  "Room service",
  "Parking",
];

const AMENITY_SECTIONS: Array<{
  key: string;
  label: string;
  options: string[];
}> = [
    {
      key: "Bathroom",
      label: "Bathroom",
      options: [
        "Bath or shower",
        "Private bathroom",
        "Toilet",
        "Free toiletries",
        "Hairdryer",
        "Shower",
      ],
    },
    {
      key: "Bedroom",
      label: "Bedroom",
      options: ["Wardrobe or closet", "Alarm clock"],
    },
    {
      key: "Outdoors",
      label: "Outdoors",
      options: ["Outdoor furniture", "Sun terrace"],
    },
    {
      key: "Kitchen",
      label: "Kitchen",
      options: ["Refrigerator", "Tea/Coffee maker"],
    },
    {
      key: "Activities",
      label: "Activities",
      options: [
        "Live sport events (broadcast)",
        "Tour or class about local culture",
        "Walking tours",
        "Pub crawls",
        "Nightclub/DJ",
      ],
    },
    {
      key: "Living Area",
      label: "Living Area",
      options: ["Desk"],
    },
    {
      key: "Media & Technology",
      label: "Media & Technology",
      options: ["Cable channels", "Video", "DVD player", "Radio", "Telephone", "TV"],
    },
    {
      key: "Food & Drink",
      label: "Food & Drink",
      options: [
        "Coffee house on site",
        "Fruits",
        "Wine/champagne",
        "Kid meals",
        "Special diet menus (on request)",
        "Snack bar",
        "Breakfast in the room",
        "Restaurant",
        "Bar",
        "Minibar",
        "Tea/Coffee maker",
      ],
    },
    {
      key: "Internet",
      label: "Internet",
      options: ["Free WiFi in all areas"],
    },
    {
      key: "Parking",
      label: "Parking",
      options: ["Free private parking on site", "Accessible parking"],
    },
    {
      key: "Reception services",
      label: "Reception services",
      options: [
        "Invoice provided",
        "Lockers",
        "Private check-in/check-out",
        "Concierge service",
        "Luggage storage",
        "Express check-in/check-out",
        "24-hour front desk",
      ],
    },
    {
      key: "Cleaning services",
      label: "Cleaning services",
      options: ["Daily housekeeping", "Trouser press", "Ironing service", "Dry cleaning", "Laundry"],
    },
    {
      key: "Business facilities",
      label: "Business facilities",
      options: ["Fax/photocopying", "Business centre", "Meeting/banquet facilities"],
    },
    {
      key: "Safety & security",
      label: "Safety & security",
      options: [
        "Fire extinguishers",
        "CCTV outside property",
        "CCTV in common areas",
        "Smoke alarms",
        "Security alarm",
        "Key card access",
        "Key access",
        "24-hour security",
        "Safety deposit box",
      ],
    },
    {
      key: "General",
      label: "General",
      options: [
        "Hypoallergenic",
        "Designated smoking area",
        "Air conditioning",
        "Wake-up service",
        "Car hire",
        "Laptop safe",
        "Packed lunches",
        "Lift",
        "Family rooms",
        "Facilities for disabled guests",
        "Non-smoking rooms",
        "Room service",
      ],
    },
    {
      key: "Accessibility",
      label: "Accessibility",
      options: [
        "Auditory guidance",
        "Emergency cord in bathroom",
        "Lower bathroom sink",
        "Higher level toilet",
        "Toilet with grab rails",
        "Wheelchair accessible",
      ],
    },
    {
      key: "Wellness",
      label: "Wellness",
      options: [
        "Fitness/spa locker rooms",
        "Fitness",
        "Spa/wellness packages",
        "Spa lounge/relaxation area",
        "Steam room",
        "Spa facilities",
        "Sun umbrellas",
        "Sun loungers or beach chairs",
        "Massage",
        "Spa and wellness centre",
        "Outdoor swimming pool",
        "Pool/beach towels",
        "Pool is on rooftop",
        "Open all year",
      ],
    },
  ];

const ROOM_FEATURE_OPTIONS = [
  "Mountain view",
  "City view",
  "Sea view",
  "Garden view",
  "Balcony",
  "Private bathroom",
  "Kitchen",
  "Fireplace",
  "Jacuzzi",
  "Minibar",
  "Smart TV",
  "Workspace",
];

const BED_TYPES = [
  "Single Bed",
  "Double Bed",
  "Queen Bed",
  "King Bed",
  "Twin Beds",
  "Bunk Beds",
  "Sofa Bed",
];

type RoomForm = {
  name: string;
  description: string;
  bedType: string;
  beds: number;
  capacity: number;
  price: number;
  size: string;
  features: string[];
  images: string[];
};

const createDefaultRoom = (): RoomForm => ({
  name: "",
  description: "",
  bedType: "Queen Bed",
  beds: 1,
  capacity: 2,
  price: 0,
  size: "",
  features: [],
  images: [],
});

export default function AddStayPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("editId");
  const isEditing = Boolean(editId);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [customHighlight, setCustomHighlight] = useState("");
  const [newRule, setNewRule] = useState("");
  const [roomFeatureDrafts, setRoomFeatureDrafts] = useState<Record<number | string, string>>({});
  const [uploadingState, setUploadingState] = useState<Record<string, boolean>>({});
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(isEditing);
  const [bnbUnitTypeOther, setBnbUnitTypeOther] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    category: "hotels" as "rooms" | "hotels" | "homestays" | "bnbs",
    location: {
      address: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
      coordinates: { lat: 0, lng: 0 },
    },
    heroHighlights: [] as string[],
    images: [] as string[],
    gallery: [] as string[],
    videos: {
      inside: [] as string[],
      outside: [] as string[],
    },
    popularFacilities: [] as string[],
    amenities: {} as Record<string, string[]>,
    rooms: [createDefaultRoom()],
    meals: [] as string[], // For homestay: breakfast, lunch, evening snacks, dinner
    bnb: {
      unitType: "",
      bedrooms: 0,
      bathrooms: 0,
      kitchenAvailable: false,
      beds: 0,
      capacity: 0,
      features: [] as string[],
      price: 0,
    },
    about: {
      heading: "",
      description: "",
    },
    checkInOutRules: {
      checkIn: "",
      checkOut: "",
      rules: [] as string[],
    },
    vendorMessage: "",
  });

  const setField = <K extends keyof typeof formData>(key: K, value: (typeof formData)[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const toggleArrayValue = (key: "heroHighlights" | "popularFacilities", value: string) => {
    setFormData((prev) => {
      const collection = prev[key];
      const exists = collection.includes(value);
      return {
        ...prev,
        [key]: exists ? collection.filter((item) => item !== value) : [...collection, value],
      };
    });
  };

  const toggleMeal = (meal: string) => {
    setFormData((prev) => {
      const exists = prev.meals.includes(meal);
      return {
        ...prev,
        meals: exists ? prev.meals.filter((item) => item !== meal) : [...prev.meals, meal],
      };
    });
  };

  const updateBnb = <K extends keyof typeof formData.bnb>(key: K, value: typeof formData.bnb[K]) => {
    setFormData((prev) => ({
      ...prev,
      bnb: { ...prev.bnb, [key]: value },
    }));
  };

  const toggleAmenity = (sectionKey: string, option: string) => {
    setFormData((prev) => {
      const current = prev.amenities[sectionKey] || [];
      const next = current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option];
      const amenities = { ...prev.amenities };
      if (next.length) amenities[sectionKey] = next;
      else delete amenities[sectionKey];
      return { ...prev, amenities };
    });
  };

  const updateRoom = <K extends keyof RoomForm>(index: number, key: K, value: RoomForm[K]) => {
    setFormData((prev) => {
      const rooms = [...prev.rooms];
      rooms[index] = { ...rooms[index], [key]: value };
      return { ...prev, rooms };
    });
  };

  const addRoom = () => {
    setFormData((prev) => ({ ...prev, rooms: [...prev.rooms, createDefaultRoom()] }));
  };

  const removeRoom = (index: number) => {
    setFormData((prev) => ({ ...prev, rooms: prev.rooms.filter((_, i) => i !== index) }));
  };

  const hydrateForm = (stay: any) => {
    setFormData({
      name: stay.name ?? "",
      category: (stay.category as "rooms" | "hotels" | "homestays" | "bnbs") ?? "hotels",
      location: {
        address: stay.location?.address ?? "",
        city: stay.location?.city ?? "",
        state: stay.location?.state ?? "",
        country: stay.location?.country ?? "",
        postalCode: stay.location?.postalCode ?? "",
        coordinates: {
          lat: stay.location?.coordinates?.lat ?? 0,
          lng: stay.location?.coordinates?.lng ?? 0,
        },
      },
      heroHighlights: stay.heroHighlights ?? [],
      images: stay.images ?? [],
      gallery: stay.gallery ?? [],
      videos: {
        inside: stay.videos?.inside ?? [],
        outside: stay.videos?.outside ?? [],
      },
      popularFacilities: stay.popularFacilities ?? [],
      amenities: stay.amenities
        ? Object.fromEntries(Object.entries(stay.amenities))
        : {},
      rooms:
        Array.isArray(stay.rooms) && stay.rooms.length
          ? stay.rooms.map((room: any) => ({
            name: room.name ?? "",
            description: room.description ?? "",
            bedType: room.bedType ?? "Queen Bed",
            beds: room.beds ?? 1,
            capacity: room.capacity ?? 1,
            price: room.price ?? 0,
            size: room.size ?? "",
            features: room.features ?? [],
            images: room.images ?? [],
          }))
          : [createDefaultRoom()],
      meals: stay.meals ?? [],
      bnb: {
        unitType: stay.bnb?.unitType ?? "",
        bedrooms: stay.bnb?.bedrooms ?? 0,
        bathrooms: stay.bnb?.bathrooms ?? 0,
        kitchenAvailable: stay.bnb?.kitchenAvailable ?? false,
        beds: stay.bnb?.beds ?? 0,
        capacity: stay.bnb?.capacity ?? 0,
        features: stay.bnb?.features ?? [],
        price: stay.bnb?.price ?? 0,
      },
      about: {
        heading: stay.about?.heading ?? "",
        description: stay.about?.description ?? "",
      },
      checkInOutRules: {
        checkIn: stay.checkInOutRules?.checkIn ?? "",
        checkOut: stay.checkInOutRules?.checkOut ?? "",
        rules: stay.checkInOutRules?.rules ?? [],
      },
      vendorMessage: stay.vendorMessage ?? "",
    });
  };

  useEffect(() => {
    if (!editId) return;

    const loadStay = async () => {
      setInitializing(true);
      try {
        const res = await fetch(`/api/vendor/stays?id=${editId}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok || !data.success || !data.stay) {
          throw new Error(data?.message || "Failed to load stay details");
        }
        hydrateForm(data.stay);
        // Set bnbUnitTypeOther if unit type is not one of the predefined options
        if (data.stay.bnb?.unitType) {
          if (!["1 BHK", "2 BHK", "3 BHK"].includes(data.stay.bnb.unitType)) {
            setBnbUnitTypeOther(true);
          } else {
            setBnbUnitTypeOther(false);
          }
        }
      } catch (error: any) {
        alert(error?.message || "Unable to load stay for editing");
        router.push("/vendor/properties/stays");
      } finally {
        setInitializing(false);
      }
    };

    loadStay();
  }, [editId, router]);

  // Handle category changes - ensure Room category has exactly one room
  useEffect(() => {
    if (formData.category === "rooms") {
      if (formData.rooms.length === 0) {
        setFormData((prev) => ({ ...prev, rooms: [createDefaultRoom()] }));
      } else if (formData.rooms.length > 1) {
        setFormData((prev) => ({ ...prev, rooms: [prev.rooms[0]] }));
      }
    }
  }, [formData.category]);

  const uploadMedia = async (files: File[], folder: string) => {
    if (!files.length) return [] as string[];
    setUploadingState((prev) => ({ ...prev, [folder]: true }));
    setUploadError(null);

    const form = new FormData();
    files.forEach((file) => form.append("files", file));
    form.append("folder", folder);

    try {
      const res = await fetch("/api/uploads/stays", {
        method: "POST",
        body: form,
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.message || "Failed to upload media");
      }
      return (data.uploads || []).map((item: any) => item.url as string);
    } catch (error: any) {
      setUploadError(error?.message || "Upload failed. Please try again.");
      return [];
    } finally {
      setUploadingState((prev) => ({ ...prev, [folder]: false }));
    }
  };

  const handlePropertyImages = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const uploaded = await uploadMedia(files, `stays/${formData.category}/property`);
    if (uploaded.length) {
      setFormData((prev) => ({ ...prev, images: [...prev.images, ...uploaded] }));
    }
    event.target.value = "";
  };

  const handleGalleryImages = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const uploaded = await uploadMedia(files, `stays/${formData.category}/gallery`);
    if (uploaded.length) {
      setFormData((prev) => ({ ...prev, gallery: [...prev.gallery, ...uploaded] }));
    }
    event.target.value = "";
  };

  const handleVideoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    key: "inside" | "outside"
  ) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const uploaded = await uploadMedia(files, `stays/${formData.category}/videos/${key}`);
    if (uploaded.length) {
      setFormData((prev) => ({
        ...prev,
        videos: {
          ...prev.videos,
          [key]: [...prev.videos[key], ...uploaded],
        },
      }));
    }
    event.target.value = "";
  };

  const handleRoomImages = async (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const uploaded = await uploadMedia(files, `stays/${formData.category}/rooms/${index + 1}`);
    if (uploaded.length) {
      setFormData((prev) => {
        const rooms = [...prev.rooms];
        rooms[index] = { ...rooms[index], images: [...rooms[index].images, ...uploaded] };
        return { ...prev, rooms };
      });
    }
    event.target.value = "";
  };

  const removeMedia = (key: "images" | "gallery", index: number) => {
    setFormData((prev) => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== index),
    }));
  };

  const removeVideo = (key: "inside" | "outside", index: number) => {
    setFormData((prev) => ({
      ...prev,
      videos: {
        ...prev.videos,
        [key]: prev.videos[key].filter((_, i) => i !== index),
      },
    }));
  };

  const removeRoomImage = (roomIndex: number, imageIndex: number) => {
    setFormData((prev) => {
      const rooms = [...prev.rooms];
      rooms[roomIndex] = {
        ...rooms[roomIndex],
        images: rooms[roomIndex].images.filter((_, i) => i !== imageIndex),
      };
      return { ...prev, rooms };
    });
  };

  const addRule = () => {
    if (!newRule.trim()) return;
    setFormData((prev) => ({
      ...prev,
      checkInOutRules: {
        ...prev.checkInOutRules,
        rules: [...prev.checkInOutRules.rules, newRule.trim()],
      },
    }));
    setNewRule("");
  };

  const removeRule = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      checkInOutRules: {
        ...prev.checkInOutRules,
        rules: prev.checkInOutRules.rules.filter((_, i) => i !== index),
      },
    }));
  };

  const addCustomHighlight = () => {
    if (!customHighlight.trim()) return;
    setFormData((prev) => ({
      ...prev,
      heroHighlights: [...prev.heroHighlights, customHighlight.trim()],
    }));
    setCustomHighlight("");
  };

  const addRoomFeature = (index: number) => {
    const draft = roomFeatureDrafts[index]?.trim();
    if (!draft) return;
    setFormData((prev) => {
      const rooms = [...prev.rooms];
      if (!rooms[index].features.includes(draft)) {
        rooms[index] = {
          ...rooms[index],
          features: [...rooms[index].features, draft],
        };
      }
      return { ...prev, rooms };
    });
    setRoomFeatureDrafts((prev) => ({ ...prev, [index]: "" }));
  };

  const removeRoomFeature = (roomIndex: number, feature: string) => {
    setFormData((prev) => {
      const rooms = [...prev.rooms];
      rooms[roomIndex] = {
        ...rooms[roomIndex],
        features: rooms[roomIndex].features.filter((item) => item !== feature),
      };
      return { ...prev, rooms };
    });
  };

  const handleGetLocation = async () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          location: {
            ...prev.location,
            coordinates: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
          },
        }));
      },
      () => {
        alert("We could not get your GPS location. Please enter coordinates manually if needed.");
      }
    );
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = "Stay name is required";
    if (!formData.location.address.trim()) errs.address = "Address is required";
    if (!formData.location.city.trim()) errs.city = "City is required";
    if (!formData.location.state.trim()) errs.state = "State is required";
    if (!formData.location.country.trim()) errs.country = "Country is required";
    if (formData.images.length < 5) errs.images = "Upload at least 5 property images";
    if (!formData.about.heading.trim()) errs.aboutHeading = "Please add an about heading";
    if (!formData.about.description.trim()) errs.aboutDescription = "Please describe the stay";
    if (!formData.checkInOutRules.checkIn.trim()) errs.checkIn = "Provide check-in timing";
    if (!formData.checkInOutRules.checkOut.trim()) errs.checkOut = "Provide check-out timing";

    // Validate based on category
    if (formData.category === "hotels" || formData.category === "homestays") {
      if (!formData.rooms.length) errs.rooms = "Add at least one room";
      formData.rooms.forEach((room, idx) => {
        if (!room.name.trim()) errs[`room-${idx}-name`] = "Room name is required";
        if (!room.bedType.trim()) errs[`room-${idx}-bedType`] = "Bed type is required";
        if (room.beds < 1) errs[`room-${idx}-beds`] = "Beds must be at least 1";
        if (room.capacity < 1) errs[`room-${idx}-capacity`] = "Capacity must be at least 1";
        if (room.price <= 0) errs[`room-${idx}-price`] = "Price must be greater than 0";
        if (room.images.length < 3) errs[`room-${idx}-images`] = "Upload at least 3 images for this room";
      });
    } else if (formData.category === "rooms") {
      if (!formData.rooms.length || formData.rooms.length === 0) {
        errs.rooms = "Room information is required";
      } else {
        const room = formData.rooms[0];
        if (room.beds < 1) errs[`room-0-beds`] = "Beds must be at least 1";
        if (room.capacity < 1) errs[`room-0-capacity`] = "Capacity must be at least 1";
        if (room.price <= 0) errs[`room-0-price`] = "Price must be greater than 0";
      }
    } else if (formData.category === "bnbs") {
      if (!formData.bnb.unitType.trim()) errs.bnbUnitType = "Unit type is required";
      if (formData.bnb.bedrooms < 1) errs.bnbBedrooms = "Number of bedrooms must be at least 1";
      if (formData.bnb.bathrooms < 1) errs.bnbBathrooms = "Number of bathrooms must be at least 1";
      if (formData.bnb.beds < 1) errs.bnbBeds = "Total beds must be at least 1";
      if (formData.bnb.capacity < 1) errs.bnbCapacity = "Guest capacity must be at least 1";
      if (formData.bnb.price <= 0) errs.bnbPrice = "Price must be greater than 0";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    setUploadError(null);

    try {
      const endpoint = editId ? `/api/vendor/stays?id=${editId}` : "/api/vendor/stays";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.message || "Failed to create stay");
      }
      router.push("/vendor/properties/stays");
    } catch (error: any) {
      alert(error?.message || "Failed to save stay");
    } finally {
      setSubmitting(false);
    }
  };

  if (initializing) {
    return <PageLoader />;
  }

  return (
    <div className="flex h-screen bg-gray-50 text-black relative">
      {/* <div className="hidden lg:block lg:sticky lg:top-0 lg:h-screen pt-15 overflow-y-auto">
        <Sidebar />
      </div> */}

      <div className="flex-1 flex flex-col ">
        <div className="sticky top-0 z-40 bg-sky-50">
          <div className="flex items-center gap-3 p-3 border-b lg:pt-15 pt-0">
            {/* <button
              className="lg:hidden px-3 py-2 rounded border text-gray-800"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Open menu"
            >
              ☰
            </button> */}
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
              {isEditing ? "Edit stay" : "Create a new stay"}
            </h1>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto  p-4 sm:p-6 max-w-5xl mx-auto">
          <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6">
            {uploadError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {uploadError}
              </div>
            )}

            {/* Basic info */}
            <section className="bg-white rounded-xl shadow p-6 space-y-4 max-w-5xl mx-auto ">
              <h2 className="text-xl font-semibold text-gray-900">Basic information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Stay name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setField("name", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                    placeholder="e.g., Skyline Grand Hotel"
                  />
                  {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setField("category", e.target.value as typeof formData.category)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                  >
                    <option value="rooms">Rooms</option>
                    <option value="hotels">Hotels</option>
                    <option value="homestays">Homestays</option>
                    <option value="bnbs">BnBs</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Location */}
            <section className="bg-white rounded-xl shadow p-6 space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Location</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.location.address}
                    onChange={(e) => setField("location", { ...formData.location, address: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                    placeholder="Street and number"
                  />
                  {errors.address && <p className="text-red-600 text-sm mt-1">{errors.address}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.location.city}
                      onChange={(e) => setField("location", { ...formData.location, city: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                    />
                    {errors.city && <p className="text-red-600 text-sm mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.location.state}
                      onChange={(e) => setField("location", { ...formData.location, state: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                    />
                    {errors.state && <p className="text-red-600 text-sm mt-1">{errors.state}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.location.country}
                      onChange={(e) => setField("location", { ...formData.location, country: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                    />
                    {errors.country && <p className="text-red-600 text-sm mt-1">{errors.country}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Postal code</label>
                    <input
                      type="text"
                      value={formData.location.postalCode}
                      onChange={(e) => setField("location", { ...formData.location, postalCode: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
                >
                  <FaMapMarkerAlt /> Use current location
                </button>
              </div>
            </section>

            {/* Highlights */}
            <section className="bg-white rounded-xl shadow p-6 space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Highlights & popular facilities</h2>
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Top highlights</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {HERO_HIGHLIGHTS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleArrayValue("heroHighlights", item)}
                      className={`text-left px-3 py-2 rounded-lg border transition ${formData.heroHighlights.includes(item)
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-gray-300 text-gray-900 hover:border-green-400"
                        }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={customHighlight}
                    onChange={(e) => setCustomHighlight(e.target.value)}
                    placeholder="Add custom highlight"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={addCustomHighlight}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Popular facilities</h3>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_FACILITIES.map((facility) => (
                    <button
                      key={facility}
                      type="button"
                      onClick={() => toggleArrayValue("popularFacilities", facility)}
                      className={`px-3 py-2 rounded-full text-sm border transition ${formData.popularFacilities.includes(facility)
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-gray-300 text-gray-900 hover:border-green-400"
                        }`}
                    >
                      {facility}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Property media */}
            <section className="bg-white rounded-xl shadow p-6 space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Media</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Property images <span className="text-red-500">*</span> (minimum 5)
                  </label>
                  <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 text-gray-900">
                    <FaUpload className="text-gray-600" />
                    <span>Choose files</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handlePropertyImages}
                    />
                  </label>
                  {uploadingState[`stays/${formData.category}/property`] && (
                    <p className="text-sm text-gray-600 mt-1">Uploading property images…</p>
                  )}
                  {errors.images && <p className="text-red-600 text-sm mt-1">{errors.images}</p>}
                  {formData.images.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                      {formData.images.map((src, index) => (
                        <div key={src + index} className="relative">
                          <img src={src} alt={`Stay image ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                          <button
                            type="button"
                            onClick={() => removeMedia("images", index)}
                            className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Gallery (optional)</label>
                  <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 text-gray-900">
                    <FaUpload className="text-gray-600" />
                    <span>Add gallery images</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleGalleryImages}
                    />
                  </label>
                  {uploadingState[`stays/${formData.category}/gallery`] && (
                    <p className="text-sm text-gray-600 mt-1">Uploading gallery images…</p>
                  )}
                  {formData.gallery.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                      {formData.gallery.map((src, index) => (
                        <div key={src + index} className="relative">
                          <img src={src} alt={`Gallery image ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                          <button
                            type="button"
                            onClick={() => removeMedia("gallery", index)}
                            className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {["inside", "outside"].map((key) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        {key === "inside" ? "Inside videos" : "Outside videos"} (up to 2)
                      </label>
                      <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 text-gray-900">
                        <FaUpload className="text-gray-600" />
                        <span>Select videos</span>
                        <input
                          type="file"
                          multiple
                          accept="video/*"
                          className="hidden"
                          onChange={(event) => handleVideoUpload(event, key as "inside" | "outside")}
                        />
                      </label>
                      {uploadingState[`stays/${formData.category}/videos/${key}`] && (
                        <p className="text-sm text-gray-600 mt-1">Uploading videos…</p>
                      )}
                      {formData.videos[key as "inside" | "outside"].length > 0 && (
                        <ul className="mt-2 space-y-2">
                          {formData.videos[key as "inside" | "outside"].map((url, index) => (
                            <li key={url + index} className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-lg">
                              <span className="truncate text-sm text-gray-900">Video {index + 1}</span>
                              <button
                                type="button"
                                onClick={() => removeVideo(key as "inside" | "outside", index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                Remove
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div> */}
              </div>
            </section>

            {/* Amenities */}
            <section className="bg-white rounded-xl shadow p-6 space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Amenities</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {AMENITY_SECTIONS.map((section) => (
                  <div key={section.key} className="space-y-2">
                    <h3 className="font-medium text-gray-900">{section.label}</h3>
                    <div className="flex flex-wrap gap-2">
                      {section.options.map((option) => {
                        const selected = (formData.amenities[section.key] || []).includes(option);
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => toggleAmenity(section.key, option)}
                            className={`px-3 py-2 text-sm rounded-full border transition ${selected
                                ? "border-green-500 bg-green-50 text-green-700"
                                : "border-gray-300 text-gray-900 hover:border-green-400"
                              }`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Meals - Only for Homestay */}
            {formData.category === "homestays" && (
              <section className="bg-white rounded-xl shadow p-6 space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  How many times do you provide meals per day?
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {["Breakfast", "Lunch", "Evening Snacks", "Dinner"].map((meal) => {
                    const selected = formData.meals.includes(meal);
                    return (
                      <button
                        key={meal}
                        type="button"
                        onClick={() => toggleMeal(meal)}
                        className={`px-4 py-3 rounded-lg border transition ${selected
                            ? "border-green-500 bg-green-50 text-green-700"
                            : "border-gray-300 text-gray-900 hover:border-green-400"
                          }`}
                      >
                        {meal}
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Rooms - Only for Hotels and Homestays */}
            {formData.category === "hotels" || formData.category === "homestays" ? (
              <section className="bg-white rounded-xl shadow p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Rooms</h2>
                  <button
                    type="button"
                    onClick={addRoom}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <FaPlus /> Add room
                  </button>
                </div>
                {errors.rooms && <p className="text-red-600 text-sm">{errors.rooms}</p>}

                <div className="space-y-6">
                  {formData.rooms.map((room, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Room {index + 1}</h3>
                        {formData.rooms.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRoom(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Remove room
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-1">
                            Room name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={room.name}
                            onChange={(e) => updateRoom(index, "name", e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                            placeholder="e.g., Deluxe King Room"
                          />
                          {errors[`room-${index}-name`] && (
                            <p className="text-red-600 text-sm mt-1">{errors[`room-${index}-name`]}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-1">
                            Bed type <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={room.bedType}
                            onChange={(e) => updateRoom(index, "bedType", e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                          >
                            {BED_TYPES.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                          {errors[`room-${index}-bedType`] && (
                            <p className="text-red-600 text-sm mt-1">{errors[`room-${index}-bedType`]}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-1">
                            Beds <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={room.beds}
                            onChange={(e) => updateRoom(index, "beds", Number(e.target.value))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                          />
                          {errors[`room-${index}-beds`] && (
                            <p className="text-red-600 text-sm mt-1">{errors[`room-${index}-beds`]}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-1">
                            Capacity (guests) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={room.capacity}
                            onChange={(e) => updateRoom(index, "capacity", Number(e.target.value))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                          />
                          {errors[`room-${index}-capacity`] && (
                            <p className="text-red-600 text-sm mt-1">{errors[`room-${index}-capacity`]}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-1">
                            Price per night (₹) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={room.price}
                            onChange={(e) => updateRoom(index, "price", Number(e.target.value))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                          />
                          {errors[`room-${index}-price`] && (
                            <p className="text-red-600 text-sm mt-1">{errors[`room-${index}-price`]}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-1">Room size</label>
                          <input
                            type="text"
                            value={room.size}
                            onChange={(e) => updateRoom(index, "size", e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                            placeholder="e.g., 35 m²"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">Room description</label>
                        <textarea
                          rows={3}
                          value={room.description}
                          onChange={(e) => updateRoom(index, "description", e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                          placeholder="Describe what makes this room special"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Room features
                        </label>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {ROOM_FEATURE_OPTIONS.map((feature) => {
                            const selected = room.features.includes(feature);
                            return (
                              <button
                                key={feature}
                                type="button"
                                onClick={() => {
                                  if (selected) removeRoomFeature(index, feature);
                                  else updateRoom(index, "features", [...room.features, feature]);
                                }}
                                className={`px-3 py-2 text-sm rounded-full border transition ${selected
                                    ? "border-green-500 bg-green-50 text-green-700"
                                    : "border-gray-300 text-gray-900 hover:border-green-400"
                                  }`}
                              >
                                {feature}
                              </button>
                            );
                          })}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={roomFeatureDrafts[index] || ""}
                            onChange={(e) =>
                              setRoomFeatureDrafts((prev) => ({ ...prev, [index]: e.target.value }))
                            }
                            placeholder="Add custom feature"
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                          />
                          <button
                            type="button"
                            onClick={() => addRoomFeature(index)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                          >
                            Add
                          </button>
                        </div>
                        {room.features.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {room.features.map((feature) => (
                              <span
                                key={feature}
                                className="inline-flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 rounded-full text-gray-900"
                              >
                                {feature}
                                <button
                                  type="button"
                                  onClick={() => removeRoomFeature(index, feature)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <FaTimes />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">
                          Room images <span className="text-red-500">*</span> (minimum 3)
                        </label>
                        <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 text-gray-900">
                          <FaUpload className="text-gray-600" />
                          <span>Select room images</span>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={(event) => handleRoomImages(event, index)}
                          />
                        </label>
                        {uploadingState[`stays/${formData.category}/rooms/${index + 1}`] && (
                          <p className="text-sm text-gray-600 mt-1">Uploading room images…</p>
                        )}
                        {errors[`room-${index}-images`] && (
                          <p className="text-red-600 text-sm mt-1">{errors[`room-${index}-images`]}</p>
                        )}
                        {room.images.length > 0 && (
                          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                            {room.images.map((src, imgIndex) => (
                              <div key={src + imgIndex} className="relative">
                                <img
                                  src={src}
                                  alt={`Room ${index + 1} image ${imgIndex + 1}`}
                                  className="w-full h-28 object-cover rounded-lg"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeRoomImage(index, imgIndex)}
                                  className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1"
                                >
                                  <FaTimes />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {/* Single Room Section - Only for Room category */}
            {formData.category === "rooms" && (
              <section className="bg-white rounded-xl shadow p-6 space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Room Features</h2>
                {formData.rooms.length > 0 && (
                  <div className="border border-gray-200 rounded-xl p-5 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">
                          Price per night (₹) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={formData.rooms[0].price}
                          onChange={(e) => updateRoom(0, "price", Number(e.target.value))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                        />
                        {errors[`room-0-price`] && (
                          <p className="text-red-600 text-sm mt-1">{errors[`room-0-price`]}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">
                          Beds <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={formData.rooms[0].beds}
                          onChange={(e) => updateRoom(0, "beds", Number(e.target.value))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                        />
                        {errors[`room-0-beds`] && (
                          <p className="text-red-600 text-sm mt-1">{errors[`room-0-beds`]}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">
                          Guest Capacity <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={formData.rooms[0].capacity}
                          onChange={(e) => updateRoom(0, "capacity", Number(e.target.value))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                        />
                        {errors[`room-0-capacity`] && (
                          <p className="text-red-600 text-sm mt-1">{errors[`room-0-capacity`]}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Room Features
                      </label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {ROOM_FEATURE_OPTIONS.map((feature) => {
                          const selected = formData.rooms[0].features.includes(feature);
                          return (
                            <button
                              key={feature}
                              type="button"
                              onClick={() => {
                                if (selected) removeRoomFeature(0, feature);
                                else updateRoom(0, "features", [...formData.rooms[0].features, feature]);
                              }}
                              className={`px-3 py-2 text-sm rounded-full border transition ${selected
                                  ? "border-green-500 bg-green-50 text-green-700"
                                  : "border-gray-300 text-gray-900 hover:border-green-400"
                                }`}
                            >
                              {feature}
                            </button>
                          );
                        })}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={roomFeatureDrafts[0] || ""}
                          onChange={(e) =>
                            setRoomFeatureDrafts((prev) => ({ ...prev, [0]: e.target.value }))
                          }
                          placeholder="Add custom feature"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                        />
                        <button
                          type="button"
                          onClick={() => addRoomFeature(0)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          Add
                        </button>
                      </div>
                      {formData.rooms[0].features.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {formData.rooms[0].features.map((feature) => (
                            <span
                              key={feature}
                              className="inline-flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 rounded-full text-gray-900"
                            >
                              {feature}
                              <button
                                type="button"
                                onClick={() => removeRoomFeature(0, feature)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <FaTimes />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* BnB Section - Only for BnBs category */}
            {formData.category === "bnbs" && (
              <section className="bg-white rounded-xl shadow p-6 space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">BnB Details</h2>
                <div className="border border-gray-200 rounded-xl p-5 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        Unit Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={
                          ["1 BHK", "2 BHK", "3 BHK"].includes(formData.bnb.unitType)
                            ? formData.bnb.unitType
                            : bnbUnitTypeOther || (formData.bnb.unitType && !["1 BHK", "2 BHK", "3 BHK"].includes(formData.bnb.unitType))
                              ? "Others"
                              : ""
                        }
                        onChange={(e) => {
                          if (e.target.value === "Others") {
                            setBnbUnitTypeOther(true);
                            // Don't clear unitType if it already has a custom value
                            if (!formData.bnb.unitType || ["1 BHK", "2 BHK", "3 BHK"].includes(formData.bnb.unitType)) {
                              updateBnb("unitType", "");
                            }
                          } else {
                            setBnbUnitTypeOther(false);
                            updateBnb("unitType", e.target.value);
                          }
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                      >
                        <option value="">Select unit type</option>
                        <option value="1 BHK">1 BHK</option>
                        <option value="2 BHK">2 BHK</option>
                        <option value="3 BHK">3 BHK</option>
                        <option value="Others">Others</option>
                      </select>
                      {(bnbUnitTypeOther || (formData.bnb.unitType && !["1 BHK", "2 BHK", "3 BHK"].includes(formData.bnb.unitType))) && (
                        <input
                          type="text"
                          value={formData.bnb.unitType}
                          onChange={(e) => {
                            updateBnb("unitType", e.target.value);
                            if (!bnbUnitTypeOther) {
                              setBnbUnitTypeOther(true);
                            }
                          }}
                          placeholder="Specify unit type (e.g., 4 BHK, Studio, Penthouse, etc.)"
                          className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        Number of Bedrooms <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={formData.bnb.bedrooms}
                        onChange={(e) => updateBnb("bedrooms", Number(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        Number of Attached Bathrooms <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={formData.bnb.bathrooms}
                        onChange={(e) => updateBnb("bathrooms", Number(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        Kitchen Available <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.bnb.kitchenAvailable ? "yes" : "no"}
                        onChange={(e) => updateBnb("kitchenAvailable", e.target.value === "yes")}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                      >
                        <option value="no">No</option>
                        <option value="yes">Yes</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        Total Beds <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={formData.bnb.beds}
                        onChange={(e) => updateBnb("beds", Number(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        Guest Capacity <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={formData.bnb.capacity}
                        onChange={(e) => updateBnb("capacity", Number(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        Price per night (₹) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={formData.bnb.price}
                        onChange={(e) => updateBnb("price", Number(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Features / Amenities
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {ROOM_FEATURE_OPTIONS.map((feature) => {
                        const selected = formData.bnb.features.includes(feature);
                        return (
                          <button
                            key={feature}
                            type="button"
                            onClick={() => {
                              if (selected) {
                                updateBnb("features", formData.bnb.features.filter((f) => f !== feature));
                              } else {
                                updateBnb("features", [...formData.bnb.features, feature]);
                              }
                            }}
                            className={`px-3 py-2 text-sm rounded-full border transition ${selected
                                ? "border-green-500 bg-green-50 text-green-700"
                                : "border-gray-300 text-gray-900 hover:border-green-400"
                              }`}
                          >
                            {feature}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={roomFeatureDrafts["bnb"] || ""}
                        onChange={(e) =>
                          setRoomFeatureDrafts((prev) => ({ ...prev, bnb: e.target.value }))
                        }
                        placeholder="Add custom feature"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const draft = roomFeatureDrafts["bnb"]?.trim();
                            if (draft && !formData.bnb.features.includes(draft)) {
                              updateBnb("features", [...formData.bnb.features, draft]);
                              setRoomFeatureDrafts((prev) => ({ ...prev, bnb: "" }));
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const draft = roomFeatureDrafts["bnb"]?.trim();
                          if (draft && !formData.bnb.features.includes(draft)) {
                            updateBnb("features", [...formData.bnb.features, draft]);
                            setRoomFeatureDrafts((prev) => ({ ...prev, bnb: "" }));
                          }
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Add
                      </button>
                    </div>
                    {formData.bnb.features.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {formData.bnb.features.map((feature) => (
                          <span
                            key={feature}
                            className="inline-flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 rounded-full text-gray-900"
                          >
                            {feature}
                            <button
                              type="button"
                              onClick={() => {
                                updateBnb("features", formData.bnb.features.filter((f) => f !== feature));
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <FaTimes />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* About & rules */}
            <section className="bg-white rounded-xl shadow p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">About this stay</h2>
                <div className="mt-3 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Heading <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.about.heading}
                      onChange={(e) => setField("about", { ...formData.about, heading: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                    />
                    {errors.aboutHeading && <p className="text-red-600 text-sm mt-1">{errors.aboutHeading}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={5}
                      value={formData.about.description}
                      onChange={(e) => setField("about", { ...formData.about, description: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                      placeholder="Share more about ambience, surroundings, and why guests will love it"
                    />
                    {errors.aboutDescription && (
                      <p className="text-red-600 text-sm mt-1">{errors.aboutDescription}</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900">Check-in / Check-out & rules</h3>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Check-in time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.checkInOutRules.checkIn}
                      onChange={(e) =>
                        setField("checkInOutRules", {
                          ...formData.checkInOutRules,
                          checkIn: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                      placeholder="e.g., From 2:00 PM"
                    />
                    {errors.checkIn && <p className="text-red-600 text-sm mt-1">{errors.checkIn}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Check-out time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.checkInOutRules.checkOut}
                      onChange={(e) =>
                        setField("checkInOutRules", {
                          ...formData.checkInOutRules,
                          checkOut: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                      placeholder="e.g., Until 11:00 AM"
                    />
                    {errors.checkOut && <p className="text-red-600 text-sm mt-1">{errors.checkOut}</p>}
                  </div>
                </div>
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-900 mb-1">House rules</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newRule}
                      onChange={(e) => setNewRule(e.target.value)}
                      placeholder="Add a rule"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addRule();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={addRule}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Add
                    </button>
                  </div>
                  {formData.checkInOutRules.rules.length > 0 && (
                    <ul className="mt-3 space-y-2">
                      {formData.checkInOutRules.rules.map((rule, index) => (
                        <li key={rule + index} className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-lg text-gray-900">
                          <span>{rule}</span>
                          <button
                            type="button"
                            onClick={() => removeRule(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <FaTimes />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Vendor message</label>
                <textarea
                  rows={4}
                  value={formData.vendorMessage}
                  onChange={(e) => setField("vendorMessage", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                  placeholder="Share any special note for guests or booking team"
                />
              </div>
            </section>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-60"
              >
                {submitting
                  ? isEditing
                    ? "Updating…"
                    : "Saving…"
                  : isEditing
                    ? "Update stay"
                    : "Create stay"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/vendor/properties/stays")}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </main>
      </div>

      {/* {mobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-100 bg-black/40 lg:hidden "
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-100 p-0 lg:hidden overflow-y-auto">
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
      )} */}
    </div>
  );
}