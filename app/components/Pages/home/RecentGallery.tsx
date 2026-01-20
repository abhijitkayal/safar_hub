"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const RecentGallerySection: React.FC = () => {
  return (
    <section className="bg-sky-50 pt-15">
      <div className="max-w-7xl mx-auto px-6 lg:px-2">

        {/* Header */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-green-600 font-semibold text-lg">It’s Your Travel Photo</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Recent Gallery
          </h2>
        </motion.div>

        {/* Gallery Grid */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:h-[500px] h-[1000px]">

          {/* Left Column */}
          <div className="grid gap-3">

            {/* Image 1 */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              viewport={{ once: true }}
              className="relative rounded-xl overflow-hidden group"
            >
              <Image
                src="/DSC_0131.JPG"
                alt="Gallery Image 1"
                fill
                className="object-cover group-hover:scale-110 transition duration-500"
              />
            </motion.div>

            {/* Image 4 + 5 */}
            <div className="relative grid grid-cols-2 gap-5 rounded-xl overflow-hidden">

              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                viewport={{ once: true }}
                className="relative group rounded-xl"
              >
                <Image
                  src="/DSC_0088.JPG"
                  alt="Gallery Image 4"
                  fill
                  className="object-cover group-hover:scale-105 transition duration-500 rounded-xl"
                />
              </motion.div>

              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                viewport={{ once: true }}
                className="relative group rounded-xl"
              >
                <Image
                  src="/DSC_0100.JPG"
                  alt="Gallery Image 5"
                  fill
                  className="object-cover group-hover:scale-105 transition duration-500 rounded-xl"
                />
              </motion.div>

            </div>
          </div>

          {/* Middle Column */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true }}
            className="relative col-span-1 rounded-xl overflow-hidden group"
          >
            <Image
              src="/DSC_0256.JPG"
              alt="Gallery Image 2"
              fill
              className="object-cover group-hover:scale-110 transition duration-500"
            />
          </motion.div>

          {/* Right Column */}
          <div className="grid gap-3">

            {/* Image 3 */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              viewport={{ once: true }}
              className="relative col-span-1 rounded-xl overflow-hidden group"
            >
              <Image
                src="/DSC_0064.JPG"
                alt="Gallery Image 3"
                fill
                className="object-cover group-hover:scale-110 transition duration-500"
              />
            </motion.div>

            {/* Image 6 */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              viewport={{ once: true }}
              className="relative col-span-1 rounded-xl overflow-hidden group"
            >
              <Image
                src="/TCW09617.JPG"
                alt="Gallery Image 6"
                fill
                className="object-cover group-hover:scale-110 transition duration-500"
              />
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default RecentGallerySection;
