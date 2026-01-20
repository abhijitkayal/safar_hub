// app/profile/edit/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useProfileLayout } from "../ProfileLayoutContext";
import { FaCamera, FaCloudUploadAlt, FaTrash } from "react-icons/fa";

export default function EditProfilePage() {
  const router = useRouter();
  const { user, refreshUser } = useProfileLayout();
  const [newPicture, setNewPicture] = useState<File | null>(null);

  // Show custom input only when "Other" is chosen
  const [showCustomGender, setShowCustomGender] = useState(false);
  const [customGender, setCustomGender] = useState("");

  const [form, setForm] = useState({
    contactNumber: "",
    age: "",
    gender: "",
    about: "",
    dateOfBirth: "",
    addresses: [{ street: "", city: "", state: "" }],
  });

  useEffect(() => {
    if (user) {
      const savedGender = user.additionalDetails?.gender || "";
      const isOther = !["Male", "Female", "Other"].includes(savedGender);
      const displayGender = isOther ? "Other" : savedGender;

      setForm({
        contactNumber: user.contactNumber || "",
        age: user.age?.toString() || "",
        gender: displayGender,
        about: user.additionalDetails?.about || "",
        dateOfBirth: user.additionalDetails?.dateOfBirth || "",
        addresses: user.additionalDetails?.addresses?.length
          ? user.additionalDetails.addresses
          : [{ street: "", city: "", state: "" }],
      });

      if (isOther) {
        setCustomGender(savedGender);
        setShowCustomGender(true);
      }
    }
  }, [user]);

  const uploadPicture = async () => {
    if (!newPicture) return alert("Please select an image");
    const fd = new FormData();
    fd.append("displayPicture", newPicture);
    const res = await fetch("/api/profile/picture", {
      method: "POST",
      credentials: "include",
      body: fd,
    });
    const data = await res.json();
    if (data.success) {
      alert("Picture updated!");
      await refreshUser();
    } else alert(data.message || "Upload failed");
  };

  const removePicture = async () => {
    if (!confirm("Remove profile picture?")) return;
    const res = await fetch("/api/profile/picture/remove", {
      method: "PUT",
      credentials: "include",
    });
    const data = await res.json();
    if (data.success) {
      alert("Picture removed");
      await refreshUser();
    }
  };

  const save = async () => {
    const finalGender =
      form.gender === "Other" && customGender.trim()
        ? customGender.trim()
        : form.gender;

    const payload = {
      contactNumber: form.contactNumber,
      age: form.age ? Number(form.age) : undefined,
      additionalDetails: {
        gender: finalGender,
        about: form.about,
        dateOfBirth: form.dateOfBirth,
        addresses: form.addresses,
      },
    };

    const res = await fetch("/api/profile", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.success) {
      alert("Profile saved!");
      await refreshUser();
      router.push("/profile");
    } else alert("Save failed");
  };

  if (!user) return null;

  const Avatar = () => {
    if (user.avatar) {
      return (
        <Image
          src={user.avatar}
          alt="avatar"
          width={100}
          height={100}
          className="rounded-full border-4 border-green-200 size-20"
        />
      );
    }
    const first = user.fullName?.trim().charAt(0).toUpperCase() ?? "U";
    return (
      <div className="w-[100px] h-[100px] rounded-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-3xl border-4 border-green-200">
        {first}
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 bg-sky-50 shadow-xl rounded-3xl  mb-10">
      <div className="mb-4 md:mb-6 flex items-center justify-between mt-20">
        <h1 className="text-2xl md:text-3xl font-bold text-black">Edit Profile</h1>
        <button
          onClick={() => router.push("/profile")}
          className="bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 md:px-6 py-2 md:py-2.5 rounded-xl font-medium shadow-md transition-all duration-200 flex items-center gap-2 text-sm md:text-base"
        >
          Back to Profile
        </button>
      </div>

      {/* Picture */}
      <div className="flex flex-col md:flex-row items-center gap-6 mb-8 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="shrink-0">
          <Avatar />
        </div>

        <div className="flex flex-col gap-3 w-full md:w-auto">
          <div className="flex flex-wrap items-center gap-3">
            {/* Custom File Input */}
            <label className="cursor-pointer group relative overflow-hidden inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm active:scale-95">
              <FaCamera className="text-gray-500 group-hover:text-green-600 transition-colors" />
              <span>{newPicture ? "Change Photo" : "Choose Photo"}</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setNewPicture(e.target.files?.[0] ?? null)}
                className="hidden"
              />
            </label>

            {/* Display Selected Filename */}
            {newPicture && (
              <span className="text-sm text-gray-600 italic bg-gray-50 px-3 py-1 rounded-full border border-gray-100 truncate max-w-[200px]">
                {newPicture.name}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 mt-1">
            {/* Upload Action */}
            <button
              onClick={uploadPicture}
              disabled={!newPicture}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-white shadow-sm transition-all duration-200 ${newPicture
                ? "bg-blue-600 hover:bg-blue-700 hover:shadow-md active:scale-95"
                : "bg-gray-300 cursor-not-allowed"
                }`}
            >
              <FaCloudUploadAlt className="text-lg" />
              Upload
            </button>

            {/* Remove Action */}
            <button
              onClick={removePicture}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-xl font-medium transition-all duration-200 active:scale-95"
            >
              <FaTrash className="text-sm" />
              Remove
            </button>
          </div>
          <p className="text-xs text-gray-400 pl-1">
            Recommended: Square JPG, PNG. Max 2MB.
          </p>
        </div>
      </div>

      {/* Read-only Name & Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-900">
            Full Name
          </label>
          <input
            type="text"
            value={user.fullName}
            disabled
            className="mt-1 w-full p-2 border rounded bg-gray-100 cursor-not-allowed text-gray-600 border-gray-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900">
            Email
          </label>
          <input
            type="email"
            value={user.email}
            disabled
            className="mt-1 w-full p-2 border rounded bg-gray-100 cursor-not-allowed text-gray-600 border-gray-300"
          />
        </div>
      </div>

      {/* Editable Fields */}
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Contact Number"
          value={form.contactNumber}
          onChange={(e) =>
            setForm({ ...form, contactNumber: e.target.value })
          }
          className="w-full p-2 border rounded text-gray-600 border-gray-300"
        />
        <input
          type="number"
          placeholder="Age"
          value={form.age}
          onChange={(e) => setForm({ ...form, age: e.target.value })}
          className="w-full p-2 border rounded text-gray-600 border-gray-300"
        />
        <input
          type="date"
          value={form.dateOfBirth}
          onChange={(e) =>
            setForm({ ...form, dateOfBirth: e.target.value })
          }
          className="w-full p-2 border rounded text-gray-600 border-gray-300"
        />

        {/* Gender */}
        <div className="flex flex-col gap-2">
          <select
            value={form.gender}
            onChange={(e) => {
              const val = e.target.value;
              setForm({ ...form, gender: val });
              setShowCustomGender(val === "Other");
              if (val !== "Other") setCustomGender("");
            }}
            className="w-full p-2 border rounded text-gray-600 border-gray-300"
          >
            {/* Show placeholder only when nothing is selected yet */}
            {!form.gender && <option value="" disabled>Select gender…</option>}
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <textarea
          placeholder="About"
          rows={4}
          value={form.about}
          onChange={(e) => setForm({ ...form, about: e.target.value })}
          className="w-full p-2 border rounded text-gray-600 border-gray-300"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <input
            key="street"
            placeholder="Street"
            value={form.addresses[0].street}
            onChange={(e) =>
              setForm({
                ...form,
                addresses: [{ ...form.addresses[0], street: e.target.value }],
              })
            }
            className="p-2 border rounded text-gray-600 border-gray-300"
          />
          <input
            key="city"
            placeholder="City"
            value={form.addresses[0].city}
            onChange={(e) =>
              setForm({
                ...form,
                addresses: [{ ...form.addresses[0], city: e.target.value }],
              })
            }
            className="p-2 border rounded text-gray-600 border-gray-300"
          />
          <input
            key="state"
            placeholder="State"
            value={form.addresses[0].state}
            onChange={(e) =>
              setForm({
                ...form,
                addresses: [{ ...form.addresses[0], state: e.target.value }],
              })
            }
            className="p-2 border rounded text-gray-600 border-gray-300"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-6 md:mt-8 flex flex-col-reverse sm:flex-row justify-end gap-2 md:gap-3">
        <button
          onClick={() => router.push("/profile")}
          className="px-4 md:px-5 py-2 bg-gray-500 text-white rounded"
        >
          Cancel
        </button>
        <button
          onClick={save}
          className="px-5 md:px-6 py-2 bg-green-600 text-white rounded"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}