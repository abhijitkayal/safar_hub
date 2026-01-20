"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  FaBed,
  FaCompass,
  FaMountain,
  FaCarSide,
  FaCaravan,
  FaHiking,
  FaRoute,
  FaWater,
  FaHome,
  FaDoorOpen,
  FaSuitcaseRolling,
  FaUsers,
  FaHotel,
  FaCoffee,
  FaBiking,
  FaUser,
} from "react-icons/fa";
import { TbTent } from "react-icons/tb";

const filters = [
  { id: "all", label: "All" },
  { id: "stays", label: "Stays" },
  { id: "tours", label: "Tours" },
  { id: "adventures", label: "Adventures" },
  { id: "vehicle-rental", label: "Vehicle Rentals" },
] as const;

const services = [
  {
    id: "stays",
    title: "Comfortable Stays",
    description: "Handpicked rooms, homestays, and boutique hotels across the region.",
    href: "/stays",
    accent: "from-emerald-50 to-emerald-100",
    iconBg: "bg-emerald-100 text-emerald-600",
    icon: <FaBed className="text-2xl" />,
    subServices: [
      { label: "Rooms", href: "/stays?category=rooms", icon: <FaDoorOpen /> },
      { label: "Homestays", href: "/stays?category=homestays", icon: <FaHome /> },
      { label: "BnBs", href: "/stays?category=bnbs", icon: <FaCoffee /> },
      { label: "Hotels", href: "/stays?category=hotels", icon: <FaHotel /> },
    ],
  },
  {
    id: "tours",
    title: "Curated Tours",
    description: "Guided experiences and themed journeys for every travel style.",
    href: "/tours",
    accent: "from-sky-50 to-blue-100",
    iconBg: "bg-sky-100 text-sky-600",
    icon: <FaCompass className="text-2xl" />,
    subServices: [
      { label: "Group Tours", href: "/tours?category=group-tours", icon: <FaUsers /> },
      { label: "Tour Packages", href: "/tours?category=tour-packages", icon: <FaSuitcaseRolling /> },
    ],
  },
  {
    id: "adventures",
    title: "Thrilling Adventures",
    description: "High-adrenaline experiences from the valleys to the peaks.",
    href: "/adventures",
    accent: "from-orange-50 to-amber-100",
    iconBg: "bg-orange-100 text-orange-600",
    icon: <FaMountain className="text-2xl" />,
    subServices: [
      { label: "Trekking", href: "/adventures?category=trekking", icon: <FaHiking /> },
      { label: "Hiking", href: "/adventures?category=hiking", icon: <FaRoute /> },
      { label: "Camping", href: "/adventures?category=camping", icon: <TbTent /> },
      { label: "Water Rafting", href: "/adventures?category=water-rafting", icon: <FaWater /> },
    ],
  },
  {
    id: "vehicle-rental",
    title: "Vehicle Rentals",
    description: "Bikes, SUVs, and chauffeur-driven rides on demand.",
    href: "/vehicle-rental",
    accent: "from-purple-50 to-violet-100",
    iconBg: "bg-purple-100 text-purple-600",
    icon: <FaCarSide className="text-2xl" />,
    subServices: [
      { label: "Cars", href: "/vehicle-rental?category=cars", icon: <FaCarSide /> },
      { label: "Bikes", href: "/vehicle-rental?category=bikes", icon: <FaBiking /> },
      { label: "Car with Driver", href: "/vehicle-rental?category=car-with-driver", icon: <FaUser /> },
    ],
  },
];

const ServicesPage = () => {
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]["id"]>("all");

  const filteredServices = useMemo(() => {
    if (activeFilter === "all") return services;
    return services.filter((service) => service.id === activeFilter);
  }, [activeFilter]);

  return (
    <main className="bg-slate-50 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-2">
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-[0.3em] text-green-600 font-semibold mt-10">
            Our Services
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mt-3">
            Everything you need for the perfect escape
          </h1>
          <p className="text-base md:text-lg text-slate-600 mt-4 max-w-3xl mx-auto">
            Switch between categories to discover curated stays, guided tours, thrilling adventures,
            and flexible vehicle rentals—all crafted to make travel seamless.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-14">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 shadow-sm ${
                activeFilter === filter.id
                  ? "bg-green-600 text-white border-green-600 shadow-green-100"
                  : "bg-white text-slate-600 border-slate-200 hover:border-green-400"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className={`rounded-3xl p-8 bg-linear-to-br ${service.accent} border border-white shadow-xl shadow-slate-100/70`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${service.iconBg}`}>
                  {service.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">{service.title}</h2>
                  <p className="text-sm text-slate-600 mt-1">{service.description}</p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {service.subServices.map((sub) => (
                  <Link
                    key={sub.label}
                    href={sub.href}
                    className="group flex items-center gap-3 rounded-2xl bg-white/80 px-4 py-3 border border-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition"
                  >
                    <span className="text-green-600 text-lg">{sub.icon}</span>
                    <span className="text-slate-700 font-medium group-hover:text-green-600">
                      {sub.label}
                    </span>
                  </Link>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Link
                  href={service.href}
                  className="inline-flex items-center justify-center rounded-xl bg-green-600 text-white px-5 py-3 font-medium shadow-lg shadow-green-200 hover:bg-green-700 transition"
                >
                  Explore {service.title}
                </Link>
                <p className="text-sm text-slate-500">
                  {service.subServices.length} curated options available
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default ServicesPage;
