"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { useProfileLayout } from "./ProfileLayoutContext";

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useProfileLayout();

  if (!user) return null;

  const Avatar = ({ size = 64 }: { size?: number }) => {
    if (user.avatar) {
      return (
        <Image
          src={user.avatar}
          alt="Profile"
          width={size}
          height={size}
          className="rounded-full border-4 border-green-200"
          style={{ width: size, height: size }}
        />
      );
    }

    const first = user.fullName?.trim().charAt(0).toUpperCase() ?? "U";
    return (
      <div
        className="rounded-full border-4 border-green-200 flex items-center justify-center text-white font-bold"
        style={{
          width: size,
          height: size,
          fontSize: size * 0.45,
          background: "linear-gradient(to bottom right, #a855f7, #ec4899)",
        }}
      >
        {first}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 pt-15">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
        <div className="flex flex-wrap gap-2 md:gap-3">
          <button
            onClick={() => router.push("/")}
            className="bg-linear-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white px-4 md:px-5 py-2 rounded-xl font-medium shadow-md transition-all duration-200 text-sm"
          >
            Back to Home
          </button>
          <button
            onClick={() => router.push("/profile/edit")}
            className="bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 md:px-6 py-2 rounded-xl font-medium shadow-md transition-all duration-200 text-sm"
          >
            Edit Profile
          </button>
        </div>
      </div>

      <div className="bg-white shadow-xl rounded-3xl p-6 md:p-8">
        <div className="flex gap-4 md:gap-6 mb-8 items-center">
          <div className="md:hidden">
            <Avatar size={80} />
          </div>
          <div className="hidden md:block">
            <Avatar size={100} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{user.fullName}</h2>
            <p className="text-gray-500 mt-1">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
          <div>
            <p className="mb-3">
              <span className="font-semibold text-gray-800">Full Name:</span> {user.fullName}
            </p>
            <p className="mb-3">
              <span className="font-semibold text-gray-800">Phone:</span> {user.contactNumber || "N/A"}
            </p>
            <p className="mb-3">
              <span className="font-semibold text-gray-800">Gender:</span> {user.additionalDetails?.gender || "N/A"}
            </p>
            <p className="mb-3">
              <span className="font-semibold text-gray-800">Address:</span>{" "}
              {(() => {
                const address = user.additionalDetails?.addresses?.[0];
                if (!address) return "N/A";
                const parts = [address.street, address.city, address.state].filter(Boolean);
                return parts.length ? parts.join(", ") : "N/A";
              })()}
            </p>
          </div>
          <div>
            <p className="mb-3">
              <span className="font-semibold text-gray-800">Email:</span> {user.email}
            </p>
            <p className="mb-3">
              <span className="font-semibold text-gray-800">Age:</span> {user.age || "N/A"}
            </p>
            <p className="mb-3">
              <span className="font-semibold text-gray-800">DOB:</span> {user.additionalDetails?.dateOfBirth || "N/A"}
            </p>
            <p>
              <span className="font-semibold text-gray-800">About:</span> {user.additionalDetails?.about || "N/A"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}