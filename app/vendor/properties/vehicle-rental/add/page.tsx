// app/properties/vehicle-rental/add/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "@/app/components/Pages/vendor/Sidebar";
import { FaMapMarkerAlt, FaPlus, FaTimes, FaUpload, FaCar, FaMotorcycle, FaTrash } from "react-icons/fa";
import PageLoader from "@/app/components/common/PageLoader";

const HERO_HIGHLIGHTS = [
  "Free cancellation",
  "Insurance included",
  "Unlimited mileage",
  "GPS included",
  "Child seat available",
  "24/7 support",
  "Fuel included",
  "Airport pickup",
  "No hidden fees",
  "Premium sound system",
  "Helmets"
];

const POPULAR_FACILITIES = [
  "Air conditioning",
  "Bluetooth",
  "USB ports",
  "Backup camera",
  "Cruise control",
  "Sunroof",
  "Leather seats",
  "Automatic transmission",
];

const AMENITY_SECTIONS: Array<{
  key: string;
  label: string;
  options: string[];
}> = [
    {
      key: "Interior",
      label: "Interior Features",
      options: [
        "Air conditioning",
        "Heated seats",
        "Leather seats",
        "Sunroof",
        "Premium audio",
        "Touchscreen",
        "Bluetooth",
        "USB ports",
      ],
    },
    {
      key: "Safety",
      label: "Safety",
      options: [
        "ABS",
        "Airbags",
        "Backup camera",
        "Lane assist",
        "Parking sensors",
        "Traction control",
        "Child seat anchor",
        "First aid kit",
      ],
    },
    {
      key: "Convenience",
      label: "Convenience",
      options: [
        "Keyless entry",
        "Remote start",
        "Cruise control",
        "GPS navigation",
        "Apple CarPlay",
        "Android Auto",
        "Wireless charging",
        "360 camera",
      ],
    },
  ];

const VEHICLE_TYPES = [
  "Sedan",
  "SUV",
  "Hatchback",
  "Luxury",
  "Convertible",
  "Van",
  "Electric",
  "Hybrid",
];

type DriverInfoForm = {
  name: string;
  age: string;
  experienceYears: string;
};

type OptionForm = {
  model: string;
  description: string;
  type: string;
  pricePerDay: number;
  features: string[];
  images: string[];
  available: number;
  driver: DriverInfoForm;
};

const createDefaultOption = (): OptionForm => ({
  model: "",
  description: "",
  type: "Sedan",
  pricePerDay: 0,
  features: [],
  images: [],
  available: 1,
  driver: {
    name: "",
    age: "",
    experienceYears: "",
  },
});

