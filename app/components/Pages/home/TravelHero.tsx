"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { IconType } from "react-icons";
import { FaBed, FaCompass, FaMountain, FaCar } from "react-icons/fa";
import { MdShoppingCart } from "react-icons/md";

// Image paths as constants to ensure consistency
const IMAGE_PATHS = {
  main: "/DSC_0164.JPG",
  topLeft: "/DSC_0283.JPG",
  bottomLeft: "/DSC_0353.JPG",
} as const;

// Shared spring configuration
const springTransition = {
  type: "spring" as const,
  stiffness: 120,
  damping: 14,
};

// Define variants
const createImageVariants = (delay: number): Variants => ({
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      ...springTransition,
      delay,
    },
  },
});

const services: Array<{
  href: string;
  label: string;
  Icon: IconType;
}> = [
    { href: "/stays", label: "Stays", Icon: FaBed },
    { href: "/tours", label: "Tours", Icon: FaCompass },
    { href: "/adventures", label: "Adventures", Icon: FaMountain },
    { href: "/vehicle-rental", label: "Vehicle Rental", Icon: FaCar },
    { href: "/services/products", label: "Shop", Icon: MdShoppingCart },
  ];

const TravelHeroSection: React.FC = () => {
  const imageVariants = createImageVariants(0.2);
  const smallImageVariants = createImageVariants(0.4);
  const smallerImageVariants = createImageVariants(0.6);

  return (
    <section className="bg-sky-50 py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-2">
        <div className="relative bg-linear-to-r from-lime-400 to-green-400 text-white rounded-3xl overflow-hidden p-10 flex flex-col lg:flex-row justify-between items-center gap-8">
          {/* Left Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative z-10 w-full lg:w-2/3 text-center lg:text-left"
          >
            <h1 className="text-3xl md:text-5xl font-bold leading-snug mb-6 text-black">
              Start your Journey With <br className="hidden md:block" /> a
              Single Click
            </h1>
            {/* Service Icons */}
            <div className="w-full">
              {/* Desktop / Tablet: single row */}
              <div className="hidden md:flex items-center justify-start gap-4 md:gap-6">
                {services.map((service) => (
                  <ServiceCard key={service.label} {...service} />
                ))}
              </div>
              {/* Mobile layout: first row 3 cards */}
              <div className="grid grid-cols-3 gap-4 justify-items-center md:hidden">
                {services.slice(0, 3).map((service) => (
                  <ServiceCard key={service.label} {...service} size="sm" />
                ))}
              </div>
              {/* Mobile layout: second row centered 2 cards */}
              <div className="flex justify-center gap-4 mt-4 md:hidden">
                {services.slice(3).map((service) => (
                  <ServiceCard key={service.label} {...service} size="sm" />
                ))}
              </div>
            </div>

          </motion.div>

          {/* Floating Circular Images - Large Screens (lg+) */}
          <div className="relative w-full lg:w-1/3 flex justify-center">
            <div className="relative w-[280px] h-[280px] md:w-[420px] md:h-[420px] hidden lg:block">
              {/* Main Large Circle */}
              <motion.div
                variants={imageVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="absolute right-0 top-1/2 -translate-y-1/2 w-40 h-40 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-white shadow-lg"
                suppressHydrationWarning
              >
                <Image
                  src={IMAGE_PATHS.main}
                  alt="Travel destination 1"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 160px, 256px"
                />
              </motion.div>

              {/* Top-left Smaller Circle */}
              <motion.div
                variants={smallImageVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="absolute top-20 left-16 w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden border-4 border-white shadow-lg"
                suppressHydrationWarning
              >
                <Image
                  src={IMAGE_PATHS.topLeft}
                  alt="Travel destination 2"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 112px, 144px"
                />
              </motion.div>

              {/* Bottom-left Smaller Circle */}
              <motion.div
                variants={smallerImageVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="absolute bottom-10 left-20 w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white shadow-lg"
                suppressHydrationWarning
              >
                <Image
                  src={IMAGE_PATHS.bottomLeft}
                  alt="Travel destination 3"
                  fill
                  className="object-cover"
                  priority
                />
              </motion.div>
            </div>

            {/* Floating Circular Images - Small/Medium Screens */}
            <div className="relative w-[280px] h-[280px] md:w-[420px] md:h-[420px] block lg:hidden">
              {/* Main Large Circle */}
              <motion.div
                variants={imageVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-40 h-40 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-white shadow-lg"
                suppressHydrationWarning
              >
                <Image
                  src={IMAGE_PATHS.main}
                  alt="Travel destination 1"
                  fill
                  className="object-cover"
                  priority
                />
              </motion.div>

              {/* Top-left Smaller Circle */}
              <motion.div
                variants={smallImageVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="absolute top-10 left-3 w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden border-4 border-white shadow-lg"
                suppressHydrationWarning
              >
                <Image
                  src={IMAGE_PATHS.topLeft}
                  alt="Travel destination 2"
                  fill
                  className="object-cover"
                  priority
                />
              </motion.div>

              {/* Bottom-left Smaller Circle */}
              <motion.div
                variants={smallerImageVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="absolute bottom-5 left-12 w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white shadow-lg"
                suppressHydrationWarning
              >
                <Image
                  src={IMAGE_PATHS.bottomLeft}
                  alt="Travel destination 3"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 96px, 128px"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TravelHeroSection;

type ServiceCardProps = {
  href: string;
  label: string;
  Icon: IconType;
  size?: "sm" | "md";
};

const ServiceCard: React.FC<ServiceCardProps> = ({
  href,
  label,
  Icon,
  size = "md",
}) => {
  const base = size === "md" ? "w-28 h-28 md:w-32 md:h-32" : "w-24 h-24";
  return (
    <Link
      href={href}
      className={`${base} flex flex-col items-center justify-center bg-green-50 hover:bg-green-100 rounded-xl transition-all duration-300 hover:scale-105 group`}
    >
      <Icon
        className={`mb-2 text-green-600 ${size === "md" ? "text-2xl md:text-3xl" : "text-xl"} transition-colors`}
      />
      <span className="text-sm md:text-base font-medium text-green-600">
        {label}
      </span>
    </Link>
  );
};