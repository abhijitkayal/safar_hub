"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FaBars } from "react-icons/fa";

import Sidebar from "../components/Pages/admin/Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isNavigating, startNavigation] = useTransition();

  // Verify admin token from backend
  const verifyAdmin = useCallback(async () => {
    if (user) return; // Skip if already verified
    try {
      const res = await fetch("/api/auth/verify", {
        credentials: "include",
      });

      if (res.status === 401) {
        router.replace("/login");
        return;
      }

      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.user) {
        router.replace("/login");
        return;
      }

      // Only admin allowed
      if (data.user.accountType !== "admin") {
        router.replace("/login");
        return;
      }

      setUser(data.user);
    } catch (err) {
      console.error("Admin auth failed", err);
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  }, [router, user]);

  useEffect(() => {
    verifyAdmin();
  }, [verifyAdmin]);

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    localStorage.removeItem("user");
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("auth:changed", { detail: null }));
    }
    router.push("/login");
  };

  if (loading && !user) {
    return (
      <div className="fixed inset-0 z-100 flex items-center justify-center bg-white">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) return <div className="fixed inset-0 flex items-center justify-center bg-sky-50"><p className="text-gray-500 animate-pulse font-medium">Authenticating Admin...</p></div>;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-sky-50 text-black">
      <div className="hidden lg:block lg:sticky lg:top-0 lg:h-screen">
        <div className="w-64 h-full bg-white shadow-lg flex flex-col overflow-y-auto overflow-x-hidden">
          <Sidebar />
        </div>
      </div>
      {/* Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar with mobile trigger */}
        <div className="flex items-center gap-3 p-3 mt-15">
          <button
            className="lg:hidden px-3 py-2 rounded border text-gray-700"
            onClick={() => setMobileSidebarOpen(true)}
            aria-label="Open menu"
          >
            <FaBars />
          </button>
        </div>
        <main className="flex-1 overflow-y-auto overflow-x-auto lg:overflow-x-hidden p-4 md:p-6 relative">
          {isNavigating && (
            <div className="absolute inset-x-0 top-0 h-1 bg-green-500/30 z-50">
              <div className="h-full bg-green-500 animate-[loading_1s_infinite]" />
            </div>
          )}
          <div className={isNavigating ? "opacity-50 pointer-events-none transition-opacity duration-300" : "opacity-100 transition-opacity duration-300"}>
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Drawer */}
      {mobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-90 bg-black/40 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-100 p-0 lg:hidden overflow-y-auto">
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
      )}
    </div>
  );
}

