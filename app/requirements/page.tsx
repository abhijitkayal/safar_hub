"use client";

import { useEffect, useState } from "react";
import { FaPlus, FaTimes, FaCheckCircle } from "react-icons/fa";

type Requirement = {
  _id: string;
  title: string;
  categories: string[];
  description?: string;
  status: "open" | "closed";
  createdAt: string;
};

const CATEGORY_OPTIONS = [
  { label: "Stays", value: "stays" },
  // { label: "BnB", value: "bnb" },
  // { label: "Resorts", value: "resorts" },
  // { label: "Hotels", value: "hotels" },
  { label: "Vehicle Rent", value: "vehicle-rent" },
  { label: "Market Place", value: "market-place" },
  { label: "Tour", value: "tour" },
   { label: "Adventure", value: "adventure" },
];

export default function UserRequirementsPage() {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 🔹 LOAD USER REQUIREMENTS
  const loadRequirements = async () => {
    try {
      const res = await fetch("/api/requirements", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setRequirements(data.requirements || []);
      }
    } catch {
      setError("Failed to load requirements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequirements();
  }, []);

  // 🔹 CATEGORY TOGGLE
  const toggleCategory = (value: string) => {
    setSelectedCategories((prev) =>
      prev.includes(value)
        ? prev.filter((c) => c !== value)
        : [...prev, value]
    );
  };

  // 🔹 SUBMIT FORM
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    console.log("Submitting requirement...");
    console.log("Title:", title);
    console.log("Categories:", selectedCategories);
    console.log("Description:", description);

    if (!title.trim() || selectedCategories.length === 0) {
      const errorMsg = "Title and at least one category are required";
      setError(errorMsg);
      console.error("Validation error:", errorMsg);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title,
        categories: selectedCategories,
        description,
      };
      console.log("Sending payload:", payload);

      const res = await fetch("/api/requirements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      console.log("Response status:", res.status);
      const data = await res.json();
      console.log("Response data:", data);

      if (!res.ok || !data.success) {
        throw new Error(data?.message || "Failed to submit");
      }

      console.log("Requirement submitted successfully!");

      // Reset form
      setTitle("");
      setDescription("");
      setSelectedCategories([]);
      setShowForm(false);

      // Reload list
      loadRequirements();
    } catch (err: any) {
      console.error("Submission error:", err);
      setError(err.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-sky-50 p-6 text-black">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">My Requirements</h1>
          <button
            onClick={() => {
              console.log("Add Requirement button clicked");
              setShowForm(true);
            }}
            className="flex items-center mt-10 gap-2 rounded-lg bg-green-600 px-4 py-2 text-white font-semibold hover:bg-green-700"
          >
            <FaPlus /> Add Requirement
          </button>
        </div>

        {/* FORM MODAL */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-6 relative">
              <button
                onClick={() => setShowForm(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                aria-label="Close form"
                type="button"
              >
                <FaTimes />
              </button>

              <h2 className="text-xl font-semibold mb-4">Add Requirement</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* TITLE */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Requirement Title *
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                    placeholder="e.g. Need hotel in Goa"
                  />
                </div>

                {/* CATEGORIES */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Select Categories *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORY_OPTIONS.map((cat) => (
                      <button
                        type="button"
                        key={cat.value}
                        onClick={() => toggleCategory(cat.value)}
                        className={`px-3 py-1 rounded-full text-sm font-semibold border ${
                          selectedCategories.includes(cat.value)
                            ? "bg-green-100 border-green-600 text-green-700"
                            : "bg-white border-gray-300 text-gray-700"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* DESCRIPTION */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                    placeholder="Add more details..."
                  />
                </div>

                {error && (
                  <p className="text-red-600 text-sm">{error}</p>
                )}

                {/* SUBMIT */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-lg bg-green-600 py-3 text-white font-semibold hover:bg-green-700 disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit Requirement"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* REQUIREMENTS LIST */}
        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : requirements.length === 0 ? (
          <div className="bg-white rounded-xl p-6 shadow text-center text-gray-600">
            No requirements added yet.
          </div>
        ) : (
          <div className="space-y-4">
            {requirements.map((req) => (
              <div
                key={req._id}
                className="bg-white rounded-xl shadow p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">{req.title}</h3>
                  <span
                    className={`flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full ${
                      req.status === "open"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    <FaCheckCircle />
                    {req.status}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {req.categories.map((c) => (
                    <span
                      key={c}
                      className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full"
                    >
                      {c}
                    </span>
                  ))}
                </div>

                {req.description && (
                  <p className="text-sm text-gray-600">{req.description}</p>
                )}

                <p className="text-xs text-gray-400">
                  Posted on {new Date(req.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
