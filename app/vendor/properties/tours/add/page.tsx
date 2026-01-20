// app/properties/tours/add/page.tsx
"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "@/app/components/Pages/vendor/Sidebar";
import { FaMapMarkerAlt, FaPlus, FaTimes, FaUpload } from "react-icons/fa";
import PageLoader from "@/app/components/common/PageLoader";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const HERO_HIGHLIGHTS = [
  "Guided tour",
  "All-inclusive",
  "Free cancellation",
  "Private group",
  "Skip the line",
  "Live guide",
  "Hotel pickup",
  "Instant confirmation",
  "Wheelchair accessible",
  "Small group",
  "Cultural experience",
];

const POPULAR_FACILITIES = [
  "Transportation",
  "Meals included",
  "Entrance fees",
  "Professional guide",
  "Insurance",
  "Bottled water",
  "Snacks",
  "Photos included",
  "Audio guide",
  "WiFi on board",
];

const AMENITY_SECTIONS: Array<{
  key: string;
  label: string;
  options: string[];
}> = [
    {
      key: "Inclusions",
      label: "Inclusions",
      options: [
        "Hotel pickup and drop-off",
        "Air-conditioned vehicle",
        "All entrance fees",
        "Lunch",
        "Bottled water",
        "Snacks",
        "Professional guide",
        "Insurance",
        "Gratuities",
      ],
    },
    {
      key: "Activities",
      label: "Activities",
      options: [
        "Sightseeing",
        "Cultural tour",
        "Historical sites",
        "Nature walk",
        "Boat ride",
        "Wildlife safari",
        "Photography stops",
        "Shopping time",
      ],
    },
    {
      key: "Accessibility",
      label: "Accessibility",
      options: [
        "Wheelchair accessible",
        "Stroller accessible",
        "Infant seats available",
        "Near public transportation",
      ],
    },
    {
      key: "Language",
      label: "Language",
      options: [
        "English",
        "Spanish",
        "French",
        "German",
        "Mandarin",
        "Hindi",
        "Arabic",
      ],
    },
    {
      key: "Safety",
      label: "Safety",
      options: [
        "First aid kit",
        "Emergency contact",
        "Licensed operator",
        "COVID-19 safety measures",
      ],
    },
  ];

const DURATION_OPTIONS = [
  "1 hour",
  "2 hours",
  "3 hours",
  "4 hours",
  "5 hours",
  "6 hours",
  "8 hours",
  "Full day (8+ hours)",
  "Multi-day",
];

const FEATURE_PRESETS = ["Private", "Group", "Family-friendly", "Photography", "Food included"];

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

