"use client";

import Image from "next/image";
import Link from "next/link";
import { FaUserFriends, FaUmbrellaBeach } from "react-icons/fa";

import { motion } from "framer-motion";

const HERO_IMAGE_PATH = "/heropic2.JPG";

export default function AdventureSection() {
  return (
    <section className="bg-sky-50 pt-24  flex flex-col md:flex-row items-center justify-center gap-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-2">
      <div className=" grid lg:grid-cols-2 gap-10 grid-cols-1 w-full">

        {/* ✅ LEFT IMAGE COLUMN */}
        <div className="flex gap-4 lg:flex-row flex-col items-center">

          <div className="grid gap-4">

            {/* ✅ Image comes from LEFT */}
            <motion.div
              initial={{ x: -120, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="relative w-60 h-72 rounded-xl overflow-hidden shadow-lg"
            >
              <Image
                src="/DSC_0082.JPG"
                alt="Adventure destination"
                fill
                className="object-cover hover:scale-110 transition-transform duration-500"
              />
            </motion.div>

           {/* ✅ Box comes from BOTTOM */}
<Link href="/services/products">
  <motion.div
    initial={{ y: 120, opacity: 0 }}
    whileInView={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.7 }}
    viewport={{ once: true }}
    className="bg-green-600 text-white rounded-xl flex items-center justify-center w-60 h-24 text-lg font-semibold shadow-md cursor-pointer"
  >
    Our Shop
  </motion.div>
</Link>
          </div>

          {/* ✅ Big image comes from TOP */}
          <motion.div
            initial={{ y: -120, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="relative w-80 h-100 rounded-xl overflow-hidden shadow-lg"
            suppressHydrationWarning
          >
            <Image
              src={HERO_IMAGE_PATH}
              alt="Traveler exploring"
              fill
              className="object-cover hover:scale-110 transition-transform duration-500"
              priority
            />
          </motion.div>
        </div>

        {/* ✅ RIGHT CONTENT */}
        <div className="text-left relative">

          {/* ✅ Plane animation — float + fade */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="absolute -top-12 -right-12 hidden md:block"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
            >
              <Image
                src="/home/homepage6.png"
                alt="Plane Illustration"
                width={100}
                height={100}
              />
            </motion.div>
          </motion.div>

          {/* ✅ Middle content (subheading + heading + text) */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <p className="text-green-600 font-medium mb-2 lg:text-left text-center">
              Start Exploring
            </p>

            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Great Opportunity for <br /> Adventure & Travels
            </h2>

            <p className="text-gray-600 mb-6 leading-relaxed">
              Explore new destinations, cultures, and breathtaking landscapes.
              Whether you’re seeking relaxation or adrenaline, there’s always
              something for every traveler to enjoy and cherish forever.
            </p>
          </motion.div>

          {/* ✅ Features come from RIGHT */}
          <motion.div
            initial={{ x: 120, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8"
          >
            <div className="flex items-start gap-3">
              <FaUserFriends className="text-green-600 text-2xl mt-1" />
              <div>
                <h4 className="text-lg font-semibold text-gray-800">
                  Trusted Partners
                </h4>
                <p className="text-gray-500 text-sm">
                 Get Services from our Partners who are Trusted, Verified and the best in the market.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FaUmbrellaBeach className="text-green-600 text-2xl mt-1" />
              <div>
                <h4 className="text-lg font-semibold text-gray-800">
                  Memorable Holidays
                </h4>
                <p className="text-gray-500 text-sm">
                  Explore top-rated destinations with the best amenities.
                </p>
              </div>
            </div>
          </motion.div>

         {/* ✅ Button */}
<motion.div
  initial={{ y: 120, opacity: 0 }}
  whileInView={{ y: 0, opacity: 1 }}
  transition={{ duration: 0.7 }}
  viewport={{ once: true }}
  className="flex items-center gap-6"
>
  <Link href="/services">
    <button className="bg-green-600 text-white px-6 py-3 rounded-full font-medium shadow-md hover:bg-green-700 transition cursor-pointer">
      Book Now
    </button>
  </Link>
</motion.div>

        </div>
        </div>
      </div>
    </section>
  );
}
