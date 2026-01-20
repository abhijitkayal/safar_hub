"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageLoader from "@/app/components/common/PageLoader";
import ProfileSidebar from "@/app/components/Pages/profile/ProfileSidebar";

export default function AdminProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<{ loginCount: number; lastLogin: string | null } | null>(null);
  const [admin, setAdmin] = useState<{ email: string } | null>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        // Verify admin
        const verifyRes = await fetch("/api/auth/verify", { credentials: "include" });
        if (!verifyRes.ok) {
          router.push("/login");
          return;
        }
        const verifyData = await verifyRes.json().catch(() => null);
        const verifiedUser = verifyData?.user;
        if (!verifiedUser || verifiedUser.accountType !== "admin") {
          router.push("/login");
          return;
        }
        setAdmin({ email: verifiedUser.email });

        // Fetch metrics
        const res = await fetch("/api/admin/meta", { credentials: "include" });
        const data = await res.json();
        if (data.success) {
          setMeta({
            loginCount: data.meta.loginCount || 0,
            lastLogin: data.meta.lastLogin || null,
          });
        }
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [router]);

  // Handle navigation within the profile section
  const handleNavigation = (section: string) => {
    // Close mobile sidebar if open
    setMobileSidebarOpen(false);
    
    // Set active tab instead of navigating to different pages
    setActiveTab(section);
  };

  // ---------- Logout ----------
  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    localStorage.removeItem("user");
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("auth:changed", { detail: null }));
    }
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!admin) return <p className="text-center mt-20">No admin found.</p>;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <div className="hidden lg:block lg:sticky lg:top-0 lg:h-screen">
        {/* <div className="w-64 h-full bg-white shadow-lg flex flex-col overflow-y-auto overflow-x-hidden">
          <ProfileSidebar
            user={{ fullName: "Admin", email: admin.email }}
            active={activeTab as any}
            onLogout={handleLogout}
            onNavigate={handleNavigation}
          />
        </div> */}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-10 pt-20 overflow-y-auto">
        {/* Mobile toggle button for sidebar */}
        <div className="md:hidden mb-4">
          {/* <button
            onClick={() => setMobileSidebarOpen(true)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white shadow border text-gray-800"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium">Menu</span>
          </button> */}
        </div>

        {/* Profile Tab Content */}
        {activeTab === "profile" && (
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-6">
            <h1 className="text-2xl font-semibold mb-1">Admin Profile</h1>
            <p className="text-gray-600 mb-6">Account overview and login activity</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-xl border p-5">
                <div className="text-sm text-gray-500">Email</div>
                <div className="text-lg font-medium">{admin?.email}</div>
              </div>
              <div className="rounded-xl border p-5">
                <div className="text-sm text-gray-500">Login Count</div>
                <div className="text-2xl font-bold">{meta?.loginCount ?? 0}</div>
              </div>
              <div className="rounded-xl border p-5 md:col-span-2">
                <div className="text-sm text-gray-500">Last Login</div>
                <div className="text-lg font-medium">
                  {meta?.lastLogin
                    ? new Date(meta.lastLogin).toLocaleString()
                    : "No data yet"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs would be loaded here dynamically */}
        {activeTab !== "profile" && (
          <div className="max-w-4xl mx-auto">
            {/* This is where other content would be loaded dynamically */}
            <div className="bg-white shadow-xl rounded-3xl p-8 text-center">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {activeTab === "bookings" && "Booking Management"}
                {activeTab === "wishlist" && "Wishlist"}
                {activeTab === "inbox" && "Inbox"}
                {activeTab === "support" && "Support"}
              </h2>
              <p className="text-gray-500">
                {activeTab === "bookings" && "Manage all bookings here."}
                {activeTab === "wishlist" && "View wishlist items."}
                {activeTab === "inbox" && "Check your inbox messages."}
                {activeTab === "support" && "Access support resources."}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sidebar Drawer */}
      {mobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-90 bg-black/40 md:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-100 p-6 md:hidden overflow-y-auto">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-800">Menu</span>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="px-3 py-1.5 rounded-md border text-gray-700"
              >
                Close
              </button>
            </div>

            <div className="mb-8 flex flex-col items-center space-y-2">
              <div className="w-14 h-14 rounded-full border-4 border-green-200 flex items-center justify-center text-white font-bold bg-gradient-to-br from-indigo-500 to-purple-600">
                A
              </div>
              <h2 className="text-base font-bold text-center text-gray-800 truncate">
                Admin
              </h2>
              <p className="text-xs text-gray-500 text-center truncate">{admin?.email}</p>
            </div>

            <nav className="space-y-2">
              {[
                { id: "profile", label: "My Profile", icon: "M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" },
                { id: "bookings", label: "Bookings", icon: "M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" },
                { id: "wishlist", label: "Wishlist", icon: "M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" },
                { id: "inbox", label: "Inbox", icon: "M2.94 6.412A2 2 0 002 8.108V16a2 2 0 002 2h12a2 2 0 002-2V8.108a2 2 0 00-.94-1.696l-6-3.75a2 2 0 00-2.12 0l-6 3.75zm2.615 2.423a1 1 0 10-1.11 1.664l5 3.333a1 1 0 001.11 0l5-3.333a1 1 0 00-1.11-1.664L10 11.798 5.555 8.835z" },
                { id: "support", label: "Support", icon: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    handleNavigation(item.id);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                    activeTab === item.id
                      ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg"
                      : "text-gray-700 hover:bg-green-50 hover:text-green-600"
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d={item.icon}
                      clipRule="evenodd"
                    />
                  </svg>
                  {item.label}
                </button>
              ))}

              <div className="pt-4 border-t border-gray-100">
                <button
                  onClick={handleLogout}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-3 rounded-xl font-medium shadow-lg transition-all duration-200 flex items-center gap-3"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Logout
                </button>
              </div>
            </nav>
          </div>
        </>
      )}
    </div>
  );
}