"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import logo from "@/public/logo.png";
import Image from "next/image";
import {
  FaBars,
  FaTimes,
  FaBed,
  FaCompass,
  FaCarSide,
  FaDoorOpen,
  FaHome,
  FaCoffee,
  FaHotel,
  FaUsers,
  FaUser,
  FaRoute,
  FaHiking,
  FaMountain,
  FaShip,
  FaBicycle,
  FaArrowRight,
  FaChevronRight,
  FaBiking,
  FaChevronDown,
  FaChevronUp,
  FaCampground,
  FaSuitcaseRolling,
  FaCar,
} from "react-icons/fa";
import { MdShoppingCart } from "react-icons/md";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<{
    fullName: string;
    avatar?: string;
    accountType?: "user" | "vendor" | "admin";
  } | null>(null);

  // ✅ Keep navbar in sync with auth changes and route changes
  useEffect(() => {
    const fetchMe = async () => {
      try {
        // Check localStorage first (covers fixed admin and quick reflect)
        const stored = localStorage.getItem("user");
        if (stored) {
          const parsed = JSON.parse(stored);
          setUser(parsed);
        } else {
          setUser(null);
        }

        // Then verify server session (cookie) to hydrate fresh user data
        const res = await fetch("/api/profile", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (data.success) setUser(data.user);
        }
      } catch (_) {}
    };

    // Initial load
    fetchMe();

    // React to custom auth events (login/logout from any component)
    const onAuthChanged = (e: any) => {
      const nextUser = e?.detail ?? null;
      setUser(nextUser);
    };
    window.addEventListener("auth:changed", onAuthChanged as EventListener);

    return () => {
      window.removeEventListener("auth:changed", onAuthChanged as EventListener);
    };
  }, []);

  // Refetch on route change to stay fresh after redirects like /login -> /profile
  useEffect(() => {
    const refreshOnPathChange = async () => {
      try {
        const res = await fetch("/api/profile", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setUser(data.user);
            return;
          }
        }
        // Fallback to localStorage if no session
        const stored = localStorage.getItem("user");
        setUser(stored ? JSON.parse(stored) : null);
      } catch {
        const stored = localStorage.getItem("user");
        setUser(stored ? JSON.parse(stored) : null);
      }
    };
    refreshOnPathChange();
  }, [pathname]);

  /* ----------  Avatar Component ---------- */
  const UserAvatar = ({ size = 44 }: { size?: number }) => {
    if (user?.avatar) {
      return (
        <Image
          src={user.avatar}
          alt={user.fullName}
          width={size}
          height={size}
          className="object-cover rounded-full"
          style={{ width: size, height: size }}
        />
      );
    }
    const first = user?.fullName?.trim().charAt(0).toUpperCase() ?? "U";
    return (
      <div
        className="flex items-center justify-center text-white font-bold rounded-full"
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

  /* ----------  Services Data ---------- */
  
   const mainServices = [
    {
      id: "stays",
      name: "Stays",
      subtext: "Cozy places to stay",
      href: "/stays",
      icon: <FaBed />,
      subServices: [
        { name: "Rooms", href: "/stays?category=rooms", icon: <FaDoorOpen /> },
        { name: "Homestays", href: "/stays?category=homestays", icon: <FaHome /> },
        { name: "BnBs", href: "/stays?category=bnbs", icon: <FaCoffee /> },
        { name: "Hotels", href: "/stays?category=hotels", icon: <FaHotel /> },
      ],
    },
    {
      id: "tours",
      name: "Tours",
      subtext: "Memorable journeys",
      href: "/tours",
      icon: <FaCompass />,
      subServices: [
        { name: "Group Tours", href: "/tours?category=group-tours", icon: <FaUsers /> },
        { name: "Tour Packages", href: "/tours?category=tour-packages", icon: <FaSuitcaseRolling /> },
      ],
    },
    {
      id: "adventures",
      name: "Adventures",
      subtext: "Adrenaline rush",
      href: "/adventures",
      icon: <FaMountain />,
      subServices: [
        { name: "Trekking", href: "/adventures?category=trekking", icon: <FaRoute /> },
        { name: "Hiking", href: "/adventures?category=hiking", icon: <FaHiking /> },
        { name: "Camping", href: "/adventures?category=camping", icon: <FaCampground /> },
        { name: "Water Rafting", href: "/adventures?category=water-rafting", icon: <FaShip /> },
      ],
    },
    {
      id: "vehicle-rental",
      name: "Vehicle Rental",
      subtext: "Freedom to explore",
      href: "/vehicle-rental",
      icon: <FaCar />,
      subServices: [
        { name: "Cars", href: "/vehicle-rental?category=cars", icon: <FaCarSide /> },
        { name: "Bikes", href: "/vehicle-rental?category=bikes", icon: <FaBiking /> },
        { name: "Car with Driver", href: "/vehicle-rental?category=car-with-driver", icon: <FaUser /> },
      ],
    },
    {
      id: "products",
      name: "Products",
      subtext: "Travel essentials",
      href: "/products",
      icon: <MdShoppingCart  />,
      subServices: [
        { name: "Pahar", href: "/products", icon: <MdShoppingCart />, image: "/nav/pahar.webp" },
        { name: "Jacket", href: "/products", icon: <MdShoppingCart />, image: "/nav/jacket.webp" },
        { name: "T-Shirt", href: "/products", icon: <MdShoppingCart />, image: "/nav/t-shirt.webp" },
      ],
    },
  ];

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: "About", href: "/about-us" },
    { label: "Blogs", href: "/blogs" },
    { label: "Contact", href: "/contact-us" },
  ];

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname === path || pathname.startsWith(path + "/");
  };

  /* ---------- Hover Logic ---------- */
  const openDropdown = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setIsServicesOpen(true);
  };

  const closeDropdown = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsServicesOpen(false);
    }, 200);
  };

  useEffect(() => {
    if (isServicesOpen && !hoveredCategory) setHoveredCategory("stays");
    else if (!isServicesOpen) setHoveredCategory(null);
  }, [isServicesOpen, hoveredCategory]);

  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 w-full z-99 bg-transparent"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-2 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="cursor-pointer">
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex items-center bg-green-950 rounded-full px-4 lg:py-2 py-1 shadow-md cursor-pointer"
          >
            <Image
              src={logo}
              alt="Logo"
              width={50}
              height={50}
              className="rounded-full h-8.5 w-auto bg-green-950"
            />
          </motion.div>
        </Link>

        {/* Mobile Menu Button */}
        <motion.button
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="md:hidden text-gray-800 bg-white p-3 rounded-full shadow-md"
          onClick={() => setIsOpen(true)}
        >
          <FaBars size={18} />
        </motion.button>

        {/* Desktop Menu */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="hidden md:flex items-center bg-white rounded-full shadow-md px-6 py-3 space-x-8 border border-gray-200"
        >
          {navItems.map((item) => {
            if (item.label === "Services") {
              return (
                <div
                  key={item.href}
                  className="relative"
                  onMouseEnter={openDropdown}
                  onMouseLeave={closeDropdown}
                >
                  <Link
                    href={item.href}
                    className="relative group flex flex-col items-center"
                  >
                    <div className="flex items-center gap-1">
                      <span
                        className={`text-base font-bold transition-all duration-300 ${
                          isActive(item.href)
                            ? "text-green-600"
                            : "text-gray-600 group-hover:text-green-600"
                        }`}
                      >
                        {item.label}
                      </span>
                      {isServicesOpen ? (
                        <FaChevronUp className="text-xs text-green-600" />
                      ) : (
                        <FaChevronDown className="text-xs text-gray-500 group-hover:text-green-600 transition-colors" />
                      )}
                    </div>
                  </Link>

                  {/* Mega Menu */}
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{
                      opacity: isServicesOpen ? 1 : 0,
                      y: isServicesOpen ? 0 : -10,
                      scale: isServicesOpen ? 1 : 0.95,
                    }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className={`absolute left-1/2 -translate-x-1/2 mt-4 w-2xl backdrop-blur-3xl border-b border-white/20 rounded-2xl shadow-2xl border overflow-x-hidden max-h-[80vh] overflow-y-auto ${
                      isServicesOpen
                        ? "pointer-events-auto"
                        : "pointer-events-none"
                    }`}
                    style={{ top: "100%" }}
                    onMouseEnter={openDropdown}
                    onMouseLeave={closeDropdown}
                  >
                    <div className="p-8">
                      <div className="flex gap-12">
                        {/* Left Categories */}
                        <div className="w-60 shrink-0 space-y-4 pr-6 border-r border-white/20">
                          {mainServices.map((service) => (
                            <div
                              key={service.id}
                              className={`group flex items-center gap-4 p-5 rounded-xl cursor-pointer transition-all duration-300 ${
                                hoveredCategory === service.id
                                  ? "bg-white/70 shadow-lg border border-green-200/50 text-green-700"
                                  : "bg-white/50 hover:bg-white/70 border border-transparent hover:border-white/40 text-gray-700"
                              }`}
                              onMouseEnter={() => setHoveredCategory(service.id)}
                              onClick={() => {
                                setIsServicesOpen(false);
                                router.push(service.href);
                              }}
                            >
                              <div className="shrink-0 w-11 h-11 rounded-lg bg-linear-to-br from-green-500 to-lime-500 flex items-center justify-center text-white shadow-md">
                                {service.icon}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-sm leading-5">
                                  {service.name}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {service.subtext}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Right Sub Services */}
                        <div className="flex-1 pl-6 min-w-0">
                          {hoveredCategory ? (
                            (() => {
                              const category = mainServices.find(
                                (s) => s.id === hoveredCategory
                              );
                              if (!category) return null;
                              return (
                                <div className="space-y-8">
                                  <div className="flex items-center gap-6 p-6 bg-white/70 backdrop-blur-sm rounded-xl border border-white/40 shadow-sm">
                                    <div className="shrink-0 w-20 h-20 rounded-xl bg-linear-to-br from-green-500 to-lime-500 flex items-center justify-center text-white text-3xl shadow-lg">
                                      {category.icon}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <h3 className="text-2xl font-bold text-gray-900 leading-tight">
                                        {category.name}
                                      </h3>
                                      <p className="mt-2 text-sm text-gray-600">
                                        {category.subtext}
                                      </p>
                                    </div>
                                  </div>
                                  {category.id === "products" ? (
                                    <div className="space-y-6">
                                      <div className="grid grid-cols-3 gap-4">
                                        {category.subServices.map((sub: any) => (
                                          <Link
                                            key={`${sub.href}-${sub.name}`}
                                            href={sub.href}
                                            onClick={() => setIsServicesOpen(false)}
                                            className="group flex flex-col items-center p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-white/30 hover:border-green-200/50 hover:bg-white/80 transition-all duration-300 shadow-sm hover:shadow-lg"
                                          >
                                            {sub.image ? (
                                              <div className="shrink-0 w-20 h-20 rounded-xl overflow-hidden mb-4 shadow-lg">
                                                <Image
                                                  src={sub.image}
                                                  alt={sub.name}
                                                  width={80}
                                                  height={80}
                                                  className="w-full h-full object-cover"
                                                />
                                              </div>
                                            ) : (
                                              <div className="shrink-0 w-16 h-16 rounded-xl bg-linear-to-br from-green-500 to-lime-500 flex items-center justify-center text-white text-xl mb-6 shadow-lg">
                                                {sub.icon}
                                              </div>
                                            )}
                                            <p className="font-bold text-sm leading-5 text-gray-900 group-hover:text-green-600 text-center">
                                              {sub.name}
                                            </p>
                                          </Link>
                                        ))}
                                      </div>
                                      <Link
                                        href="/products"
                                        onClick={() => setIsServicesOpen(false)}
                                        className="flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl bg-linear-to-r from-green-500 to-lime-500 text-white font-bold hover:from-green-600 hover:to-lime-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                                      >
                                        <span>See More Products</span>
                                        <FaArrowRight />
                                      </Link>
                                    </div>
                                  ) : (
                                    <div className="grid grid-cols-2 gap-6">
                                      {category.subServices.map((sub) => (
                                        <Link
                                          key={sub.href}
                                          href={sub.href}
                                          onClick={() => setIsServicesOpen(false)}
                                          className="group flex flex-col items-center p-6 rounded-xl bg-white/60 backdrop-blur-sm border border-white/30 hover:border-green-200/50 hover:bg-white/80 transition-all duration-300 shadow-sm hover:shadow-lg"
                                        >
                                          <div className="shrink-0 w-16 h-16 rounded-xl bg-linear-to-br from-green-500 to-lime-500 flex items-center justify-center text-white text-xl mb-6 shadow-lg">
                                            {sub.icon}
                                          </div>
                                          <p className="font-bold text-sm leading-5 text-gray-900 group-hover:text-green-600 text-center">
                                            {sub.name}
                                          </p>
                                        </Link>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })()
                          ) : (
                            <div className="flex flex-col items-center justify-center py-16 px-8 text-center bg-white/60 backdrop-blur-sm rounded-xl border border-white/30 shadow-sm">
                              <div className="w-32 h-32 bg-linear-to-br from-green-400/30 to-lime-400/30 rounded-full flex items-center justify-center mb-8 shadow-lg">
                                <FaCompass className="w-20 h-20 text-green-500" />
                              </div>
                              <h3 className="text-xl font-bold text-gray-900 mb-4">
                                Explore Our Services
                              </h3>
                              <p className="max-w-2xl mx-auto text-sm text-gray-600 leading-relaxed">
                                Hover over a category on the left to discover curated stays,
                                tours, adventures, and vehicle rentals.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative group flex flex-col items-center"
              >
                <span
                  className={`text-base font-bold transition-all duration-300 ${
                    isActive(item.href)
                      ? "text-green-600"
                      : "text-gray-600 group-hover:text-green-600"
                  }`}
                >
                  {item.label}
                </span>

                {!isActive(item.href) && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-7 h-0.5 bg-linear-to-r from-lime-600 via-green-500 to-lime-300 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center rounded-full"></span>
                )}

                {isActive(item.href) && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-7 h-0.5 bg-green-600 rounded-full"></span>
                )}
              </Link>
            );
          })}
        </motion.div>

       {/* ========== DESKTOP AUTH (with Logout) ========== */}
<motion.div
  initial={{ y: 40, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ duration: 0.6, delay: 0.35 }}
  className="hidden md:flex items-center space-x-3"
>
  {!user ? (
    <>
      <Link href="/login">
        <button className="px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-full text-base font-bold hover:bg-gray-50 transition shadow-md cursor-pointer">
          Log In
        </button>
      </Link>
      <Link href="/signup">
        <button className="px-4 py-3 bg-linear-to-r from-lime-400 to-green-400 text-white rounded-full text-base font-bold hover:from-lime-500 hover:to-green-500 transition shadow-md cursor-pointer">
          Sign Up
        </button>
      </Link>
    </>
  ) : (
    <div className="flex items-center gap-3">
      {user.accountType === "admin" ? (
        <button
          onClick={() => router.push("/admin")}
          className="px-5 py-3 bg-green-950 text-white rounded-full font-bold shadow-md hover:bg-green-900 cursor-pointer"
        >
          Admin
        </button>
      ) : (
        <>
          {user.accountType === "user" && (
            <button
              onClick={() => router.push("/profile/cart")}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-green-600 text-white shadow-md transition hover:bg-green-700"
              aria-label="Go to cart"
            >
              <MdShoppingCart size={18} />
            </button>
          )}
          <div className="relative group">
            <button
              onClick={() => {
                const accountType = user.accountType;
                router.push(accountType === "vendor" ? "/vendor" : "/profile");
              }}
              className="flex items-center justify-center w-11 h-11 rounded-full overflow-hidden ring-2 ring-green-400 ring-offset-2 transition-all hover:ring-green-500 hover:scale-105 cursor-pointer"
            >
              <UserAvatar />
            </button>
            {/* Tooltip */}
            <div className="absolute right-0 top-full mt-2 w-max opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none">
              <div className="bg-white rounded-lg shadow-lg py-2 px-4 whitespace-nowrap flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Hi,</span>
                <span className="text-sm font-semibold text-green-600 truncate max-w-[180px]">
                  {user.fullName}
                </span>
              </div>
              <div className="absolute -top-1 right-3 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-white"></div>
            </div>
          </div>
        </>
      )}
    </div>
  )}
</motion.div>
      
      </div>

      {/* ✅ MOBILE MENU */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } md:hidden flex`}
      >
        <div className="flex flex-col w-full">
          <div className="flex justify-end p-6">
            <button
              className="text-gray-700 p-2 bg-gray-100 rounded-full shadow"
              onClick={() => {
                setIsOpen(false);
                setMobileServicesOpen(false);
              }}
            >
              <FaTimes size={18} />
            </button>
          </div>

          <div className="px-6 space-y-6">
            {navItems.map((item) => {
              if (item.label === "Services") {
                return (
                  <button
                    key={item.href}
                    onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                    className="flex items-center justify-between w-full text-lg font-semibold text-gray-800 hover:text-green-600"
                  >
                    <span>Services</span>
                    {mobileServicesOpen ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="block text-lg font-semibold text-gray-800 hover:text-green-600"
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile Sliding Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: mobileServicesOpen ? 0 : "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute inset-y-0 right-0 w-full bg-linear-to-b from-white to-green-50/30 shadow-xl overflow-hidden"
          >
            <div className="p-6">
              <button
                onClick={() => setMobileServicesOpen(false)}
                className="mb-6 flex items-center gap-2 text-sm font-medium text-green-600 hover:text-green-700"
              >
                <FaChevronRight className="rotate-180" />
                Back to Menu
              </button>

              <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-8">
                {mainServices.map((service) => (
                  <div key={service.id} className="space-y-4">
                    <Link
                      href={service.href}
                      onClick={() => {
                        setIsOpen(false);
                        setMobileServicesOpen(false);
                      }}
                      className="flex items-center gap-4 p-4 bg-linear-to-r from-green-50 to-lime-50 rounded-xl shadow-sm transition-all duration-200 hover:bg-linear-to-r hover:from-green-100 hover:to-lime-100"
                    >
                      <div className="w-12 h-12 bg-linear-to-br from-green-500 to-lime-500 rounded-xl flex items-center justify-center text-white shadow-md">
                        {service.icon}
                      </div>
                      <div className="flex flex-col gap-1">
                        <h4 className="font-bold text-gray-900 flex items-center gap-2">
                          {service.name}
                          <FaArrowRight className="text-sm text-green-600" />
                        </h4>
                        <p className="text-xs text-gray-600">{service.subtext}</p>
                      </div>
                    </Link>

                    <div className="space-y-2">
                      {service.subServices.map((sub) => (
                        <Link
                          key={`${sub.href}-${sub.name}`}
                          href={sub.href}
                          onClick={() => {
                            setIsOpen(false);
                            setMobileServicesOpen(false);
                          }}
                          className="flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-100 hover:border-green-200 hover:bg-green-50/60 transition-all duration-200 shadow-sm"
                        >
                          {"image" in sub && sub.image ? (
                            <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                              <Image src={sub.image} alt={sub.name} width={48} height={48} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <span className="text-green-500">{sub.icon}</span>
                          )}
                          <span className="font-medium text-gray-700">{sub.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
{/* ========== MOBILE AUTH (with Logout) ========== */}
<div className="absolute bottom-8 left-6 right-6 flex gap-3">
  {!user ? (
    <>
      <Link href="/login" className="flex-1" onClick={() => setIsOpen(false)}>
        <button className="w-full py-3 bg-gray-100 border border-gray-300 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-50 transition shadow-sm cursor-pointer">
          Log In
        </button>
      </Link>
      <Link href="/signup" className="flex-1" onClick={() => setIsOpen(false)}>
        <button className="w-full py-3 bg-linear-to-r from-lime-400 to-green-400 text-white rounded-full text-sm font-medium hover:from-lime-500 hover:to-green-500 transition shadow-md cursor-pointer">
          Sign Up
        </button>
      </Link>
    </>
  ) : (
    <div className="flex gap-3 w-full">
      {user.accountType === "admin" ? (
        <button
          onClick={() => {
            setIsOpen(false);
            router.push("/admin");
          }}
          className="flex-1 py-3 bg-green-600 text-white rounded-full text-sm font-semibold shadow-md hover:bg-green-700"
        >
          Admin
        </button>
      ) : (
        <>
          {user.accountType === "user" && (
            <button
              onClick={() => {
                setIsOpen(false);
                router.push("/profile/cart");
              }}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-green-600 text-white shadow-md hover:bg-green-700 transition"
              aria-label="Go to cart"
            >
              <MdShoppingCart size={20} />
            </button>
          )}
          <button
            onClick={() => {
              setIsOpen(false);
              const accountType = user.accountType;
              router.push(accountType === "vendor" ? "/vendor" : "/profile");
            }}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-green-300 text-green-700 rounded-full text-sm font-medium hover:bg-green-50 transition shadow-sm"
          >
            <div className="w-9 h-9 rounded-full overflow-hidden shrink-0">
              <UserAvatar size={36} />
            </div>
            <span className="truncate text-sm">{user.fullName.split(" ")[0]}</span>
          </button>
        </>
      )}
    </div>
  )}
</div>
      </div>

      {isOpen && (
        <div
              className={`fixed inset-0 z-40 md:hidden ${
                mobileServicesOpen ? "bg-black/60" : "bg-black/40"
              }`}
          onClick={() => {
            setIsOpen(false);
            setMobileServicesOpen(false);
          }}
        />
      )}
    </motion.nav>
  );
};

export default Navbar;