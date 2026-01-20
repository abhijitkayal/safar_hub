"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { IconType } from "react-icons";
import {
  FaDoorOpen,
  FaHome,
  FaCoffee,
  FaHotel,
  FaUsers,
  FaSuitcaseRolling,
  FaRoute,
  FaHiking,
  FaCampground,
  FaShip,
  FaCarSide,
  FaBiking,
} from "react-icons/fa";

type CategoryCard = {
  title: string;
  icon: IconType;
  href: string;
};
const tours: CategoryCard[] = [
  { title: "Rooms", icon: FaDoorOpen, href: "/stays?category=rooms" },
  { title: "Homestays", icon: FaHome, href: "/stays?category=homestays" },
  { title: "BnBs", icon: FaCoffee, href: "/stays?category=bnbs" },
  { title: "Hotels", icon: FaHotel, href: "/stays?category=hotels" },
  { title: "Group Tours", icon: FaUsers, href: "/tours?category=group-tours" },
  { title: "Tour Packages", icon: FaSuitcaseRolling, href: "/tours?category=tour-packages" },
];const tour2s: CategoryCard[] = [
  { title: "Trekking", icon: FaRoute, href: "/adventures?category=trekking" },
  { title: "Hiking", icon: FaHiking, href: "/adventures?category=hiking" },
  { title: "Camping", icon: FaCampground, href: "/adventures?category=camping" },
  { title: "Water Rafting", icon: FaShip, href: "/adventures?category=water-rafting" },
  { title: "Cars", icon: FaCarSide, href: "/vehicle-rental?category=cars" },
  { title: "Bikes", icon: FaBiking, href: "/vehicle-rental?category=bikes" },
];
// ✅ Animation direction for each card (desktop only)
const desktopAnim = [
  { x: -80, opacity: 0 }, // card 1 → left
  { x: -80, opacity: 0 }, // card 2 → left
  { y: -80, opacity: 0 }, // card 3 → top
  { y: -80, opacity: 0 }, // card 4 → top
  { x: 80, opacity: 0 },  // card 5 → right
  { x: 80, opacity: 0 },  // card 6 → right
];

export default function TourCategories() {
  const offsets = [
    "translate-y-0",
    "translate-y-8",
    "translate-y-16",
    "translate-y-16",
    "translate-y-8",
    "translate-y-0",
  ];

  return (
    <div className="bg-sky-50 ">
      
      <section className="relative flex flex-col items-center overflow-hidden max-w-7xl mx-auto py-15 px-6 lg:px-0 z-0 mt-10 lg:mt-2 ">

        {/* ✅ Plane icon with animation */}
        <motion.div
        
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute top-10 lg:left-70 left-5 opacity-70 lg:block hidden"
        >
          <Image
            src="/home/homepage4.png"
            alt="plane icon"
            width={50}
            height={50}
            className="animate-float h-30 w-30"
          />
        </motion.div>

        {/* ✅ Camera icon with animation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="absolute top-10 lg:right-70 right-10 opacity-70 lg:block hidden"
        >
          <Image
            src="/home/homepage5.png"
            alt="camera icon"
            width={100}
            height={100}
            className="animate-float-slow"
          />
        </motion.div>

        {/* ✅ Heading animation (come from left) */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <p className="text-white text-sm font-medium tracking-wider">
            We Offer You The Best
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
            Services Categories
          </h2>
        </motion.div>

        {/* ✅ DESKTOP CARDS (Animation added — design preserved) */}
        <div className="lg:block hidden pb-6">
          <div className="flex flex-wrap justify-center gap-4 ">
            {tours.map((tour, index) => (
              <motion.div
                key={tour.title}
                initial={desktopAnim[index]}
                whileInView={{ x: 0, y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: index * 0.1 }}
                className={`flex flex-col items-center text-center transition-transform duration-300 hover:scale-105 bg-linear-to-br from-green-500 to-lime-500 rounded-xl ${offsets[index]}`}
              >
                <Link href={tour.href} className="block w-full">
                  <CategoryIconCard title={tour.title} Icon={tour.icon} />
                </Link>
              </motion.div>
            ))}          </div>
        </div>

        {/* ✅ MOBILE CARDS (simple fade up – layout unchanged) */}
        <div className="block lg:hidden ">
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            {tours.map((tour, index) => (
              <motion.div
                key={tour.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="flex flex-col items-center text-center transition-transform duration-300 hover:scale-105"
              >
                <Link href={tour.href} className="block w-full">
                  <CategoryIconCard title={tour.title} Icon={tour.icon} compact />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>      </section>

      <section className="relative flex flex-col items-center overflow-hidden max-w-7xl mx-auto pb-15 px-6 lg:px-0 ">
        {/* ✅ DESKTOP CARDS (Animation added — design preserved) */}
        <div className="lg:block hidden pb-6">
          <div className="flex flex-wrap justify-center gap-4 ">
            {tour2s.map((tour, index) => (
              <motion.div
                key={tour.title}
                initial={desktopAnim[index]}
                whileInView={{ x: 0, y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: index * 0.1 }}
                className={`flex flex-col items-center text-center transition-transform duration-300 hover:scale-105 ${offsets[index]}`}
              >
                <Link href={tour.href} className="block w-full">
                  <CategoryIconCard title={tour.title} Icon={tour.icon} />
                </Link>
              </motion.div>
            ))}          </div>
        </div>

        {/* ✅ MOBILE CARDS (simple fade up – layout unchanged) */}
        <div className="block lg:hidden">
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            {tour2s.map((tour, index) => (
              <motion.div
                key={tour.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="flex flex-col items-center text-center transition-transform duration-300 hover:scale-105"
              >
                <CategoryIconCard title={tour.title} Icon={tour.icon} compact />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

const CategoryIconCard: React.FC<{
  title: string;
  Icon: IconType;
  compact?: boolean;
}> = ({ title, Icon, compact = false }) => {
  const baseSize = compact ? "w-40 h-40" : "w-49 h-49";
  return (
    <div
      className={`relative ${baseSize} rounded-xl shadow-md bg-linear-to-br from-green-500 to-lime-500 flex flex-col items-center justify-center text-center px-4`}
    >
      <Icon className="text-4xl text-white" />
      <h3 className="text-sm sm:text-base font-semibold text-white mt-2">
        {title}
      </h3>
    </div>
  );
};
