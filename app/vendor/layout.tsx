"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FaBars } from "react-icons/fa";
import { FaLock } from "react-icons/fa";

import PageLoader from "../components/common/PageLoader";
import Sidebar from "../components/Pages/vendor/Sidebar";
import VendorLayoutContext from "./VendorLayoutContext";

const shouldLockVendor = (account: any) => {
  if (!account) return true;
  if (account.isVendorLocked) return true;

  const hasVendorServices =
    Array.isArray(account.vendorServices) && account.vendorServices.length > 0;
  const sellerOnly = Boolean(account.isSeller) && !hasVendorServices;

  // Lock sellers (even without vendor services) until approved, just like vendors
  if (sellerOnly) return !account.isVendorApproved;
  return !account.isVendorApproved;
};

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [locked, setLocked] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isNavigating, startNavigation] = useTransition();

  // Verify vendor token from backend
  const verifyVendor = useCallback(async () => {
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

      // Only vendor allowed
      if (data.user.accountType !== "vendor") {
        router.replace("/login");
        return;
      }

      setUser(data.user);
      setLocked(shouldLockVendor(data.user));
    } catch (err) {
      console.error("Vendor auth failed", err);
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Refresh user from server
  const refreshUser = useCallback(async () => {
    try {
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      const vendorId = stored?._id || stored?.id;
      if (!vendorId) return;

      const res = await fetch(`/api/admin/vendors?id=${vendorId}`);
      const data = await res.json();

      if (data.success && data.vendor) {
        const updatedUser = {
          ...stored,
          _id: data.vendor._id || stored._id,
          isVendorApproved: data.vendor.isVendorApproved,
          isVendorLocked: data.vendor.isVendorLocked || false,
          vendorServices: data.vendor.vendorServices || [],
          isSeller: data.vendor.isSeller ?? stored.isSeller ?? false,
        };

        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setLocked(shouldLockVendor(updatedUser));
      }
    } catch (err) {
      console.error("Failed to refresh vendor status:", err);
    }
  }, []);

  useEffect(() => {
    verifyVendor();
  }, [verifyVendor]);

  // Poll if not approved OR if locked (to detect unlock)
  useEffect(() => {
    if (!user) return;
    const stored = JSON.parse(localStorage.getItem("user") || "{}");
    if (!stored || stored.accountType !== "vendor") return;

    if (!stored.isVendorApproved || stored.isVendorLocked) {
      const interval = setInterval(refreshUser, 5000); // every 5 seconds
      return () => clearInterval(interval);
    }
  }, [user, refreshUser]);

  // React to live updates
  useEffect(() => {
    if (user) {
      setLocked(shouldLockVendor(user));
    }
  }, [user]);

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    localStorage.removeItem("user");
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("auth:changed", { detail: null }));
    }
    router.push("/login");
  };

  const handleNavigation = (href: string) => {
    setMobileSidebarOpen(false);
    startNavigation(() => {
      router.push(href);
    });
  };

  // Set up global navigation function for components that can't access context
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__VENDOR_NAVIGATE__ = {
        navigate: handleNavigation
      };
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).__VENDOR_NAVIGATE__;
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 z-100 flex items-center justify-center bg-white">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
      </div>
    );
  }

  if (locked) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white shadow-2xl rounded-2xl p-8 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
            <FaLock size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Your Vendor Dashboard Is Locked</h1>
          <p className="text-gray-600">
            Your account has been locked by the administrator. You temporarily cannot access vendor tools or view your services.
            We&apos;ll automatically unlock this page as soon as the admin removes the lock.
          </p>
          <p className="text-sm text-gray-500">
            Need help? Please contact support or check back later.
          </p>
        </div>
      </main>
    );
  }

  if (!user) return <p className="text-center mt-20">No user found.</p>;

  return (
    <VendorLayoutContext.Provider value={{ user, refreshUser, locked }}>
      <div className="flex flex-col md:flex-row h-screen bg-sky-50 text-black">
        <div className="hidden lg:block lg:sticky lg:top-0 lg:h-screen">
         <div className="w-64 h-full bg-white shadow-lg  flex flex-col overflow-y-auto overflow-x-hidden">
            <Sidebar onNavigate={handleNavigation} onLogout={handleLogout} />
          </div>
        </div>
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
        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
        
     
          <main className="flex-1 overflow-y-auto overflow-x-auto lg:overflow-x-hidden p-4 md:p-6">
            {isNavigating ? (
              <div className="flex items-center justify-center h-full">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
              </div>
            ) : (
              children
            )}
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
              <Sidebar onNavigate={handleNavigation} onLogout={handleLogout} />
            </div>
          </>
        )}
      </div>
    </VendorLayoutContext.Provider>
  );
}