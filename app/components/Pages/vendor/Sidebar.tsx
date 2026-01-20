"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  CalendarCheck,
  CreditCard,
  UserCog,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { MdOutlineCancel } from "react-icons/md";

import {
  FaCar,
  FaCompass,
  FaMountain,
  FaBed,
  FaShoppingCart,
  FaTag,
} from "react-icons/fa";
interface SidebarProps {
  onNavigate?: (href: string) => void;
  onLogout?: () => void;
}

export default function Sidebar({ onNavigate, onLogout }: SidebarProps) {
  const pathname = usePathname();
  const [openProperties, setOpenProperties] = useState(false);
  const [allowedServices, setAllowedServices] = useState<string[]>([]);
  const [isSeller, setIsSeller] = useState(false);

  // Open Properties submenu when on any properties route
  useEffect(() => {
    if (pathname?.startsWith("/vendor/properties") || pathname?.startsWith("/vendor/stays")) {
      setOpenProperties(true);
    }
  }, [pathname]);

  // Load vendor selected services from localStorage (kept updated by /vendor page)
  const loadAllowedServices = () => {
    try {
      const stored = JSON.parse(localStorage.getItem("user") || "{}");

      // If vendor is locked, hide all services from submenu
      if (stored?.isVendorLocked) {
        setAllowedServices([]);
        setIsSeller(false);
        return;
      }

      const rawServices: string[] = stored?.vendorServices || [];

      // normalize ids to match routes/keys
      const normalized = rawServices.map((s) => {
        if (s === "vehicle" || s === "vehicle-rentals") return "vehicle-rental";
        return s;
      });

      setAllowedServices(normalized);
      setIsSeller(Boolean(stored?.isSeller));
    } catch {
      setAllowedServices([]);
      setIsSeller(false);
    }
  };

  useEffect(() => {
    loadAllowedServices();
    
    // Listen for localStorage changes (when vendor updates services)
    const handleStorageChange = () => {
      loadAllowedServices();
    };
    
    window.addEventListener("storage", handleStorageChange);
    // Also listen to custom events that might update user data
    window.addEventListener("auth:changed", handleStorageChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("auth:changed", handleStorageChange);
    };
  }, []);

  // ✅ Logout Method
  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
      return;
    }
    // Fallback if onLogout not provided
    try {
      await fetch("/api/logout", { method: "POST" });
      localStorage.removeItem("user");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:changed", { detail: null }));
      }
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleNavClick = (event: MouseEvent<HTMLButtonElement>, href: string) => {
    event.preventDefault();
    event.stopPropagation();
    if (onNavigate) {
      onNavigate(href);
    }
  };

  // Full Properties list with ids to filter by vendor selection
  const propertiesSubmenu = [
    { id: "stays", name: "Stays", icon: <FaBed size={16} />, href: "/vendor/properties/stays" },
    { id: "tours", name: "Tours", icon: <FaCompass size={16} />, href: "/vendor/properties/tours" },
    { id: "adventures", name: "Adventures", icon: <FaMountain size={16} />, href: "/vendor/properties/adventures" },
    { id: "vehicle-rental", name: "Vehicle Rental", icon: <FaCar size={16} />, href: "/vendor/properties/vehicle-rental" },
  ];

  // Filter by allowed services; if none selected, show nothing under Properties
  const filteredProperties = propertiesSubmenu.filter((item) =>
    allowedServices.includes(item.id)
  );
  
  // For sellers, show simplified menu with just Products and Categories
  // const sellerLinks = isSeller
  //   ? [
  //       {
  //         id: "seller-products",
  //         name: "Products",
  //         icon: <FaShoppingCart size={16} />,
  //         href: "/vendor/properties/seller/products",
  //       },
  //       {
  //         id: "seller-categories",
  //         name: "Categories",
  //         icon: <FaTag size={16} />,
  //         href: "/vendor/properties/seller/categories",
  //       },
  //     ]
  //   : [];
  const hasPropertyEntries = filteredProperties.length > 0 ;

  const menu = [
    { name: "Dashboard", icon: <LayoutDashboard size={18} />, href: "/vendor" },
    
    // Show service properties for vendors with services
    ...(filteredProperties.length > 0 
      ? [{
          name: "Properties",
          icon: <Building2 size={18} />,
          submenu: filteredProperties,
          hidden: false,
        }]
      : []
    ),
    
    // Show seller products/categories for sellers
    ...(isSeller 
      ? [{
          name: "Products",
          icon: <FaShoppingCart size={18} />,
          href: "/vendor/products",
        },
        {
          name: "Categories",
          icon: <FaTag size={18} />,
          href: "/vendor/categories",
        }]
      : []
    ),

    { name: "Purchases", icon: <CalendarCheck size={18} />, href: "/vendor/purchases" },
    { name: "Cancellations", icon: <MdOutlineCancel size={18} />, href: "/vendor/cancellations" },

    { name: "Payment", icon: <CreditCard size={18} />, href: "/vendor/payments" },

    { name: "Profile", icon: <UserCog size={18} />, href: "/vendor/profile" },

    // ✅ Logout now uses an action, not a link
    { name: "Logout", icon: <LogOut size={18} />, action: "logout" },
  ];

  const isActiveHref = (href?: string) => {
    if (!href || !pathname) return false;
    if (href === "/vendor") return pathname === "/vendor";
    return pathname === href || pathname.startsWith(href + "/");
  };

  const anyPropertiesActive =
    filteredProperties.some((sub) => isActiveHref(sub.href)) ;
   

  return (
    <aside className="w-64 bg-white shadow-lg flex flex-col h-screen sticky top-0 overflow-y-auto lg:pt-20 pt-5">
      <div className="p-6 flex-1 overflow-y-auto">
      <nav className="space-y-3">
        {menu
          .filter((item) => !item.hidden)
          .map((item) => (
          <div key={item.name}>
            
            {/* ✅ SUBMENU */}
            {item.submenu ? (
              <>
                <button
                  onClick={() => setOpenProperties(!openProperties)}
                  className={`flex items-center justify-between w-full p-2 rounded-md transition ${
                    anyPropertiesActive
                      ? "text-green-600 bg-green-50"
                      : "text-gray-700 hover:text-green-600"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {item.icon}
                    <span>{item.name}</span>
                  </div>

                  <ChevronDown
                    size={16}
                    className={`transition-transform ${
                      openProperties ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openProperties && (
                  <div className="ml-8 mt-2 space-y-4">
                    {filteredProperties.map((sub) => (
                      <button
                        type="button"
                        key={sub.name}
                        onClick={(event) => handleNavClick(event, sub.href)}
                        className={`flex items-center gap-2 p-2 rounded-md transition w-full text-left ${
                          isActiveHref(sub.href)
                            ? "text-green-600 bg-green-50"
                            : "text-gray-700 hover:text-green-600"
                        }`}
                      >
                        {sub.icon}
                        {sub.name}
                      </button>
                    ))}
                    {/* {isSeller && (
                      <div>
                        <p className="text-xs font-semibold uppercase text-gray-500 tracking-wide mb-1">
                          Seller
                        </p>
                        <div className="space-y-2">
                          <button
                            type="button"
                            onClick={(event) => handleNavClick(event, "/vendor/properties/seller/products")}
                            className={`flex items-center gap-2 p-2 rounded-md transition w-full text-left ${
                              isActiveHref("/vendor/properties/seller/products")
                                ? "text-indigo-600 bg-indigo-50"
                                : "text-gray-700 hover:text-indigo-600"
                            }`}
                          >
                            <FaShoppingCart size={16} />
                            Products
                          </button>
                          <button
                            type="button"
                            onClick={(event) => handleNavClick(event, "/vendor/properties/seller/categories")}
                            className={`flex items-center gap-2 p-2 rounded-md transition w-full text-left ${
                              isActiveHref("/vendor/properties/seller/categories")
                                ? "text-indigo-600 bg-indigo-50"
                                : "text-gray-700 hover:text-indigo-600"
                            }`}
                          >
                            <FaTag size={16} />
                            Categories
                          </button>
                        </div>
                      </div>
                    )} */}
                  </div>
                )}
              </>
            ) : item.action === "logout" ? (
              
              /* ✅ LOGOUT BUTTON */
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-700 hover:text-red-600 p-2 rounded-md transition w-full cursor-pointer"
              >
                {item.icon}
                <span>{item.name}</span>
              </button>

            ) : (
              
              /* ✅ NORMAL MENU ITEM */
              <button
                type="button"
                onClick={(event) => handleNavClick(event, item.href!)}
                className={`flex items-center gap-2 p-2 rounded-md transition w-full text-left ${
                  isActiveHref(item.href)
                    ? "text-green-600 bg-green-50"
                    : "text-gray-700 hover:text-green-600"
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </button>
            )}
          </div>
        ))}
      </nav>
      </div>
    </aside>
  );
}
