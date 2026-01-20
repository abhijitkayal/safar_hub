"use client";

import React from "react";
import Image from "next/image";
import { FaRegCalendarAlt, FaRegComments } from "react-icons/fa";
import { motion } from "framer-motion";

interface Article {
  id: number;
  title: string;
  image: string;
  category: string;
  date: string;
  comments: number;
  link: string;
}

const articles: Article[] = [
  {
    id: 1,
    title: "Fun Things with Guide to Planning Trip",
    image: "/activity/fun.jpg",
    category: "Travel",
    date: "June 15, 2025",
    comments: 12,
    link: "#",
  },
  {
    id: 2,
    title: "Best Experiences in NYC You Can’t Miss",
    image: "/activity/experiences.jpeg",
    category: "City Life",
    date: "July 03, 2025",
    comments: 8,
    link: "#",
  },
  {
    id: 3,
    title: "How to Travel Like a Local Around Europe",
    image: "/activity/Howtotravels.jpg",
    category: "Adventure",
    date: "August 22, 2025",
    comments: 5,
    link: "#",
  },
];

const RecentArticlesSection: React.FC = () => {
  return (
    <section className="bg-sky-50 pt-12 text-center">
      <div className="max-w-7xl mx-auto px-6 lg:px-0">

        {/* ✅ Heading Animation (from TOP) */}
        <motion.p
          initial={{ y: -80, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-cyan-500 font-semibold text-lg mb-2"
        >
          Our Blog
        </motion.p>

        <motion.h2
          initial={{ y: -100, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-gray-900 mb-11"
        >
          Recent Articles & Posts
        </motion.h2>

        {/* ✅ Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 justify-items-center ">
          {articles.map((article, index) => {
            // Motion rules:
            // Left card (index 0) → from TOP
            // Center card (index 1) → from BOTTOM
            // Right card (index 2) → from TOP
            const animations = [
              { y: -120, opacity: 0 }, // left
              { y: 120, opacity: 0 },  // center comes from bottom
              { y: -120, opacity: 0 }, // right
            ];

            return (
              <motion.div
                key={article.id}
                initial={animations[index]}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                viewport={{ once: true }}
                className="relative w-[320px] md:w-[380px] h-[400px] rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 group"
              >
                {/* Full Background Image */}
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Dark overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/40 to-transparent"></div>

                {/* Category */}
                <div className="absolute top-4 right-4 z-10">
                  <span className="bg-cyan-500 text-white text-xs font-semibold px-3 py-1 rounded-lg shadow-md">
                    {article.category}
                  </span>
                </div>

                {/* Overlay Content */}
                <div className="absolute bottom-0 w-full px-4 pb-4">
                  <div className="w-full rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white p-4">
                    <h3 className="text-lg font-semibold mb-3 leading-snug">
                      {article.title}
                    </h3>

                    <div className="flex items-center gap-4 text-sm text-gray-200 mb-4">
                      <div className="flex items-center gap-1">
                        <FaRegCalendarAlt className="text-cyan-400" />
                        <span>{article.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FaRegComments className="text-cyan-400" />
                        <span>{article.comments} Comments</span>
                      </div>
                    </div>

                    <a
                      href={article.link}
                      className="text-cyan-400 font-semibold hover:underline"
                    >
                      Read More →
                    </a>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default RecentArticlesSection;
