"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FaChartPie,
  FaUmbrellaBeach,
  FaPlaneDeparture,
  FaMoneyCheckAlt,
  FaUsers,
  FaFileAlt,
  FaComments,
  FaUserCircle,
  FaBed,
  FaShoppingBag,
  FaTimesCircle,
  FaMountain,
  FaCar,
  FaPlus,
} from "react-icons/fa";
import { MdCancelPresentation } from "react-icons/md";
import { MdShoppingCart } from "react-icons/md";
import { BiCategory } from "react-icons/bi";
import { TbLogs } from "react-icons/tb";
import { RiCouponLine } from "react-icons/ri";

import { TbLogout } from "react-icons/tb";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

const Sidebar: React.FC = () => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // ✅ Highlight current path
  const isActive = (path: string) => pathname === path;

  // ✅ Auto open dropdown based on current path
  useEffect(() => {
    if (pathname.startsWith("/admin/partners")) setOpenMenu("partners");
    else if (pathname.startsWith("/admin/bookings")) setOpenMenu("bookings");
    else if (pathname.startsWith("/admin/transactions")) setOpenMenu("accounting");
    else if (pathname.startsWith("/admin/invoices") || pathname.includes("invoices")) setOpenMenu("accounting");
    else if (pathname.startsWith("/admin/customers")) setOpenMenu("customers");
    else if (pathname.startsWith("/admin/reports")) setOpenMenu("reports");
  }, [pathname]);

  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  // ✅ Logout
  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST", credentials: "include" });
      localStorage.removeItem("user");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:changed", { detail: null }));
      }
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
      localStorage.removeItem("user");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:changed", { detail: null }));
      }
      router.push("/");
    }
  };

  // ✅ Dropdown button (parent)
  const menuItem = (key: string, label: string, icon: any) => (
    <button
      onClick={() => toggleMenu(key)}
      className={`flex w-full items-center justify-between p-2 rounded font-medium transition-colors
        ${openMenu === key
          ? "text-green-600 bg-green-50"
          : "text-gray-700 hover:text-green-600 hover:bg-gray-50"
        }`}
    >
      <span className="flex items-center gap-3 whitespace-nowrap">
        {icon}
        <span className="block truncate">{label}</span>
      </span>
      {openMenu === key ? (
        <IoIosArrowUp size={16} className="text-gray-500" />
      ) : (
        <IoIosArrowDown size={16} className="text-gray-500" />
      )}
    </button>
  );

  return (
    <aside className="w-65 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0 overflow-y-auto ">
      <div className="p-4 flex-1 overflow-y-auto">
        <nav className="flex-1 space-y-2 text-sm mt-15 ">
          {/* Dashboard */}
          <Link
            href="/admin"
            className={`flex w-full items-center gap-3 p-2 rounded font-medium transition-colors cursor-pointer
            ${isActive("/admin")
                ? "text-green-600 bg-green-50"
                : "text-gray-700 hover:text-green-600 hover:bg-gray-50"
              }`}
          >
            <FaChartPie size={14} /> Dashboard
          </Link>



          {/* Products */}
          <Link
            href="/admin/products"
            className={`flex w-full items-center gap-3 p-2 rounded font-medium transition-colors cursor-pointer whitespace-nowrap ${isActive("/admin/products")
              ? "text-green-600 bg-green-50"
              : "text-gray-700 hover:text-green-600 hover:bg-gray-50"
              }`}
          >
            <MdShoppingCart size={14} /> Products
          </Link>

          {/* Orders */}
          <Link
            href="/admin/orders"
            className={`flex w-full items-center gap-3 p-2 rounded font-medium transition-colors cursor-pointer whitespace-nowrap ${isActive("/admin/orders")
              ? "text-green-600 bg-green-50"
              : "text-gray-700 hover:text-green-600 hover:bg-gray-50"
              }`}
          >
            <FaShoppingBag size={14} /> Orders
          </Link>

          {/* Product Purchase Manage */}
          <Link
            href="/admin/product-purchase-manage"
            className={`flex w-full items-center gap-3 p-2 rounded font-medium transition-colors cursor-pointer whitespace-nowrap ${isActive("/admin/product-purchase-manage")
              ? "text-green-600 bg-green-50"
              : "text-gray-700 hover:text-green-600 hover:bg-gray-50"
              }`}
          >
            <FaShoppingBag size={14} /> Product Purchase Manage
          </Link>

          {/* Categories */}
          <Link
            href="/admin/categories"
            className={`flex w-full items-center gap-3 p-2 rounded font-medium transition-colors cursor-pointer whitespace-nowrap ${isActive("/admin/categories")
              ? "text-green-600 bg-green-50"
              : "text-gray-700 hover:text-green-600 hover:bg-gray-50"
              }`}
          >
            <BiCategory size={14} /> Categories
          </Link>

          {/* Sellers */}
          <Link
            href="/admin/sellers"
            className={`flex w-full items-center gap-3 p-2 rounded font-medium transition-colors cursor-pointer whitespace-nowrap ${isActive("/admin/sellers")
              ? "text-green-600 bg-green-50"
              : "text-gray-700 hover:text-green-600 hover:bg-gray-50"
              }`}
          >
            <MdShoppingCart size={14} /> Sellers
          </Link>

          {/* Blogs */}
          {/* <button
          onClick={() => router.push("/admin/blogs")}
          className={`flex w-full items-center gap-3 p-2 rounded font-medium transition-colors cursor-pointer ${
            isActive("/admin/blogs")
              ? "text-indigo-600 bg-indigo-50"
              : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
          }`}
        >
          <FaUsers size={14} /> Blogs
        </button> */}

          {/* Coupons */}
          <Link
            href="/admin/coupons"
            className={`flex w-full items-center gap-3 p-2 rounded font-medium transition-colors cursor-pointer whitespace-nowrap ${isActive("/admin/coupons")
              ? "text-green-600 bg-green-50"
              : "text-gray-700 hover:text-green-600 hover:bg-gray-50"
              }`}
          >
            <RiCouponLine size={14} /> Coupons
          </Link>

          {/* Travel Partners */}
          <div>
            {menuItem("partners", "Travel Partners", <FaUmbrellaBeach size={14} />)}
            {openMenu === "partners" && (
              <div className="ml-8 mt-2 text-sm space-y-1 cursor-pointer">
                {[
                  { label: "All Partners", path: "/admin/partners", icon: <FaUmbrellaBeach size={12} /> },
                  { label: "Stays", path: "/admin/partners/stays", icon: <FaBed size={12} /> },
                  { label: "Tours", path: "/admin/partners/tours", icon: <FaPlaneDeparture size={12} /> },
                  { label: "Adventures", path: "/admin/partners/adventures", icon: <FaMountain size={12} /> },
                  { label: "Vehicle Rental", path: "/admin/partners/vehicle-rental", icon: <FaCar size={12} /> },
                ].map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex items-center gap-2 rounded px-2 py-1 transition-colors whitespace-nowrap ${isActive(item.path)
                      ? "text-green-600 bg-green-50"
                      : "text-gray-700 hover:text-green-600"
                      }`}
                  >
                    {item.icon}
                    <span className="truncate">{item.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Manage Bookings */}
          <div>
            {menuItem("bookings", "Manage Bookings", <FaPlaneDeparture size={14} />)}
            {openMenu === "bookings" && (
              <div className="ml-8 mt-2 text-sm space-y-1 cursor-pointer">
                {[
                  { label: "Stays", path: "/admin/bookings/stays", icon: <FaBed size={12} /> },
                  { label: "Tours", path: "/admin/bookings/tours", icon: <FaPlaneDeparture size={12} /> },
                  { label: "Adventures", path: "/admin/bookings/adventures", icon: <FaMountain size={12} /> },
                  { label: "Vehicle Rental", path: "/admin/bookings/vehicle-rental", icon: <FaCar size={12} /> },
                ].map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex items-center gap-2 rounded px-2 py-1 transition-colors whitespace-nowrap ${isActive(item.path)
                      ? "text-green-600 bg-green-50"
                      : "text-gray-700 hover:text-green-600"
                      }`}
                  >
                    {item.icon}
                    <span className="truncate">{item.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/admin/cancellation"
            className={`flex w-full items-center gap-3 p-2 rounded font-medium transition-colors cursor-pointer whitespace-nowrap ${isActive("/admin/cancellation")
              ? "text-green-600 bg-green-50"
              : "text-gray-700 hover:text-green-600 hover:bg-gray-50"
              }`}
          >
            <FaTimesCircle size={14} /> Order Cancellation
          </Link>

          {/* <button
          onClick={() => router.push("/admin/admin-product-cancellations")}
          className={`flex w-full items-center gap-3 p-2 rounded font-medium transition-colors cursor-pointer whitespace-nowrap ${
            isActive("/admin/admin-product-cancellations")
              ? "text-indigo-600 bg-indigo-50"
              : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
          }`}
        >
          <MdCancelPresentation size={14} /> Admin Product Cancellations
        </button> */}

          {/* Accounting */}
          <div>
            {menuItem("accounting", "Accounting", <FaMoneyCheckAlt size={14} />)}
            {openMenu === "accounting" && (
              <div className="ml-8 mt-2 text-sm space-y-1 cursor-pointer">
                {[
                  { label: "Transactions", path: "/admin/transactions", icon: <FaMoneyCheckAlt size={12} /> },
                  { label: "Invoices", path: "/admin/invoices", icon: <FaFileAlt size={12} /> },
                  
                  // { label: "Refunds", path: "/admin/accounting/refunds", icon: <FaTimesCircle size={12} /> },
                ].map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex items-center gap-2 rounded px-2 py-1 transition-colors whitespace-nowrap ${isActive(item.path)
                      ? "text-green-600 bg-green-50"
                      : "text-gray-700 hover:text-green-600"
                      }`}
                  >
                    {item.icon}
                    <span className="truncate">{item.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Customers */}
          <div>
            {menuItem("customers", "Customers", <FaUsers size={14} />)}
            {openMenu === "customers" && (
              <div className="ml-8 mt-2 text-sm space-y-1">
                {[
                  { label: "All Customers", path: "/admin/customers", icon: <FaUsers size={12} /> },
                  { label: "Reviews", path: "/admin/reviews", icon: <TbLogs size={12} /> },
                ].map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex items-center gap-2 rounded px-2 py-1 transition-colors whitespace-nowrap ${isActive(item.path)
                      ? "text-green-600 bg-green-50"
                      : "text-gray-700 hover:text-green-600"
                      }`}
                  >
                    {item.icon}
                    <span className="truncate">{item.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Reports */}
          {/* <div>
          {menuItem("reports", "Reports", <FaFileAlt size={14} />)}
          {openMenu === "reports" && (
            <div className="ml-8 mt-2 text-sm space-y-1 cursor-pointer">
              {[
                { label: "Sales", path: "/admin/reports/sales", icon: <FaShoppingBag size={12} /> },
                { label: "Bookings", path: "/admin/reports/bookings", icon: <FaPlaneDeparture size={12} /> },
                { label: "Performance", path: "/admin/reports/performance", icon: <FaChartPie size={12} /> },
              ].map((item) => (
                <div
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  className={`flex items-center gap-2 rounded px-2 py-1 transition-colors whitespace-nowrap ${
                    isActive(item.path)
                      ? "text-green-600 bg-green-50"
                      : "text-gray-700 hover:text-green-600"
                  }`}
                >
                  {item.icon}
                  <span className="truncate">{item.label}</span>
                </div>
              ))}
            </div>
          )}
        </div> */}

          {/* Customer Support */}
          <Link
            href="/admin/support"
            className={`flex w-full items-center gap-3 p-2 rounded font-medium transition-colors cursor-pointer whitespace-nowrap ${isActive("/admin/support")
              ? "text-green-600 bg-green-50"
              : "text-gray-700 hover:text-green-600 hover:bg-gray-50"
              }`}
          >
            <FaComments size={14} /> Customer Support
          </Link>
          {/* Blogs */}
          <Link
            href="/admin/blogs"
            className={`flex w-full items-center gap-3 p-2 rounded font-medium transition-colors cursor-pointer whitespace-nowrap  ${isActive("/admin/blogs")
              ? "text-green-600 bg-green-50"
              : "text-gray-700 hover:text-green-600 hover:bg-gray-50"
              }`}
          >
            <TbLogs size={14} /> Blogs
          </Link>


        </nav>

        {/* Bottom Section */}
        <div className=" space-y-2 p-2 mt-10 ">
          <Link
            href="/admin/profile"
            className="flex items-center gap-3 w-full text-gray-700 hover:text-green-600 text-sm cursor-pointer"
          >
            <FaUserCircle size={14} /> Profile
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full text-gray-700 hover:text-red-600 text-sm cursor-pointer"
          >
            <TbLogout size={14} /> Logout
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;