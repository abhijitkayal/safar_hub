"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FaBars } from "react-icons/fa";

import PageLoader from "../components/common/PageLoader";
import ProfileSidebar from "../components/Pages/profile/ProfileSidebar";
import ProfileLayoutContext from "./ProfileLayoutContext";

type SidebarSection = "profile" | "bookings" | "cart" | "orders" | "inbox" | "support";

const routeMap: Record<SidebarSection, string> = {
  profile: "/profile",
  bookings: "/profile/bookings",
  cart: "/profile/cart",
  orders: "/profile/orders",
  inbox: "/profile/inbox",
  support: "/profile/support",
};

const deriveActiveTab = (path: string): SidebarSection => {
  if (path.startsWith("/profile/bookings")) return "bookings";
  if (path.startsWith("/profile/cart")) return "cart";
  if (path.startsWith("/profile/orders")) return "orders";
  if (path.startsWith("/profile/inbox")) return "inbox";
  if (path.startsWith("/profile/support")) return "support";
  return "profile";
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/verify", { credentials: "include" });

      if (res.status === 401) {
        router.replace("/login");
        return;
      }

      const data = await res.json().catch(() => null);
      const verifiedUser = data?.user;
      if (!res.ok || !verifiedUser) {
        router.replace("/login");
        return;
      }

      if (verifiedUser.accountType === "vendor") {
        router.replace("/vendor");
        return;
      }

      setUser(verifiedUser);
    } catch (err) {
      console.error("Verify failed:", err);
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    localStorage.removeItem("user");
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("auth:changed", { detail: null }));
    }
    router.push("/");
  };

  const deleteAccount = async () => {
    if (!confirm("Are you sure? This cannot be undone.")) return;
    try {
      const res = await fetch("/api/profile", { method: "DELETE", credentials: "include" });
      const data = await res.json();
      if (data.success) {
        alert("Account deleted");
        router.push("/");
      }
    } catch {
      alert("Failed to delete account");
    }
  };

  const handleNavigation = (section: SidebarSection) => {
    setMobileSidebarOpen(false);
    router.push(routeMap[section]);
  };

  const activeTab = useMemo(() => deriveActiveTab(pathname ?? "/profile"), [pathname]);

  if (loading) return <PageLoader />;
  if (!user) return <p className="text-center mt-20">No user found.</p>;

    return (
      <ProfileLayoutContext.Provider value={{ user, refreshUser }}>
        <div className="flex flex-col md:flex-row h-screen bg-sky-50 text-black">
        <div className="hidden lg:block lg:sticky lg:top-0 lg:h-screen">
         <div className="w-64 h-full bg-white shadow-lg  flex flex-col overflow-y-auto overflow-x-hidden">
            <ProfileSidebar
              user={user}
              active={activeTab}
              onDeleteAccount={deleteAccount}
              onLogout={handleLogout}
              onNavigate={handleNavigation}
            />
          </div>
        </div>

        <div className="flex-1 p-4 md:p-10 pt-20 overflow-y-auto min-h-screen">
          <div className="md:hidden mb-4">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white shadow border text-gray-800"
            >
              <FaBars />
              <span className="text-sm font-medium">Menu</span>
            </button>
          </div>

          <div className="lg:pt-0 pt-2 ">{children}</div>
        </div>

        {mobileSidebarOpen && (
          <>
            <div className="fixed inset-0 z-90 bg-black/40 md:hidden" onClick={() => setMobileSidebarOpen(false)} />
            <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-100 p-6 md:hidden overflow-y-auto overflow-x-hidden">
              <div className="mb-6 flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-800">Menu</span>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="px-3 py-1.5 rounded-md border text-gray-700"
                >
                  Close
                </button>
              </div>

              <ProfileSidebar
                user={user}
                active={activeTab}
                onDeleteAccount={deleteAccount}
                onLogout={handleLogout}
                onNavigate={handleNavigation}
              />
            </div>
          </>
        )}
      </div>
    </ProfileLayoutContext.Provider>
  );
}

