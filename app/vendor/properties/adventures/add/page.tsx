// app/properties/adventures/add/page.tsx
"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "@/app/components/Pages/vendor/Sidebar";
import {
  FaMapMarkerAlt,
  FaPlus,
  FaTimes,
  FaUpload,
  FaVideo,
  FaImage,
  FaTrash,
} from "react-icons/fa";
import PageLoader from "@/app/components/common/PageLoader";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const HERO_HIGHLIGHTS = [
  "Expert guide",
  "All equipment provided",
  "Safety gear included",
  "Small group",
  "Insurance covered",
  "Pickup & drop‑off",
  "Meals included",
  "Photography",
  "Beginner‑friendly",
  "Scenic views",
  "Adrenaline rush",
];

const POPULAR_FACILITIES = [
  "Trekking poles",
  "Camping tent",
  "Life jacket",
  "Helmet",
  "First aid kit",
  "Waterproof gear",
  "Sleeping bag",
  "Headlamp",
  "Transport",
  "Snacks & water",
];

const AMENITY_SECTIONS: Array<{
  key: string;
  label: string;
  options: string[];
}> = [
    {
      key: "Equipment",
      label: "Equipment Provided",
      options: [
        "Trekking poles",
        "Backpack",
        "Camping tent",
        "Sleeping bag",
        "Headlamp",
        "Cooking gear",
        "Life jacket",
        "Helmet",
        "Harness",
        "Rope",
        "Climbing shoes",
        "Crampons",
      ],
    },
    {
      key: "Safety",
      label: "Safety",
      options: [
        "First aid kit",
        "Emergency contact",
        "Certified guide",
        "Insurance",
        "Safety briefing",
        "Weather monitoring",
        "GPS tracking",
      ],
    },
    {
      key: "Food & Drink",
      label: "Food & Drink",
      options: [
        "Breakfast",
        "Lunch",
        "Dinner",
        "Snacks",
        "Bottled water",
        "Energy bars",
        "Tea/Coffee",
      ],
    },
    {
      key: "Transport",
      label: "Transport",
      options: [
        "Hotel pickup",
        "4x4 vehicle",
        "Boat transfer",
        "Air‑conditioned bus",
        "Private car",
      ],
    },
  ];

const DIFFICULTY_LEVELS = ["Easy", "Moderate", "Challenging", "Expert"];
const FEATURE_PRESETS = [
  "Expert guides",
  "Small group",
  "Meals included",
  "Photography stops",
  "Safety gear included",
  "Beginner friendly",
];

const DURATION_OPTIONS = [
  "2 hours",
  "4 hours",
  "6 hours",
  "8 hours",
  "Full day",
  "2 days",
  "3+ days",
];

const DIFFICULTY_CATEGORIES = ["trekking", "hiking", "water-rafting"] as const;

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, false] }],
    ["bold", "italic", "underline", "blockquote"],
    [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
    [{ align: [] }],
    ["link", "image"],
    ["clean"],
  ],
};

const quillFormats = [
  "header",
  "bold",
  "italic",
  "underline",
  "blockquote",
  "list",
  "indent",
  "align",
  "link",
  "image",
];

type ItineraryDay = {
  id: string;
  heading: string;
  description: string;
};

const createItineraryDay = (dayNumber: number): ItineraryDay => ({
  id: `${Date.now()}-${dayNumber}`,
  heading: `Day ${dayNumber}`,
  description: "",
});