export default function AddTourPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("editId");
  const isEditing = Boolean(editId);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [customHighlight, setCustomHighlight] = useState("");
  const [newRule, setNewRule] = useState("");
  const [uploadingState, setUploadingState] = useState<Record<string, boolean>>({});
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(isEditing);
  const [featureDraft, setFeatureDraft] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    category: "group-tours" as "group-tours" | "tour-packages",
    duration: "3 hours",
    price: 0,
    capacity: 10,
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
      const collection = prev[key];
      const exists = collection.includes(value);
      return {
        ...prev,
        [key]: exists ? collection.filter((item) => item !== value) : [...collection, value],
      };
    });
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

  const hydrateForm = (tour: any) => {
    const primaryOption =
      Array.isArray(tour?.options) && tour.options.length > 0 ? tour.options[0] : null;
    setFormData({
      name: tour.name ?? "",
      category: (tour.category as "group-tours" | "tour-packages") ?? "group-tours",
      duration: tour.duration ?? primaryOption?.duration ?? "3 hours",
      price: typeof tour.price === "number" ? tour.price : primaryOption?.price ?? 0,
      capacity: typeof tour.capacity === "number" ? tour.capacity : primaryOption?.capacity ?? 10,
      features: Array.isArray(tour.features) && tour.features.length
        ? tour.features
        : Array.isArray(primaryOption?.features)
          ? primaryOption.features
          : [],
      location: {
        address: tour.location?.address ?? "",
        city: tour.location?.city ?? "",
        state: tour.location?.state ?? "",
        country: tour.location?.country ?? "",
        postalCode: tour.location?.postalCode ?? "",
        coordinates: {
          lat: tour.location?.coordinates?.lat ?? 0,
          lng: tour.location?.coordinates?.lng ?? 0,
        },
      },
      heroHighlights: tour.heroHighlights ?? [],
      images: tour.images ?? [],
      gallery: tour.gallery ?? [],
      videos: {
        inside: tour.videos?.inside ?? [],
        outside: tour.videos?.outside ?? [],
      },
      popularFacilities: tour.popularFacilities ?? [],
      amenities: tour.amenities
        ? Object.fromEntries(Object.entries(tour.amenities))
        : {},
      about: {
        heading: tour.about?.heading ?? "",
        description: tour.about?.description ?? "",
      },
      itinerary:
        Array.isArray(tour.itinerary) && tour.itinerary.length
          ? tour.itinerary.map((day: any, index: number) => ({
            id: `${Date.now()}-${index}`,
            heading: day.heading ?? `Day ${index + 1}`,
            description: day.description ?? "",
          }))
          : [createItineraryDay(1)],
      inclusions: tour.inclusions ?? "",
      exclusions: tour.exclusions ?? "",
      policyTerms: tour.policyTerms ?? "",
      vendorMessage: tour.vendorMessage ?? "",
      defaultCancellationPolicy: tour.defaultCancellationPolicy ?? "",
      defaultHouseRules: tour.defaultHouseRules ?? [],
    });
  };

  useEffect(() => {
    if (!editId) return;

    const loadTour = async () => {
      setInitializing(true);
      try {
        const res = await fetch(`/api/vendor/tours?id=${editId}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok || !data.success || !data.tour) {
          throw new Error(data?.message || "Failed to load tour details");
        }
        hydrateForm(data.tour);
      } catch (error: any) {
        alert(error?.message || "Unable to load tour for editing");
        router.push("/vendor/properties/tours");
      } finally {
        setInitializing(false);
      }
    };

    loadTour();
  }, [editId, router]);

  const uploadMedia = async (files: File[], folder: string) => {
    if (!files.length) return [] as string[];
    setUploadingState((prev) => ({ ...prev, [folder]: true }));
    setUploadError(null);

    const form = new FormData();
    files.forEach((file) => form.append("files", file));
    form.append("folder", folder);

    try {
      const res = await fetch("/api/uploads/tours", {
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
    const uploaded = await uploadMedia(files, `tours/${formData.category}/property`);
    if (uploaded.length) {
      setFormData((prev) => ({ ...prev, images: [...prev.images, ...uploaded] }));
    }
    event.target.value = "";
  };

  const handleGalleryImages = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const uploaded = await uploadMedia(files, `tours/${formData.category}/gallery`);
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
    const uploaded = await uploadMedia(files, `tours/${formData.category}/videos/${key}`);
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

  const addRule = () => {
    if (!newRule.trim()) return;
    setFormData((prev) => ({
      ...prev,
      defaultHouseRules: [...prev.defaultHouseRules, newRule.trim()],
    }));
    setNewRule("");
  };

  const removeRule = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      defaultHouseRules: prev.defaultHouseRules.filter((_, i) => i !== index),
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
        alert("Could not get location. Enter manually if needed.");
      }
    );
  };

  const buildDefaultTourOptions = (data: typeof formData) => {
    const optionImages = data.images.slice(0, 3);
    if (optionImages.length < 3) {
      throw new Error("Please upload at least 3 images to create a tour option.");
    }

    const flattenedAmenities = Object.values(data.amenities || {}).reduce<string[]>(
      (acc, section) => (Array.isArray(section) ? acc.concat(section) : acc),
      []
    );

    return [
      {
        name: data.name.trim(),
        description: data.about.description,
        duration: data.duration,
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

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = "Tour name is required";
    if (!formData.location.address.trim()) errs.address = "Address is required";
    if (!formData.location.city.trim()) errs.city = "City is required";
    if (!formData.location.state.trim()) errs.state = "State is required";
    if (!formData.location.country.trim()) errs.country = "Country is required";
    if (formData.images.length < 5) errs.images = "Upload at least 5 tour images";
    if (!formData.about.heading.trim()) errs.aboutHeading = "About heading is required";
    if (!formData.about.description.trim()) errs.aboutDescription = "Tour description is required";
    if (!formData.duration) errs.duration = "Duration is required";
    if (formData.capacity < 1) errs.capacity = "Capacity must be at least 1";
    if (formData.price <= 0) errs.price = "Price must be greater than 0";
    if (!formData.itinerary.length) errs.itinerary = "Add at least one itinerary day";
    formData.itinerary.forEach((day, idx) => {
      if (!day.heading.trim()) errs[`itinerary-${idx}-heading`] = "Heading is required";
      if (!day.description.trim()) errs[`itinerary-${idx}-description`] = "Description is required";
    });
    if (!formData.inclusions.trim()) errs.inclusions = "Add inclusions";
    if (!formData.exclusions.trim()) errs.exclusions = "Add exclusions";
    if (!formData.policyTerms.trim()) errs.policyTerms = "Add policy & terms";

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
      const optionsPayload = buildDefaultTourOptions(formData);
      const endpoint = editId ? `/api/vendor/tours?id=${editId}` : "/api/vendor/tours";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          options: optionsPayload,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.message || "Failed to create tour");
      }
      router.push("/vendor/properties/tours");
    } catch (error: any) {
      alert(error?.message || "Failed to save tour");
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
              Menu
            </button> */}
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
              {isEditing ? "Edit tour" : "Create a new tour"}
            </h1>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6">
            {uploadError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {uploadError}
              </div>
            )}

            {/* Basic info */}
            <section className="bg-white rounded-xl shadow p-6 space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Basic information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Tour name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setField("name", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                    placeholder="e.g., Golden Triangle Tour"
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
                    <option value="group-tours">Group Tours</option>
                    <option value="tour-packages">Tour Packages</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Tour details */}
            <section className="bg-white rounded-xl shadow p-6 space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Tour details</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Duration <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setField("duration", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
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
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.price}
                    onChange={(e) => setField("price", Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                  />
                  {errors.price && <p className="text-red-600 text-sm mt-1">{errors.price}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Capacity (guests) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.capacity}
                    onChange={(e) => setField("capacity", Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                  />
                  {errors.capacity && <p className="text-red-600 text-sm mt-1">{errors.capacity}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Features</label>
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
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
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
                        className="inline-flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 rounded-full text-gray-900"
                      >
                        {feature}
                        <button type="button" onClick={() => toggleFeature(feature)} className="text-red-600">
                          <FaTimes />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Location */}
            <section className="bg-white rounded-xl shadow p-6 space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Tour Location</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Starting Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.location.address}
                    onChange={(e) => setField("location", { ...formData.location, address: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                    placeholder="Pickup point or main location"
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
              <h2 className="text-xl font-semibold text-gray-900">Highlights & Facilities</h2>
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

            {/* Media */}
            <section className="bg-white rounded-xl shadow p-6 space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Media</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Tour images <span className="text-red-500">*</span> (min 5)
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
                  {uploadingState[`tours/${formData.category}/property`] && (
                    <p className="text-sm text-gray-600 mt-1">Uploading…</p>
                  )}
                  {errors.images && <p className="text-red-600 text-sm mt-1">{errors.images}</p>}
                  {formData.images.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                      {formData.images.map((src, i) => (
                        <div key={src + i} className="relative">
                          <img src={src} alt="" className="w-full h-32 object-cover rounded-lg" />
                          <button
                            type="button"
                            onClick={() => removeMedia("images", i)}
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
                    <span>Add more images</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleGalleryImages}
                    />
                  </label>
                  {formData.gallery.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                      {formData.gallery.map((src, i) => (
                        <div key={src + i} className="relative">
                          <img src={src} alt="" className="w-full h-32 object-cover rounded-lg" />
                          <button
                            type="button"
                            onClick={() => removeMedia("gallery", i)}
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
                        {key === "inside" ? "Inside videos" : "Outside videos"}
                      </label>
                      <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 text-gray-900">
                        <FaUpload className="text-gray-600" />
                        <span>Select videos</span>
                        <input
                          type="file"
                          multiple
                          accept="video/*"
                          className="hidden"
                          onChange={(e) => handleVideoUpload(e, key as "inside" | "outside")}
                        />
                      </label>
                      {formData.videos[key as "inside" | "outside"].length > 0 && (
                        <ul className="mt-2 space-y-2">
                          {formData.videos[key as "inside" | "outside"].map((url, i) => (
                            <li key={url + i} className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-lg">
                              <span className="truncate text-sm text-gray-900">Video {i + 1}</span>
                              <button
                                type="button"
                                onClick={() => removeVideo(key as "inside" | "outside", i)}
                                className="text-red-600"
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
              <h2 className="text-xl font-semibold text-gray-900">Inclusions & Amenities</h2>
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

            {/* Itinerary */}
            <section className="bg-white rounded-xl shadow p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Itinerary</h2>
                <button
                  type="button"
                  onClick={addItineraryDay}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <FaPlus /> Add day
                </button>
              </div>
              {errors.itinerary && <p className="text-red-600 text-sm">{errors.itinerary}</p>}
              <div className="space-y-6">
                {formData.itinerary.map((day, index) => (
                  <div key={day.id} className="border border-gray-200 rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Day {index + 1}</h3>
                      {formData.itinerary.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItineraryDay(day.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        Heading <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={day.heading}
                        onChange={(e) => updateItineraryDay(day.id, "heading", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                        placeholder="e.g., Arrival and welcome"
                      />
                      {errors[`itinerary-${index}-heading`] && (
                        <p className="text-red-600 text-sm mt-1">{errors[`itinerary-${index}-heading`]}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
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
                        <p className="text-red-600 text-sm mt-1">{errors[`itinerary-${index}-description`]}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Inclusions & Exclusions */}
            <section className="bg-white rounded-xl shadow p-6 space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Inclusions & Exclusions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
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
                  <label className="block text-sm font-medium text-gray-900 mb-1">
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

            {/* Policy & Terms */}
            <section className="bg-white rounded-xl shadow p-6 space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Policy & Terms</h2>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
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

            {/* About & Policies */}
            <section className="bg-white rounded-xl shadow p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">About this tour</h2>
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
                      placeholder="Describe the tour experience, itinerary, and highlights"
                    />
                    {errors.aboutDescription && (
                      <p className="text-red-600 text-sm mt-1">{errors.aboutDescription}</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900">Cancellation Policy</h3>
                <textarea
                  rows={3}
                  value={formData.defaultCancellationPolicy}
                  onChange={(e) => setField("defaultCancellationPolicy", e.target.value)}
                  className="mt-3 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                  placeholder="e.g., Free cancellation up to 24 hours before tour"
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900">House Rules</h3>
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={newRule}
                    onChange={(e) => setNewRule(e.target.value)}
                    placeholder="Add a rule"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addRule())}
                  />
                  <button
                    type="button"
                    onClick={addRule}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Add
                  </button>
                </div>
                {formData.defaultHouseRules.length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {formData.defaultHouseRules.map((rule, i) => (
                      <li key={rule + i} className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-lg text-gray-900">
                        <span>{rule}</span>
                        <button
                          type="button"
                          onClick={() => removeRule(i)}
                          className="text-red-600"
                        >
                          <FaTimes />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Vendor message</label>
                <textarea
                  rows={4}
                  value={formData.vendorMessage}
                  onChange={(e) => setField("vendorMessage", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                  placeholder="Any special note for guests"
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
                    : "Creating…"
                  : isEditing
                    ? "Update Tour"
                    : "Create Tour"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/vendor/tours")}
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
            className="fixed inset-0 z-100 bg-black/40 lg:hidden"
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