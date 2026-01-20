"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { MdLogout } from "react-icons/md";
import { useMemo, type JSX } from "react";

type SidebarSection = "profile" | "bookings" | "cart" | "orders" | "inbox" | "support";

type ProfileSidebarProps = {
  user: any;
  active?: SidebarSection;
  onDeleteAccount?: () => void;
  onLogout?: () => void;
  onNavigate?: (section: SidebarSection) => void; // Add onNavigate prop
};

const navItems: Array<{
  id: SidebarSection;
  label: string;
  href: string;
  icon: JSX.Element;
}> = [
    {
      id: "profile",
      label: "My Profile",
      href: "/profile",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      id: "bookings",
      label: "Booking History",
      href: "/profile/bookings",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      id: "cart",
      label: "Cart",
      href: "/profile/cart",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
        </svg>
      ),
    },
    {
      id: "orders",
      label: "Order History",
      href: "/profile/orders",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      id: "inbox",
      label: "Inbox",
      href: "/profile/inbox",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M2.94 6.412A2 2 0 002 8.108V16a2 2 0 002 2h12a2 2 0 002-2V8.108a2 2 0 00-.94-1.696l-6-3.75a2 2 0 00-2.12 0l-6 3.75zm2.615 2.423a1 1 0 10-1.11 1.664l5 3.333a1 1 0 001.11 0l5-3.333a1 1 0 00-1.11-1.664L10 11.798 5.555 8.835z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      id: "support",
      label: "Contact Support",
      href: "/profile/support",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
  ];

const ProfileSidebar = ({
  user,
  active = "profile",
  onDeleteAccount,
  onLogout,
  onNavigate, // Destructure onNavigate prop
}: ProfileSidebarProps) => {
  const router = useRouter();

  const Avatar = useMemo(() => {
    if (!user) return null;

    if (user.avatar) {
      return (
        <div className="relative h-16 w-16 shrink-0">
          <Image
            src={user.avatar}
            alt="Profile"
            fill
            className="rounded-full border-4 border-green-200 object-cover"
          />
        </div>
      );
    }

    const first = user.fullName?.trim().charAt(0).toUpperCase() ?? "U";
    return (
      <div
        className="rounded-full border-4 border-green-200 flex items-center justify-center text-white font-bold"
        style={{
          width: 64,
          height: 64,
          fontSize: 64 * 0.45,
          background: "linear-gradient(to bottom right, #a855f7, #ec4899)",
        }}
      >
        {first}
      </div>
    );
  }, [user]);

  if (!user) return null;

  return (

    <div className="w-64  bg-white shadow-lg p-6 flex flex-col pt-20  ">
      <div className="mb-8 flex flex-col items-center space-y-2">
        {Avatar}
        <h2 className="text-xl font-bold text-center text-gray-800 mb-2 truncate">
          {user.fullName}
        </h2>
        <p className="text-sm text-gray-500 text-center truncate">{user.email}</p>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            // Use onNavigate if provided, otherwise use router.push for backward compatibility
            onClick={() => onNavigate ? onNavigate(item.id) : router.push(item.href)}
            className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${active === item.id
                ? "bg-linear-to-r from-green-500 to-green-600 text-white shadow-lg"
                : "text-gray-700 hover:bg-green-50 hover:text-green-600"
              }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div className="pt-4 border-t border-gray-100 space-y-2">
        {onDeleteAccount && (
          <button
            onClick={onDeleteAccount}
            className="w-full bg-red-100 hover:bg-red-200 text-red-700 px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-3"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 011-1h6a1 1 0 110 2H8a1 1 0 01-1-1zm1 4a1 1 0 100 2h6a1 1 0 100-2H8z"
                clipRule="evenodd"
              />
            </svg>
            Delete Account
          </button>
        )}
        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-3 rounded-xl font-medium shadow-lg transition-all duration-200 flex items-center gap-3"
          >
            <MdLogout className="w-5 h-5" />
            Logout
          </button>
        )}
      </div>
    </div>

  );
};

export default ProfileSidebar;