export default function AddVehicleRentalPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("editId");
  const isEditing = Boolean(editId);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [customHighlight, setCustomHighlight] = useState("");
  const [newRule, setNewRule] = useState("");
  const [newHouseRule, setNewHouseRule] = useState("");
  const [optionFeatureDrafts, setOptionFeatureDrafts] = useState<Record<number, string>>({});
  const [uploadingState, setUploadingState] = useState<Record<string, boolean>>({});
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(isEditing);

  const [formData, setFormData] = useState({
    name: "",
    category: "cars-rental" as "cars-rental" | "bikes-rentals" | "car-with-driver",
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
    options: [createDefaultOption()],
    about: {
      heading: "",
      description: "",
    },
    checkInOutRules: {
      pickup: "",
      dropoff: "",
      rules: [] as string[],
    },
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

  const updateOption = <K extends keyof OptionForm>(idx: number, key: K, value: OptionForm[K]) => {
    setFormData((prev) => {
      const opts = [...prev.options];
      opts[idx] = { ...opts[idx], [key]: value };
      return { ...prev, options: opts };
    });
  };

  const updateDriverField = (idx: number, key: keyof DriverInfoForm, value: string) => {
    const currentDriver = formData.options[idx]?.driver ?? { name: "", age: "", experienceYears: "" };
    updateOption(idx, "driver", { ...currentDriver, [key]: value });
  };

  const addOption = () => setFormData((prev) => ({ ...prev, options: [...prev.options, createDefaultOption()] }));
  const removeOption = (idx: number) =>
    setFormData((prev) => ({ ...prev, options: prev.options.filter((_, i) => i !== idx) }));

  const hydrateForm = (rental: any) => {
    setFormData({
      name: rental.name ?? "",
      category: (rental.category as "cars-rental" | "bikes-rentals" | "car-with-driver") ?? "cars-rental",
      location: {
        address: rental.location?.address ?? "",
        city: rental.location?.city ?? "",
        state: rental.location?.state ?? "",
        country: rental.location?.country ?? "",
        postalCode: rental.location?.postalCode ?? "",
        coordinates: {
          lat: rental.location?.coordinates?.lat ?? 0,
          lng: rental.location?.coordinates?.lng ?? 0,
        },
      },
      heroHighlights: rental.heroHighlights ?? [],
      images: rental.images ?? [],
      gallery: rental.gallery ?? [],
      videos: {
        inside: rental.videos?.inside ?? [],
        outside: rental.videos?.outside ?? [],
      },
      popularFacilities: rental.popularFacilities ?? [],
      amenities: rental.amenities ? Object.fromEntries(Object.entries(rental.amenities)) : {},
      options:
        Array.isArray(rental.options) && rental.options.length
          ? rental.options.map((option: any) => ({
            model: option.model ?? "",
            description: option.description ?? "",
            type: option.type ?? "Sedan",
            pricePerDay: option.pricePerDay ?? 0,
            features: option.features ?? [],
            images: option.images ?? [],
            available: option.available ?? 1,
            driver: {
              name: option.driver?.name ?? "",
              age: option.driver?.age != null ? String(option.driver.age) : "",
              experienceYears:
                option.driver?.experienceYears != null ? String(option.driver.experienceYears) : "",
            },
          }))
          : [createDefaultOption()],
      about: {
        heading: rental.about?.heading ?? "",
        description: rental.about?.description ?? "",
      },
      checkInOutRules: {
        pickup: rental.checkInOutRules?.pickup ?? "",
        dropoff: rental.checkInOutRules?.dropoff ?? "",
        rules: rental.checkInOutRules?.rules ?? [],
      },
      vendorMessage: rental.vendorMessage ?? "",
      defaultCancellationPolicy: rental.defaultCancellationPolicy ?? "",
      defaultHouseRules: rental.defaultHouseRules ?? [],
    });
  };

  useEffect(() => {
    if (!editId) return;

    const loadRental = async () => {
      setInitializing(true);
      try {
        const res = await fetch(`/api/vendor/vehicle-rental?id=${editId}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok || !data.success || !data.rental) {
          throw new Error(data?.message || "Failed to load rental details");
        }
        hydrateForm(data.rental);
      } catch (error: any) {
        alert(error?.message || "Unable to load rental for editing");
        router.push("/vendor/properties/vehicle-rental");
      } finally {
        setInitializing(false);
      }
    };

    loadRental();
  }, [editId, router]);

  const uploadMedia = async (files: File[], folder: string) => {
    if (!files.length) return [] as string[];
    setUploadingState((prev) => ({ ...prev, [folder]: true }));
    setUploadError(null);

    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    form.append("folder", folder);

    try {
      const res = await fetch("/api/uploads/vehicle-rentals", {
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

  const handlePropertyImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const uploaded = await uploadMedia(files, `vehicle-rentals/${formData.category}/property`);
    if (uploaded.length) setFormData((p) => ({ ...p, images: [...p.images, ...uploaded] }));
    e.target.value = "";
  };

  const handleGalleryImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const uploaded = await uploadMedia(files, `vehicle-rentals/${formData.category}/gallery`);
    if (uploaded.length) setFormData((p) => ({ ...p, gallery: [...p.gallery, ...uploaded] }));
    e.target.value = "";
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "inside" | "outside") => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const uploaded = await uploadMedia(files, `vehicle-rentals/${formData.category}/videos/${type}`);
    if (uploaded.length) {
      setFormData((p) => ({
        ...p,
        videos: { ...p.videos, [type]: [...p.videos[type], ...uploaded] },
      }));
    }
    e.target.value = "";
  };

  const handleOptionImages = async (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const uploaded = await uploadMedia(files, `vehicle-rentals/${formData.category}/options/${idx + 1}`);
    if (uploaded.length) updateOption(idx, "images", [...formData.options[idx].images, ...uploaded]);
    e.target.value = "";
  };

  const removeMedia = (key: "images" | "gallery", i: number) => {
    setFormData((p) => ({ ...p, [key]: p[key].filter((_, idx) => idx !== i) }));
  };
  const removeVideo = (type: "inside" | "outside", i: number) => {
    setFormData((p) => ({
      ...p,
      videos: { ...p.videos, [type]: p.videos[type].filter((_, idx) => idx !== i) },
    }));
  };
  const removeOptionImage = (optIdx: number, imgIdx: number) => {
    updateOption(optIdx, "images", formData.options[optIdx].images.filter((_, i) => i !== imgIdx));
  };

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

  const addOptionFeature = (idx: number) => {
    const draft = optionFeatureDrafts[idx]?.trim();
    if (!draft) return;
    updateOption(idx, "features", [...formData.options[idx].features, draft]);
    setOptionFeatureDrafts((p) => ({ ...p, [idx]: "" }));
  };

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

  const validate = () => {
    const err: Record<string, string> = {};
    if (!formData.name.trim()) err.name = "Rental name required";
    if (!formData.location.address.trim()) err.address = "Address required";
    if (!formData.location.city.trim()) err.city = "City required";
    if (!formData.location.state.trim()) err.state = "State required";
    if (!formData.location.country.trim()) err.country = "Country required";
    if (formData.images.length < 5) err.images = "Upload at least 5 images";
    if (!formData.about.heading.trim()) err.aboutHeading = "About heading required";
    if (!formData.about.description.trim()) err.aboutDesc = "About description required";
    if (!formData.checkInOutRules.pickup.trim()) err.pickup = "Pickup time required";
    if (!formData.checkInOutRules.dropoff.trim()) err.dropoff = "Dropoff time required";
    if (!formData.options.length) err.options = "Add at least one vehicle";

    formData.options.forEach((opt, i) => {
      if (!opt.model.trim()) err[`opt-${i}-model`] = "Model required";
      if (!opt.type) err[`opt-${i}-type`] = "Type required";
      if (opt.pricePerDay <= 0) err[`opt-${i}-price`] = "Price > 0";
      if (opt.images.length < 3) err[`opt-${i}-images`] = "Min 3 images per vehicle";
      if (formData.category === "car-with-driver") {
        if (!opt.driver?.name?.trim()) err[`opt-${i}-driver-name`] = "Driver name required";
        if (!opt.driver?.age?.trim()) err[`opt-${i}-driver-age`] = "Driver age required";
        if (!opt.driver?.experienceYears?.trim()) err[`opt-${i}-driver-exp`] = "Driver experience required";
      }
    });

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    try {
      const endpoint = editId ? `/api/vendor/vehicle-rental?id=${editId}` : "/api/vendor/vehicle-rental";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data?.message ?? "Failed");
      router.push("/vendor/properties/vehicle-rental");
    } catch (err: any) {
      alert(err?.message ?? "Failed to save rental");
    } finally {
      setSubmitting(false);
    }
  };

  if (initializing) {
    return <PageLoader />;
  }

  return (
    <div className="flex h-screen bg-gray-50 text-black ">
      {/* Desktop Sidebar */}
      {/* <div className="hidden lg:block lg:sticky lg:top-0 lg:h-screen pt-15 overflow-y-auto">
                   <Sidebar />
                 </div> */}

      <div className="flex-1 flex flex-col">
        <div className="sticky top-0 z-40 bg-sky-50 border-b lg:pt-15 pt-0 ">
          <div className="flex items-center gap-3 p-3 ">
            {/* <button
              className="lg:hidden px-3 py-2 rounded border text-gray-700"
              onClick={() => setMobileSidebarOpen(true)}
            >
              Menu
            </button> */}
            <h1 className="text-xl sm:text-2xl font-semibold flex items-center gap-2">
              {formData.category === "cars-rental" || formData.category === "car-with-driver" ? <FaCar /> : <FaMotorcycle />}
              {isEditing ? "Edit Vehicle Rental" : "Create Vehicle Rental"}
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

            {/* Basic Info */}
            <section className="bg-white rounded-xl shadow p-6 space-y-4">
              <h2 className="text-xl font-semibold">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Rental Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setField("name", e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="e.g., Luxury Car Rental Delhi"
                  />
                  {errors.name && <p className="text-red-600 text-sm">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setField("category", e.target.value as any)}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="cars-rental">Cars</option>
                    <option value="bikes-rentals">Bikes</option>
                    <option value="car-with-driver">Car with Driver</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Location */}
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
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <FaMapMarkerAlt /> Use current location
                </button>
              </div>
            </section>

            {/* Highlights */}
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

            {/* Media */}
            <section className="bg-white rounded-xl shadow p-6 space-y-6">
              <h2 className="text-xl font-semibold">Media</h2>

              {/* Property Images */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Rental Images <span className="text-red-500">*</span> (min 5)
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
                {formData.images.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 md:grid-cols-5 gap-2">
                    {formData.images.map((src, i) => (
                      <div key={i} className="relative group">
                        <img src={src} alt="" className="w-full h-24 object-cover rounded" />
                        <button
                          type="button"
                          onClick={() => removeMedia("images", i)}
                          className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {errors.images && <p className="text-red-600 text-sm mt-1">{errors.images}</p>}
              </div>
            </section>

            {/* Vehicle Options */}
            <section className="bg-white rounded-xl shadow p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Vehicles</h2>
                <button
                  type="button"
                  onClick={addOption}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <FaPlus /> Add Vehicle
                </button>
              </div>

              {formData.options.map((opt, idx) => (
                <div key={idx} className="border rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Vehicle {idx + 1}</h3>
                    {formData.options.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeOption(idx)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Model <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={opt.model}
                        onChange={(e) => updateOption(idx, "model", e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg"
                        placeholder="e.g., Toyota Camry"
                      />
                      {errors[`opt-${idx}-model`] && (
                        <p className="text-red-600 text-sm">{errors[`opt-${idx}-model`]}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={opt.type}
                        onChange={(e) => updateOption(idx, "type", e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg"
                      >
                        {VEHICLE_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Price per Day (₹) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={opt.pricePerDay}
                        onChange={(e) => updateOption(idx, "pricePerDay", Number(e.target.value))}
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                      {errors[`opt-${idx}-price`] && (
                        <p className="text-red-600 text-sm">{errors[`opt-${idx}-price`]}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <textarea
                        rows={3}
                        value={opt.description}
                        onChange={(e) => updateOption(idx, "description", e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg"
                        placeholder="Vehicle description and features"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Available Quantity <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        min={1}
                        value={opt.available || 1}
                        onChange={(e) => updateOption(idx, "available", Number(e.target.value))}
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Features</label>
                      <div className="flex flex-col gap-2">
                        <input
                          type="text"
                          value={optionFeatureDrafts[idx] || ""}
                          onChange={(e) => setOptionFeatureDrafts((p) => ({ ...p, [idx]: e.target.value }))}
                          placeholder="Add feature"
                          className="flex-1 px-4 py-2 border rounded-lg"
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addOptionFeature(idx);
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => addOptionFeature(idx)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          Add
                        </button>
                      </div>
                      {opt.features.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {opt.features.map((f, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 rounded-full"
                            >
                              {f}
                              <button
                                type="button"
                                onClick={() => updateOption(idx, "features", opt.features.filter((_, idx) => idx !== i))}
                                className="text-red-600"
                              >
                                <FaTimes />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {formData.category === "car-with-driver" && (
                      <div className="md:col-span-2 rounded-xl border border-dashed border-green-200 bg-green-50/40 p-4">
                        <p className="text-sm font-semibold text-green-800">Driver details <span className="text-red-500">*</span></p>
                        <p className="text-xs text-green-700 mb-3">
                          Driver information is required for car with driver rentals.
                        </p>
                        <div className="grid gap-4 md:grid-cols-3">
                          <div>
                            <label className="block text-xs font-medium uppercase tracking-wide text-green-900">
                              Driver name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={opt.driver?.name ?? ""}
                              onChange={(e) => updateDriverField(idx, "name", e.target.value)}
                              className="mt-1 w-full rounded-lg border border-green-200 px-3 py-2 text-sm"
                              placeholder="e.g., Rajesh Kumar"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium uppercase tracking-wide text-green-900">
                              Age <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              min={18}
                              value={opt.driver?.age ?? ""}
                              onChange={(e) => updateDriverField(idx, "age", e.target.value)}
                              className="mt-1 w-full rounded-lg border border-green-200 px-3 py-2 text-sm"
                              placeholder="35"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium uppercase tracking-wide text-green-900">
                              Experience (years) <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              min={0}
                              value={opt.driver?.experienceYears ?? ""}
                              onChange={(e) => updateDriverField(idx, "experienceYears", e.target.value)}
                              className="mt-1 w-full rounded-lg border border-green-200 px-3 py-2 text-sm"
                              placeholder="10"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Vehicle Images <span className="text-red-500">*</span> (min 3)
                      </label>
                      <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer hover:border-green-500">
                        <FaUpload className="text-green-600" />
                        <span>Select images</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleOptionImages(e, idx)}
                        />
                      </label>
                      {errors[`opt-${idx}-images`] && (
                        <p className="text-red-600 text-sm mt-1">{errors[`opt-${idx}-images`]}</p>
                      )}
                      {opt.images.length > 0 && (
                        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                          {opt.images.map((src, i) => (
                            <div key={i} className="relative">
                              <img src={src} alt="" className="w-full h-28 object-cover rounded-lg" />
                              <button
                                type="button"
                                onClick={() => removeOptionImage(idx, i)}
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
                </div>
              ))}
            </section>

            {/* Gallery */}
            <section className="bg-white rounded-xl shadow p-6 space-y-4">
              <h2 className="text-xl font-semibold">Gallery Images (optional)</h2>
              <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer hover:border-green-500">
                <FaUpload className="text-green-600" />
                <span>Add gallery images</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleGalleryImages}
                />
              </label>
              {formData.gallery.length > 0 && (
                <div className="mt-3 grid grid-cols-3 md:grid-cols-5 gap-2">
                  {formData.gallery.map((src, i) => (
                    <div key={i} className="relative group">
                      <img src={src} alt="" className="w-full h-24 object-cover rounded" />
                      <button
                        type="button"
                        onClick={() => removeMedia("gallery", i)}
                        className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* <section className="bg-white rounded-xl shadow p-6 space-y-4">
              <h2 className="text-xl font-semibold">Videos (optional)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Inside Videos</label>
                  <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer hover:border-green-500">
                    <FaUpload className="text-green-600" />
                    <span>Select videos</span>
                    <input
                      type="file"
                      multiple
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => handleVideoUpload(e, "inside")}
                    />
                  </label>
                  {formData.videos.inside.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {formData.videos.inside.map((src, i) => (
                        <div key={i} className="relative group">
                          <video src={src} className="w-full h-24 object-cover rounded" controls />
                          <button
                            type="button"
                            onClick={() => removeVideo("inside", i)}
                            className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Outside Videos</label>
                  <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer hover:border-green-500">
                    <FaUpload className="text-green-600" />
                    <span>Select videos</span>
                    <input
                      type="file"
                      multiple
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => handleVideoUpload(e, "outside")}
                    />
                  </label>
                  {formData.videos.outside.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {formData.videos.outside.map((src, i) => (
                        <div key={i} className="relative group">
                          <video src={src} className="w-full h-24 object-cover rounded" controls />
                          <button
                            type="button"
                            onClick={() => removeVideo("outside", i)}
                            className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section> */}

            {/* Popular Facilities */}
            <section className="bg-white rounded-xl shadow p-6 space-y-4">
              <h2 className="text-xl font-semibold">Popular Facilities</h2>
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

            {/* Amenities */}
            <section className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Amenities & Features</h2>
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

            {/* About */}
            <section className="bg-white rounded-xl shadow p-6 space-y-4">
              <h2 className="text-xl font-semibold">About</h2>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Heading <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.about.heading}
                  onChange={(e) => setField("about", { ...formData.about, heading: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="e.g., About Our Vehicle Rental"
                />
                {errors.aboutHeading && <p className="text-red-600 text-sm mt-1">{errors.aboutHeading}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={5}
                  value={formData.about.description}
                  onChange={(e) => setField("about", { ...formData.about, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Describe your vehicle rental service..."
                />
                {errors.aboutDesc && <p className="text-red-600 text-sm mt-1">{errors.aboutDesc}</p>}
              </div>
            </section>

            {/* Check In/Out Rules */}
            <section className="bg-white rounded-xl shadow p-6 space-y-4">
              <h2 className="text-xl font-semibold">Pickup & Dropoff</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Pickup Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.checkInOutRules.pickup}
                    onChange={(e) =>
                      setField("checkInOutRules", { ...formData.checkInOutRules, pickup: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="e.g., 9:00 AM"
                  />
                  {errors.pickup && <p className="text-red-600 text-sm mt-1">{errors.pickup}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Dropoff Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.checkInOutRules.dropoff}
                    onChange={(e) =>
                      setField("checkInOutRules", { ...formData.checkInOutRules, dropoff: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="e.g., 6:00 PM"
                  />
                  {errors.dropoff && <p className="text-red-600 text-sm mt-1">{errors.dropoff}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Additional Rules</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newRule}
                    onChange={(e) => setNewRule(e.target.value)}
                    placeholder="Add a rule"
                    className="flex-1 px-4 py-2 border rounded-lg"
                    onKeyPress={(e) => {
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
                  <div className="mt-2 space-y-1">
                    {formData.checkInOutRules.rules.map((rule, i) => (
                      <div key={i} className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded">
                        <span className="text-sm">{rule}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((p) => ({
                              ...p,
                              checkInOutRules: {
                                ...p.checkInOutRules,
                                rules: p.checkInOutRules.rules.filter((_, idx) => idx !== i),
                              },
                            }));
                          }}
                          className="text-red-600"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Vendor Message */}
            <section className="bg-white rounded-xl shadow p-6 space-y-4">
              <h2 className="text-xl font-semibold">Vendor Message (optional)</h2>
              <textarea
                rows={3}
                value={formData.vendorMessage}
                onChange={(e) => setField("vendorMessage", e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Special message for customers..."
              />
            </section>

            {/* Cancellation Policy */}
            <section className="bg-white rounded-xl shadow p-6 space-y-4">
              <h2 className="text-xl font-semibold">Cancellation Policy (optional)</h2>
              <textarea
                rows={4}
                value={formData.defaultCancellationPolicy}
                onChange={(e) => setField("defaultCancellationPolicy", e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Describe your cancellation policy..."
              />
            </section>

            {/* House Rules */}
            <section className="bg-white rounded-xl shadow p-6 space-y-4">
              <h2 className="text-xl font-semibold">House Rules (optional)</h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newHouseRule}
                  onChange={(e) => setNewHouseRule(e.target.value)}
                  placeholder="Add a house rule"
                  className="flex-1 px-4 py-2 border rounded-lg"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const rule = newHouseRule.trim();
                      if (rule) {
                        setFormData((p) => ({ ...p, defaultHouseRules: [...p.defaultHouseRules, rule] }));
                        setNewHouseRule("");
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const rule = newHouseRule.trim();
                    if (rule) {
                      setFormData((p) => ({ ...p, defaultHouseRules: [...p.defaultHouseRules, rule] }));
                      setNewHouseRule("");
                    }
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Add
                </button>
              </div>
              {formData.defaultHouseRules.length > 0 && (
                <div className="mt-2 space-y-1">
                  {formData.defaultHouseRules.map((rule, i) => (
                    <div key={i} className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded">
                      <span className="text-sm">{rule}</span>
                      <button
                        type="button"
                        onClick={() => removeRule(i)}
                        className="text-red-600"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Submit */}
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
                    ? "Update Rental"
                    : "Create Rental"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/vendor/properties/vehicle-rental")}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
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
            <div className="p-4 border-b flex items-center justify-between mt-10">
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