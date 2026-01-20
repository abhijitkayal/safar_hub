"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { FaGlobeAsia, FaUsers, FaMapMarkerAlt, FaPlane } from "react-icons/fa";
import { FaUserCheck, FaMap  } from "react-icons/fa"; 

import { useInView } from "react-intersection-observer";

/* ---------- Counter Animation ---------- */
interface CounterProps {
  target: number;
  start: boolean;
}
const Counter: React.FC<CounterProps> = ({ target, start }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;

    const duration = 2000;
    const startTime = performance.now();

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.floor(target * progress));
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);

    return () => setCount(0);
  }, [start, target]);

  return <span>{count}+</span>;
};

/* ---------- Main Component ---------- */
const TravelStatsSection: React.FC = () => {
  const { ref, inView } = useInView({
    triggerOnce: false, // counting will run every time ✅
    threshold: 0.3,
  });

  // ✅ New state to make motion animation run only ONCE
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (inView && !hasAnimated) {
      setHasAnimated(true);
    }
  }, [inView, hasAnimated]);

  return (
    <section className="relative pt-16 bg-sky-50">
      <div className="max-w-7xl mx-auto relative px-6 lg:px-2">
        {/* Background Image Wrapper */}
        <div className="relative rounded-2xl overflow-hidden shadow-2xl">
          <Image
            src="/DSC_0170.JPG"
            alt="Traveler Background"
            width={1400}
            height={800}
            className="w-full h-[500px] object-cover brightness-75"
          />

          {/* Overlay Content */}
          <div
            ref={ref as React.Ref<HTMLDivElement>}
            className="absolute inset-0 flex flex-col md:flex-row items-center justify-between gap-10 px-10 py-16"
          >
            {/* Stats Box */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={hasAnimated ? { scale: 1, opacity: 1 } : {}}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="relative bg-white shadow-lg rounded-2xl p-8 w-[280px] md:w-[340px]"
            >
              {/* Cross lines */}
              <div className="absolute inset-0">
                <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-[1.5px] z-0 bg-linear-to-b from-transparent via-gray-500 to-transparent" />
                <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-[1.5px] z-0 bg-linear-to-r from-transparent via-gray-500 to-transparent" />
              </div>

              <div className="grid grid-cols-2 gap-6 text-center relative z-10">
                <div>
                  <FaGlobeAsia className="text-green-600 text-3xl mx-auto mb-2" />
                  <h3 className="text-xl font-bold text-gray-800">
                    <Counter target={ 50} start={inView} />
                  </h3>
                  <p className="text-gray-500 text-sm">Destinations</p>
                </div>

                <div>
                  <FaUsers className="text-green-600 text-3xl mx-auto mb-2" />
                  <h3 className="text-xl font-bold text-gray-800">
                    <Counter target={100} start={inView} />
                  </h3>
                  <p className="text-gray-500 text-sm">Happy Tourists</p>
                </div>

                <div>
                  <FaMapMarkerAlt className="text-green-600 text-3xl mx-auto mb-2" />
                  <h3 className="text-xl font-bold text-gray-800">
                    <Counter target={50} start={inView} />
                  </h3>
                  <p className="text-gray-500 text-sm">Places Visited</p>
                </div>

                <div>
                  <FaUserCheck className="text-green-600 text-3xl mx-auto mb-2" />
                  <h3 className="text-xl font-bold text-gray-800">
                    <Counter target={25} start={inView} />
                  </h3>
                  <p className="text-gray-500 text-sm">Verified Partners</p>
                </div>
              </div>
            </motion.div>

            {/* Blue Circular Tag */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={hasAnimated ? { scale: 1, opacity: 1 } : {}}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
              className="bg-green-600 text-white rounded-full w-44 h-44 flex flex-col items-center justify-center text-center shadow-2xl p-3"
            >
              <p className="text-lg font-bold leading-tight">
                Travel <br />
                <span className=" font-bold italic text-sm">
                is the only thing you can buy that makes you richer.
                </span>
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TravelStatsSection;
