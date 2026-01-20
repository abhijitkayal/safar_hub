"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Pages/vendor/Sidebar";

type Address = {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
};

type AdditionalDetails = {
  dateOfBirth?: string;
  gender?: string;
  about?: string;
  addresses?: Address[];
};

export default function VendorProfileEditPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  // Get navigation function from global context
  const navigate = typeof window !== 'undefined' ? (window as any).__VENDOR_NAVIGATE__?.navigate : null;

  const [fullName, setFullName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [about, setAbout] = useState("");
  const [address, setAddress] = useState<Address>({
    street: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
  });

  useEffect(() => {
    const init = async () => {
      try {
        // verify session
        const authRes = await fetch("/api/auth/verify", { credentials: "include" });
        if (authRes.status !== 200) {
          router.replace("/login");
          return;
        }
        const auth = await authRes.json().catch(() => null);
        const verifiedUser = auth?.user;
        if (!authRes.ok || !verifiedUser) {
          router.replace("/login");
          return;
        }
        if (verifiedUser.accountType !== "vendor") {
          router.replace("/login");
          return;
        }

        // load profile
        const res = await fetch("/api/profile", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          const u = data.user;
          setFullName(u.fullName || "");
          setContactNumber(u.contactNumber || "");

          const ad: AdditionalDetails = u.additionalDetails || {};
          setDateOfBirth(ad.dateOfBirth ? ad.dateOfBirth.substring(0, 10) : "");
          setGender(ad.gender || "");
          setAbout(ad.about || "");
          const first = ad.addresses?.[0] || {};
          setAddress({
            street: first.street || "",
            city: first.city || "",
            state: first.state || "",
            country: first.country || "",
            postalCode: first.postalCode || "",
          });
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const body = {
        fullName,
        contactNumber,
        additionalDetails: {
          dateOfBirth: dateOfBirth || undefined,
          gender: gender || undefined,
          about: about || undefined,
          addresses: [
            {
              street: address.street || undefined,
              city: address.city || undefined,
              state: address.state || undefined,
              country: address.country || undefined,
              postalCode: address.postalCode || undefined,
            },
          ],
        } as AdditionalDetails,
      };

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.message || "Failed to save profile");
      }

      // Inform navbar and cached user
      try {
        const me = await fetch("/api/profile", { credentials: "include" });
        if (me.ok) {
          const json = await me.json();
          const updatedUser = json.user;
          localStorage.setItem("user", JSON.stringify(updatedUser));
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("auth:changed", { detail: updatedUser })
            );
          }
        }
      } catch {
        // ignore
      }

      navigate ? navigate("/vendor/profile") : router.replace("/vendor/profile");
    } catch (err: any) {
      setError(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-full py-12">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
      </div>
    );

  return (
    <div className="flex h-screen bg-gray-50 relative ">
                 {/* Desktop sidebar */}
                    {/* <div className="hidden lg:block lg:sticky lg:top-0 lg:h-screen pt-15 overflow-y-auto overflow-x-hidden">
                   <Sidebar />
                 </div> */}
      <div className="flex-1  lg:pt-0 overflow-y-auto min-h-screen ">
        {/* Mobile Menu Button */}
        <div className="lg:hidden sticky top-0 z-40 bg-sky-50 px-4 lg:pt-15 pt-0 pb-2">
          {/* <button
            onClick={() => setMobileSidebarOpen(true)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white shadow border text-gray-800"
          >
            ☰ <span className="text-sm font-medium">Menu</span>
          </button> */}
        </div>
        {/* main  */}
      <div className="w-full px-4 pt-6 lg:pt-24 pb-12">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Edit Vendor Profile</h1>
          <button
            onClick={() => navigate ? navigate("/vendor/profile") : router.push("/vendor/profile")}
            className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-md transition-all duration-200"
          >
            Cancel
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow p-6 space-y-6"
        >
          {/* Basic */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Basic</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Number
                </label>
                <input
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Additional Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none text-gray-900 bg-white"
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none text-gray-900 min-h-[100px]"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street
                </label>
                <input
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <input
                  value={address.country}
                  onChange={(e) => setAddress({ ...address, country: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Postal Code
                </label>
                <input
                  value={address.postalCode}
                  onChange={(e) =>
                    setAddress({ ...address, postalCode: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none text-gray-900"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate ? navigate("/vendor/profile") : router.push("/vendor/profile")}
              className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium shadow-md transition disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>

    {/* Mobile Sidebar Drawer */}
    {/* {mobileSidebarOpen && (
      <>
        <div
          className="fixed inset-0 z-90 bg-black/40 lg:hidden"
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