export default function AddAdventurePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("editId") ?? searchParams.get("id");
  const isEditing = Boolean(editId);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [customHighlight, setCustomHighlight] = useState("");
  const [newRule, setNewRule] = useState("");
  const [featureDraft, setFeatureDraft] = useState("");
  const [uploadingState, setUploadingState] = useState<Record<string, boolean>>({});
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(isEditing);

  const [formData, setFormData] = useState({
    name: "",
    category: "trekking" as "trekking" | "hiking" | "camping" | "water-rafting",
    duration: "4 hours",
    price: 0,
    capacity: 10,
    difficultyLevel: "",
    features: [] as string[],
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
    about: {
      heading: "",
      description: "",
    },
    itinerary: [createItineraryDay(1)],
    inclusions: "",
    exclusions: "",
    policyTerms: "",
    vendorMessage: "",
    defaultCancellationPolicy: "",
    defaultHouseRules: [] as string[],
  });

  const setField = <K extends keyof typeof formData>(key: K, value: (typeof formData)[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const toggleArrayValue = (key: "heroHighlights" | "popularFacilities", value: string) => {
    setFormData((prev) => {
      const coll = prev[key];
      const exists = coll.includes(value);
      return {
        ...prev,
        [key]: exists ? coll.filter((i) => i !== value) : [...coll, value],
      };
    });
  };

  const toggleAmenity = (sectionKey: string, option: string) => {
    setFormData((prev) => {
      const current = prev.amenities[sectionKey] || [];
      const next = current.includes(option)
        ? current.filter((i) => i !== option)
        : [...current, option];
      const amenities = { ...prev.amenities };
      if (next.length) amenities[sectionKey] = next;
      else delete amenities[sectionKey];
      return { ...prev, amenities };
    });
  };

  const toggleFeature = (feature: string) => {
    setFormData((prev) => {
      const exists = prev.features.includes(feature);
      return {
        ...prev,
        features: exists ? prev.features.filter((item) => item !== feature) : [...prev.features, feature],
      };
    });
  };

  const handleAddFeature = () => {
    const draft = featureDraft.trim();
    if (!draft) return;
    setFormData((prev) => {
      if (prev.features.includes(draft)) return prev;
      return { ...prev, features: [...prev.features, draft] };
    });
    setFeatureDraft("");
  };

  const addItineraryDay = () => {
    setFormData((prev) => ({
      ...prev,
      itinerary: [...prev.itinerary, createItineraryDay(prev.itinerary.length + 1)],
    }));
  };

  const updateItineraryDay = (id: string, key: "heading" | "description", value: string) => {
    setFormData((prev) => ({
      ...prev,
      itinerary: prev.itinerary.map((day) => (day.id === id ? { ...day, [key]: value } : day)),
    }));
  };

  const removeItineraryDay = (id: string) => {
    setFormData((prev) => {
      const filtered = prev.itinerary.filter((day) => day.id !== id);
      if (!filtered.length) return prev;
      return { ...prev, itinerary: filtered };
    });
  };

  const categoryRequiresDifficulty = (category: typeof formData.category) =>
    category === "trekking" || category === "hiking" || category === "water-rafting";

  const shouldShowDifficultyField = categoryRequiresDifficulty(formData.category);

  const handleCategoryChange = (value: typeof formData.category) => {
    setFormData((prev) => ({
      ...prev,
      category: value,
      difficultyLevel: categoryRequiresDifficulty(value) ? prev.difficultyLevel : "",
    }));
  };

  const hydrateForm = (adventure: any) => {
    const primaryOption =
      Array.isArray(adventure.options) && adventure.options.length ? adventure.options[0] : null;

    setFormData({
      name: adventure.name ?? "",
      category: (adventure.category as "trekking" | "hiking" | "camping" | "water-rafting") ?? "trekking",
      duration: adventure.duration ?? primaryOption?.duration ?? "4 hours",
      price:
        typeof adventure.price === "number"
          ? adventure.price
          : typeof primaryOption?.price === "number"
            ? primaryOption.price
            : 0,
      capacity:
        typeof adventure.capacity === "number"
          ? adventure.capacity
          : typeof primaryOption?.capacity === "number"
            ? primaryOption.capacity
            : 10,
      difficultyLevel: adventure.difficultyLevel ?? primaryOption?.difficulty ?? "",
      features:
        Array.isArray(adventure.features) && adventure.features.length
          ? adventure.features
          : primaryOption?.features ?? [],
      location: {
        address: adventure.location?.address ?? "",
        city: adventure.location?.city ?? "",
        state: adventure.location?.state ?? "",
        country: adventure.location?.country ?? "",
        postalCode: adventure.location?.postalCode ?? "",
        coordinates: {
          lat: adventure.location?.coordinates?.lat ?? 0,
          lng: adventure.location?.coordinates?.lng ?? 0,
        },
      },
      heroHighlights: adventure.heroHighlights ?? [],
      images: adventure.images ?? [],
      gallery: adventure.gallery ?? [],
      videos: {
        inside: adventure.videos?.inside ?? [],
        outside: adventure.videos?.outside ?? [],
      },
      popularFacilities: adventure.popularFacilities ?? [],
      amenities: adventure.amenities ? Object.fromEntries(Object.entries(adventure.amenities)) : {},
      about: {
        heading: adventure.about?.heading ?? "",
        description: adventure.about?.description ?? "",
      },
      itinerary:
        Array.isArray(adventure.itinerary) && adventure.itinerary.length
          ? adventure.itinerary.map((day: any, index: number) => ({
            id: `${Date.now()}-${index}`,
            heading: day.heading ?? `Day ${index + 1}`,
            description: day.description ?? "",
          }))
          : [createItineraryDay(1)],
      inclusions: adventure.inclusions ?? "",
      exclusions: adventure.exclusions ?? "",
      policyTerms: adventure.policyTerms ?? "",
      vendorMessage: adventure.vendorMessage ?? "",
      defaultCancellationPolicy: adventure.defaultCancellationPolicy ?? "",
      defaultHouseRules: adventure.defaultHouseRules ?? [],
    });
  };

  useEffect(() => {
    if (!editId) return;

    const loadAdventure = async () => {
      setInitializing(true);
      try {
        const res = await fetch(`/api/vendor/adventures?id=${editId}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok || !data.success || !data.adventure) {
          throw new Error(data?.message || "Failed to load adventure details");
        }
        hydrateForm(data.adventure);
      } catch (error: any) {
        alert(error?.message || "Unable to load adventure for editing");
        router.push("/vendor/properties/adventures");
      } finally {
        setInitializing(false);
      }
    };

    loadAdventure();
  }, [editId, router]);

  // ──────────────────────────────────────────────────────
  // Media upload helper
  // ──────────────────────────────────────────────────────
  const uploadMedia = async (files: File[], folder: string) => {
    if (!files.length) return [] as string[];
    setUploadingState((prev) => ({ ...prev, [folder]: true }));
    setUploadError(null);

    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    form.append("folder", folder);

    try {
      const res = await fetch("/api/uploads/adventures", {
        method: "POST",
        body: form,
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data?.message ?? "Upload failed");
      return (data.uploads || []).map((u: any) => u.url as string);
    } catch (e: any) {
      setUploadError(e?.message ?? "Upload failed");
      return [];
    } finally {
      setUploadingState((prev) => ({ ...prev, [folder]: false }));
    }
  };

  // ──────────────────────────────────────────────────────
  // Property images (min 5)
  // ──────────────────────────────────────────────────────
  const handlePropertyImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const uploaded = await uploadMedia(files, `adventures/${formData.category}/property`);
    if (uploaded.length) setFormData((p) => ({ ...p, images: [...p.images, ...uploaded] }));
    e.target.value = "";
  };

  // ──────────────────────────────────────────────────────
  // Gallery images (optional)
  // ──────────────────────────────────────────────────────
  const handleGalleryImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const uploaded = await uploadMedia(files, `adventures/${formData.category}/gallery`);
    if (uploaded.length) setFormData((p) => ({ ...p, gallery: [...p.gallery, ...uploaded] }));
    e.target.value = "";
  };

  // ──────────────────────────────────────────────────────
  // Videos – inside / outside
  // ──────────────────────────────────────────────────────
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "inside" | "outside") => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const uploaded = await uploadMedia(files, `adventures/${formData.category}/videos/${type}`);
    if (uploaded.length) {
      setFormData((p) => ({
        ...p,
        videos: { ...p.videos, [type]: [...p.videos[type], ...uploaded] },
      }));
    }
    e.target.value = "";
  };

  // ──────────────────────────────────────────────────────
  // Media removal helpers
  // ──────────────────────────────────────────────────────
  const removeMedia = (key: "images" | "gallery", i: number) => {
    setFormData((p) => ({ ...p, [key]: p[key].filter((_, idx) => idx !== i) }));
  };
  const removeVideo = (type: "inside" | "outside", i: number) => {
    setFormData((p) => ({
      ...p,
      videos: { ...p.videos, [type]: p.videos[type].filter((_, idx) => idx !== i) },
    }));
  };

  // ──────────────────────────────────────────────────────
  // Misc helpers
  // ──────────────────────────────────────────────────────
  const addCustomHighlight = () => {
    if (!customHighlight.trim()) return;
    setFormData((p) => ({ ...p, heroHighlights: [...p.heroHighlights, customHighlight.trim()] }));
    setCustomHighlight("");
  };
  const addRule = () => {
    if (!newRule.trim()) return;
    setFormData((p) => ({ ...p, defaultHouseRules: [...p.defaultHouseRules, newRule.trim()] }));
    setNewRule("");
  };
  const removeRule = (i: number) =>
    setFormData((p) => ({ ...p, defaultHouseRules: p.defaultHouseRules.filter((_, idx) => idx !== i) }));

  const handleGetLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((p) => ({
          ...p,
          location: {
            ...p.location,
            coordinates: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          },
        }));
      },
      () => alert("Could not retrieve location")
    );
  };

  const buildDefaultAdventureOptions = (data: typeof formData) => {
    const optionImages = data.images.slice(0, 3);
    if (optionImages.length < 3) {
      throw new Error("Upload at least 3 images so we can create the booking option");
    }
    const flattenedAmenities = Object.values(data.amenities || {}).reduce<string[]>(
      (acc, section) => (Array.isArray(section) ? acc.concat(section) : acc),
      []
    );
    return [
      {
        name: `${data.name} experience`.trim(),
        description: data.about.description,
        duration: data.duration,
        difficulty: data.difficultyLevel || "Moderate",
        capacity: data.capacity,
        price: data.price,
        taxes: 0,
        currency: "INR",
        features: data.features,
        amenities: flattenedAmenities,
        available: data.capacity,
        images: optionImages,
        isRefundable: true,
        refundableUntilHours: 48,
      },
    ];
  };

  // ──────────────────────────────────────────────────────
  // Validation
  // ──────────────────────────────────────────────────────
  const validate = () => {
    const err: Record<string, string> = {};
    if (!formData.name.trim()) err.name = "Adventure name required";
    if (!formData.duration) err.duration = "Duration required";
    if (formData.price <= 0) err.price = "Price must be greater than 0";
    if (formData.capacity < 1) err.capacity = "Capacity must be at least 1";
    if (shouldShowDifficultyField && !formData.difficultyLevel.trim()) {
      err.difficultyLevel = "Select a difficulty level";
    }
    if (!formData.location.address.trim()) err.address = "Address required";
    if (!formData.location.city.trim()) err.city = "City required";
    if (!formData.location.state.trim()) err.state = "State required";
    if (!formData.location.country.trim()) err.country = "Country required";
    if (formData.images.length < 5) err.images = "Upload at least 5 images";
    if (!formData.about.heading.trim()) err.aboutHeading = "About heading required";
    if (!formData.about.description.trim()) err.aboutDesc = "About description required";
    if (!formData.itinerary.length) err.itinerary = "Add at least one itinerary day";
    formData.itinerary.forEach((day, idx) => {
      if (!day.heading.trim()) err[`itinerary-${idx}-heading`] = "Heading required";
      if (!day.description.trim()) err[`itinerary-${idx}-description`] = "Description required";
    });
    if (!formData.inclusions.trim()) err.inclusions = "Add inclusions";
    if (!formData.exclusions.trim()) err.exclusions = "Add exclusions";
    if (!formData.policyTerms.trim()) err.policyTerms = "Add policy & terms";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  // ──────────────────────────────────────────────────────
  // Submit
  // ──────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    try {
      const optionsPayload = buildDefaultAdventureOptions(formData);
      const sanitizedItinerary = formData.itinerary.map((day) => ({
        heading: day.heading,
        description: day.description,
      }));
      const endpoint = editId ? `/api/vendor/adventures?id=${editId}` : "/api/vendor/adventures";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          itinerary: sanitizedItinerary,
          options: optionsPayload,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.message || "Failed to create tour");
      }
      router.push("/vendor/properties/adventures");
    } catch (error: any) {
      alert(error?.message || "Failed to save tour");
    } finally {
      setSubmitting(false);
    }
  };

  if (initializing) {
    return <PageLoader />;
  }

  // ──────────────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-gray-50 text-black ">
      {/* Desktop Sidebar */}
      {/* <div className="hidden lg:block lg:sticky lg:top-0 lg:h-screen pt-15 overflow-y-auto">
              <Sidebar />
            </div> */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-sky-50 border-b lg:pt-15 pt-0">
          <div className="flex items-center gap-3 p-3">
            {/* <button
              className="lg:hidden px-3 py-2 rounded border text-gray-700"
              onClick={() => setMobileSidebarOpen(true)}
            >
              Menu
            </button> */}
            <h1 className="text-xl sm:text-2xl font-semibold">
              {isEditing ? "Edit Adventure" : "Create Adventure"}
            </h1>
          </div>
        </div>

        {/* Main Form */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6">
            {uploadError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {uploadError}
              </div>
            )}

            {/* ── Basic Info ── */}
            <section className="bg-white rounded-xl shadow p-6 space-y-4">
              <h2 className="text-xl font-semibold">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Adventure Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setField("name", e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="e.g., Everest Base Camp Trek"
                  />
                  {errors.name && <p className="text-red-600 text-sm">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleCategoryChange(e.target.value as typeof formData.category)}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="trekking">Trekking</option>
                    <option value="hiking">Hiking</option>
                    <option value="camping">Camping</option>
                    <option value="water-rafting">Water Rafting</option>
                  </select>
                </div>
              </div>
            </section>

            {/* ── Adventure details ── */}
            <section className="bg-white rounded-xl shadow p-6 space-y-4">
              <h2 className="text-xl font-semibold">Adventure details</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Duration <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setField("duration", e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    {DURATION_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  {errors.duration && <p className="text-red-600 text-sm mt-1">{errors.duration}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.price}
                    onChange={(e) => setField("price", Number(e.target.value))}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                  {errors.price && <p className="text-red-600 text-sm mt-1">{errors.price}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Capacity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.capacity}
                    onChange={(e) => setField("capacity", Number(e.target.value))}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                  {errors.capacity && <p className="text-red-600 text-sm mt-1">{errors.capacity}</p>}
                </div>
              </div>

              {shouldShowDifficultyField && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Difficulty level <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.difficultyLevel}
                    onChange={(e) => setField("difficultyLevel", e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="">Select difficulty</option>
                    {DIFFICULTY_LEVELS.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                  {errors.difficultyLevel && (
                    <p className="text-red-600 text-sm mt-1">{errors.difficultyLevel}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Features</label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {FEATURE_PRESETS.map((feature) => {
                    const selected = formData.features.includes(feature);
                    return (
                      <button
                        key={feature}
                        type="button"
                        onClick={() => toggleFeature(feature)}
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
                    value={featureDraft}
                    onChange={(e) => setFeatureDraft(e.target.value)}
                    placeholder="Add custom feature"
                    className="flex-1 px-4 py-2 border rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Add
                  </button>
                </div>
                {formData.features.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {formData.features.map((feature) => (
                      <span
                        key={feature}
                        className="inline-flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 rounded-full"
                      >
                        {feature}
                        <button
                          type="button"
                          onClick={() => toggleFeature(feature)}
                          className="text-red-600"
                        >
                          <FaTimes />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* ── Location ── */}
            <section className="bg-white rounded-xl shadow p-6 space-y-4">
              <h2 className="text-xl font-semibold">Location</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.location.address}
                    onChange={(e) =>
                      setField("location", { ...formData.location, address: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="Street & number"
                  />
                  {errors.address && <p className="text-red-600 text-sm">{errors.address}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.location.city}
                      onChange={(e) =>
                        setField("location", { ...formData.location, city: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                    {errors.city && <p className="text-red-600 text-sm">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.location.state}
                      onChange={(e) =>
                        setField("location", { ...formData.location, state: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                    {errors.state && <p className="text-red-600 text-sm">{errors.state}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.location.country}
                      onChange={(e) =>
                        setField("location", { ...formData.location, country: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                    {errors.country && <p className="text-red-600 text-sm">{errors.country}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Postal Code</label>
                    <input
                      type="text"
                      value={formData.location.postalCode}
                      onChange={(e) =>
                        setField("location", { ...formData.location, postalCode: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGetLocation}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <FaMapMarkerAlt /> Use current location
                </button>
              </div>
            </section>

            {/* ── Highlights ── */}
            <section className="bg-white rounded-xl shadow p-6 space-y-4">
              <h2 className="text-xl font-semibold">Highlights</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {HERO_HIGHLIGHTS.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => toggleArrayValue("heroHighlights", h)}
                    className={`px-3 py-2 rounded-lg border text-sm ${formData.heroHighlights.includes(h)
                        ? "bg-green-50 border-green-500 text-green-700"
                        : "border-gray-300"
                      }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customHighlight}
                  onChange={(e) => setCustomHighlight(e.target.value)}
                  placeholder="Custom highlight"
                  className="flex-1 px-4 py-2 border rounded-lg"
                />
                <button
                  type="button"
                  onClick={addCustomHighlight}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Add
                </button>
              </div>
            </section>

            {/* ── Media (Images + Gallery + Videos) ── */}
            <section className="bg-white rounded-xl shadow p-6 space-y-6">
              <h2 className="text-xl font-semibold">Media</h2>

              {/* Property Images */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Adventure Images <span className="text-red-500">*</span> (min 5)
                </label>
                <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer hover:border-green-500">
                  <FaUpload className="text-green-600" />
                  <span>Choose images</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handlePropertyImages}
                  />
                </label>
                {uploadingState[`adventures/${formData.category}/property`] && (
                  <p className="text-sm text-gray-600 mt-1">Uploading…</p>
                )}
                {formData.images.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 md:grid-cols-5 gap-2">
                    {formData.images.map((src, i) => (
                      <div key={i} className="relative group">
                        <img
                          src={src}
                          alt=""
                          className="w-full h-24 object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => removeMedia("images", i)}
                          className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {errors.images && <p className="text-red-600 text-sm mt-1">{errors.images}</p>}
              </div>

              {/* Gallery Images */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Gallery Images (optional)
                </label>
                <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer hover:border-green-500">
                  <FaImage className="text-green-600" />
                  <span>Choose gallery images</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleGalleryImages}
                  />
                </label>
                {uploadingState[`adventures/${formData.category}/gallery`] && (
                  <p className="text-sm text-gray-600 mt-1">Uploading…</p>
                )}
                {formData.gallery.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 md:grid-cols-5 gap-2">
                    {formData.gallery.map((src, i) => (
                      <div key={i} className="relative group">
                        <img
                          src={src}
                          alt=""
                          className="w-full h-24 object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => removeMedia("gallery", i)}
                          className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Videos – Inside */}
              {/* <div>
                <label className="block text-sm font-medium mb-1">
                  Inside Videos (optional)
                </label>
                <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer hover:border-green-500">
                  <FaVideo className="text-green-600" />
                  <span>Upload inside videos</span>
                  <input
                    type="file"
                    multiple
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => handleVideoUpload(e, "inside")}
                  />
                </label>
                {uploadingState[`adventures/${formData.category}/videos/inside`] && (
                  <p className="text-sm text-gray-600 mt-1">Uploading…</p>
                )}
                {formData.videos.inside.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                    {formData.videos.inside.map((src, i) => (
                      <div key={i} className="relative group">
                        <video
                          src={src}
                          className="w-full h-24 object-cover rounded"
                          controls
                        />
                        <button
                          type="button"
                          onClick={() => removeVideo("inside", i)}
                          className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div> */}

              {/* Videos – Outside */}
              {/* <div>
                <label className="block text-sm font-medium mb-1">
                  Outside Videos (optional)
                </label>
                <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer hover:border-green-500">
                  <FaVideo className="text-green-600" />
                  <span>Upload outside videos</span>
                  <input
                    type="file"
                    multiple
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => handleVideoUpload(e, "outside")}
                  />
                </label>
                {uploadingState[`adventures/${formData.category}/videos/outside`] && (
                  <p className="text-sm text-gray-600 mt-1">Uploading…</p>
                )}
                {formData.videos.outside.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                    {formData.videos.outside.map((src, i) => (
                      <div key={i} className="relative group">
                        <video
                          src={src}
                          className="w-full h-24 object-cover rounded"
                          controls
                        />
                        <button
                          type="button"
                          onClick={() => removeVideo("outside", i)}
                          className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div> */}
            </section>

            {/* ── Popular Facilities ── */}
            <section className="bg-white rounded-xl shadow p-6 space-y-4">
              <h2 className="text-xl font-semibold">Popular Facilities (quick badges)</h2>
              <div className="flex flex-wrap gap-2">
                {POPULAR_FACILITIES.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => toggleArrayValue("popularFacilities", f)}
                    className={`px-3 py-1 rounded-full text-sm border ${formData.popularFacilities.includes(f)
                        ? "bg-green-50 border-green-500 text-green-700"
                        : "border-gray-300"
                      }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </section>

            {/* ── Amenities (grouped) ── */}
            <section className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Amenities & Equipment</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {AMENITY_SECTIONS.map((sec) => (
                  <div key={sec.key}>
                    <h3 className="font-medium mb-2">{sec.label}</h3>
                    <div className="flex flex-wrap gap-2">
                      {sec.options.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => toggleAmenity(sec.key, opt)}
                          className={`px-3 py-1 rounded-full text-sm border ${formData.amenities[sec.key]?.includes(opt)
                              ? "bg-green-50 border-green-500 text-green-700"
                              : "border-gray-300"
                            }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Itinerary ── */}
            <section className="bg-white rounded-xl shadow p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Itinerary</h2>
                <button
                  type="button"
                  onClick={addItineraryDay}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <FaPlus /> Add day
                </button>
              </div>
              {errors.itinerary && <p className="text-red-600 text-sm">{errors.itinerary}</p>}
              <div className="space-y-4">
                {formData.itinerary.map((day, index) => (
                  <div key={day.id} className="rounded-xl border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Day {index + 1}</h3>
                      {formData.itinerary.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItineraryDay(day.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Heading <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={day.heading}
                          onChange={(e) => updateItineraryDay(day.id, "heading", e.target.value)}
                          className="w-full px-4 py-2 border rounded-lg"
                        />
                        {errors[`itinerary-${index}-heading`] && (
                          <p className="text-red-600 text-sm">{errors[`itinerary-${index}-heading`]}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Description <span className="text-red-500">*</span>
                        </label>
                        <div className="bg-white text-gray-900">
                          <ReactQuill
                            value={day.description}
                            onChange={(value: string) => updateItineraryDay(day.id, "description", value)}
                            modules={quillModules}
                            formats={quillFormats}
                          />
                        </div>
                        {errors[`itinerary-${index}-description`] && (
                          <p className="text-red-600 text-sm">{errors[`itinerary-${index}-description`]}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Inclusions & Exclusions ── */}
            <section className="bg-white rounded-xl shadow p-6 space-y-4">
              <h2 className="text-xl font-semibold">Inclusions & Exclusions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Inclusions <span className="text-red-500">*</span>
                  </label>
                  <div className="bg-white text-gray-900">
                    <ReactQuill
                      value={formData.inclusions}
                      onChange={(value: string) => setField("inclusions", value)}
                      modules={quillModules}
                      formats={quillFormats}
                    />
                  </div>
                  {errors.inclusions && <p className="text-red-600 text-sm mt-1">{errors.inclusions}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Exclusions <span className="text-red-500">*</span>
                  </label>
                  <div className="bg-white text-gray-900">
                    <ReactQuill
                      value={formData.exclusions}
                      onChange={(value: string) => setField("exclusions", value)}
                      modules={quillModules}
                      formats={quillFormats}
                    />
                  </div>
                  {errors.exclusions && <p className="text-red-600 text-sm mt-1">{errors.exclusions}</p>}
                </div>
              </div>
            </section>

            {/* ── Policy & Terms ── */}
            <section className="bg-white rounded-xl shadow p-6 space-y-4">
              <h2 className="text-xl font-semibold">Policy & Terms</h2>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Details <span className="text-red-500">*</span>
                </label>
                <div className="bg-white text-gray-900">
                  <ReactQuill
                    value={formData.policyTerms}
                    onChange={(value: string) => setField("policyTerms", value)}
                    modules={quillModules}
                    formats={quillFormats}
                  />
                </div>
                {errors.policyTerms && <p className="text-red-600 text-sm mt-1">{errors.policyTerms}</p>}
              </div>
            </section>

            {/* ── About & Policies ── */}
            <section className="bg-white rounded-xl shadow p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold">About the Adventure</h2>
                <input
                  type="text"
                  placeholder="Heading *"
                  value={formData.about.heading}
                  onChange={(e) =>
                    setField("about", { ...formData.about, heading: e.target.value })
                  }
                  className="w-full mt-2 px-4 py-2 border rounded-lg"
                />
                {errors.aboutHeading && (
                  <p className="text-red-600 text-sm">{errors.aboutHeading}</p>
                )}
                <textarea
                  rows={5}
                  placeholder="Description *"
                  value={formData.about.description}
                  onChange={(e) =>
                    setField("about", { ...formData.about, description: e.target.value })
                  }
                  className="w-full mt-2 px-4 py-2 border rounded-lg"
                />
                {errors.aboutDesc && <p className="text-red-600 text-sm">{errors.aboutDesc}</p>}
              </div>

              <div>
                <h3 className="text-lg font-semibold">House Rules</h3>
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="Add a rule"
                    value={newRule}
                    onChange={(e) => setNewRule(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addRule())}
                    className="flex-1 px-4 py-2 border rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={addRule}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Add
                  </button>
                </div>
                {formData.defaultHouseRules.map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-gray-100 px-3 py-2 mt-2 rounded"
                  >
                    <span>{r}</span>
                    <button
                      type="button"
                      onClick={() => removeRule(i)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Vendor Message (optional)
                </label>
                <textarea
                  rows={3}
                  value={formData.vendorMessage}
                  onChange={(e) => setField("vendorMessage", e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Default Cancellation Policy (optional)
                </label>
                <textarea
                  rows={3}
                  value={formData.defaultCancellationPolicy}
                  onChange={(e) => setField("defaultCancellationPolicy", e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
            </section>

            {/* ── Submit / Cancel ── */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 bg-green-600 text-white rounded-lg font-semibold disabled:opacity-60 hover:bg-green-700"
              >
                {submitting
                  ? isEditing
                    ? "Updating…"
                    : "Saving…"
                  : isEditing
                    ? "Update Adventure"
                    : "Create Adventure"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/vendor/adventures")}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {/* {mobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-100 bg-black/40 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-100 p-0 lg:hidden overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <span className="text-lg font-semibold">Menu</span>
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