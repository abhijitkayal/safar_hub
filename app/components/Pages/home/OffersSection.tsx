"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function OffersSection() {
  const offers = [
    {
      title: "Exclusive Deal on Trekking",
      image: "/DSC_0382.JPG",
      discount: "5% off",
      tag: "Limited Offer",
    },
    {
      title: " Save on Tour Packages",
      image: "/DSC_0410.JPG",
      discount: "6% off",
      tag: "Early Booking",
    },
    {
      title: "Explore the mountains with rental cars.",
      image: "/DSC_0353.JPG",
      discount: "5% off",
      tag: "Special Season",
    },
  ];

  return (
    <section className="bg-sky-50 py-15 relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-2">
        {/* Airplane line icon */}
        {/* <div className="absolute left-8 top-8">
          <Image
            src="/offers/Plane5.png"
            alt="Plane Path"
            width={100}
            height={100}
            className="opacity-80"
          />
        </div> */}

        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-green-600 font-medium">Special Offers</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Offers To Inspire You
          </h2>
        </motion.div>

        {/* Offer Cards */}
        <div className="flex flex-wrap justify-center gap-12">
          {offers.map((offer, index) => {
            // LEFT - CENTER - RIGHT animations
            const animations = [
              { x: -120, opacity: 0 }, // Left
              { scale: 0.6, opacity: 0 }, // Center
              { x: 120, opacity: 0 }, // Right
            ];

            return (
              <motion.div
                key={index}
                initial={animations[index]}
                whileInView={{ x: 0, opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                viewport={{ once: true }}
                className="relative w-[389px] h-[220px] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                {/* Background Image */}
                <Image
                  src={offer.image}
                  alt={offer.title}
                  fill
                  className="object-cover brightness-75 transition-transform duration-500 hover:scale-110"
                />

                {/* Dark overlay */}
                <div className="absolute inset-0 bg-black/30" />

                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  {/* Top Tag */}
                  <span className="bg-green-600 text-xs px-3 py-1 rounded-full">
                    {offer.tag}
                  </span>

                  {/* Title */}
                  <h3 className="text-lg font-semibold mt-3 leading-snug">
                    {offer.title}
                  </h3>

                  {/* Discount */}
                  <p className="text-3xl font-bold mt-2">{offer.discount}</p>
                  <p className="text-sm text-gray-200">On select packages</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
