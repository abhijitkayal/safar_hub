
"use client";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { motion } from "framer-motion";
import { Globe, Backpack, BadgeCheck } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import TestimonialSection from "../components/Pages/home/Testimonial";
import "swiper/css";
import "swiper/css/pagination";

/* ---------------- Advanced Counter Component ---------------- */
interface CounterProps {
  target: number;
  start: boolean;
}

const Counter: React.FC<CounterProps> = ({ target, start }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) {
      setCount(0);
      return;
    }

    const duration = 2000;
    const startTime = performance.now();

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentCount = Math.floor(target * progress);
      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    requestAnimationFrame(animate);
    return () => setCount(0);
  }, [start, target]);

  const formattedCount =
    target >= 1000 ? `${Math.floor(count / 1000)}K+` : `${count}+`;

  return <span>{formattedCount}</span>;
};

/* ---------------- Helper: One-time Animation Wrapper ---------------- */
type AnimateOnceProps = {
  children: React.ReactNode;
  className?: string;
  variants?: any;
  delay?: number;
};

const AnimateOnce: React.FC<AnimateOnceProps> = ({
  children,
  className,
  variants,
  delay = 0,
}) => {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (inView && !hasAnimated) setHasAnimated(true);
  }, [inView, hasAnimated]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={hasAnimated ? "visible" : "hidden"}
      variants={variants || { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
      suppressHydrationWarning
    >
      {children}
    </motion.div>
  );
};

/* ---------------- Main HomePage Component ---------------- */
export default function HomePage() {
  const tours = [
    { img: "/aboutpage/T2.jpeg", title: "Enjoy the Beauty of the Rialto Bridge", price: "₹3400" },
    { img: "/aboutpage/t1.jpeg", title: "Enjoy the Beauty of the Floating City", price: "₹3000" },
    { img: "/aboutpage/t5.jpeg", title: "Enjoy the Beauty of the Floating City", price: "₹3800" },
    { img: "/aboutpage/t6.jpg", title: "Enjoy the Beauty of Brazil City", price: "₹3900" },
    { img: "/aboutpage/Villa.jpeg", title: "Enjoy the Beauty of the Floating City", price: "₹4200" },
  ];

  const swiperRef = useRef<any>(null);

  /* --- Stats Section (shared counter trigger) --- */
  const { ref: statsRef, inView: statsInView } = useInView({
    threshold: 0.3,
    triggerOnce: false,
  });
  const [statsAnimated, setStatsAnimated] = useState(false);
  useEffect(() => {
    if (statsInView && !statsAnimated) setStatsAnimated(true);
  }, [statsInView, statsAnimated]);

  const stats = [
    { num: 100, label: "Happy Guests" },
    { num: 50, label: "Destinations" },
    { num: 25, label: " verified Partners" },
  ];

  return (
    <div className="bg-sky-50">
      <div className="max-w-7xl mx-auto pt-16 md:pt-24 pb-10 lg:px-1.5 px-6">

        {/* HERO SECTION */}
       <section className="relative">
  <AnimateOnce>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-15 justify-center">
      
      {/* Left Content */}
      <div className="space-y-6">
        <span className="text-sm font-semibold text-green-600 flex items-center gap-2 justify-center lg:justify-start">
          <span className="w-8 h-px bg-green-600" /> Explore The India
        </span>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-[#0d1b44] lg:text-left text-center">
          Discover Your Perfect Journey With SafarHub
        </h1>

        <p className="text-gray-800 max-w-md lg:text-left text-center">
          SafarHub is your trusted travel companion, offering cozy stays, curated tours, thrilling adventure activities, and flexible vehicle rentals across top destinations.
        </p>

        <p className="text-gray-800 max-w-md lg:text-left text-center">
          Our mission is to make travel simple, seamless, and memorable by providing diverse choices, transparent service, and exceptional customer support every step of the way.
        </p>
      </div>

      {/* Right Image */}
      <div className="flex ">
        <Image
          src="/DSC_0101.JPG"
          alt="Explore the world"
          width={800}
          height={800}
          className="relative z-10 rounded-3xl shadow-2xl h-full"
        />
      </div>

    </div>
  </AnimateOnce>
</section>


        {/* VALUES SECTION */}
        <section className="pt-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            <div className="lg:pr-8">
              <AnimateOnce delay={0}>
                <h2 className="text-3xl md:text-4xl font-bold text-[#0d1b44] mb-3">
                  Top Values For You
                </h2>
                <p className="text-gray-500 text-sm mb-12">
                  Try a variety of benefits when using our services.
                </p>
              </AnimateOnce>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: <Globe className="w-8 h-8 text-green-600" />, title: "Lot Of Choices", desc: " From Rooms, Travel Packages to Vehicles and Travel Essential Products, we have all." },
                { icon: <Backpack className="w-8 h-8 text-green-600" />, title: "Best Tour Guide", desc: "Best Partners” and description: We have the Best Verified Partners who can offer the best Experience." },
                { icon: <BadgeCheck className="w-8 h-8 text-green-600" />, title: "Easy Booking", desc: "Fast and Simple Booking or Shopping Proccess.." },
              ].map((item, i) => (
                <AnimateOnce key={i} delay={i * 0.1}>
                <div className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition flex flex-col items-start h-full">
                  <div className="mb-2">{item.icon}</div>
                  <h3 className="font-semibold text-base text-[#0d1b44]">{item.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                </div>
              </AnimateOnce>
              ))}
            </div>
          </div>
        </section>

        {/* DESTINATION SLIDER */}
        <section className="pt-20">
          <AnimateOnce>
            <div className="flex flex-col lg:flex-row lg:justify-between justify-start items-start lg:items-center mb-8 gap-4">
              <h2 className="text-3xl md:text-4xl font-bold text-[#0d1b44] text-left">
                Explore Top Destination
              </h2>

              {/* Mobile Buttons */}
              <div className="flex md:hidden gap-2">
                <button
                  onClick={() => swiperRef.current?.slidePrev()}
                  className="w-9 h-9 rounded-full border border-gray-400 flex items-center justify-center text-black"
                >←</button>
                <button
                  onClick={() => swiperRef.current?.slideNext()}
                  className="w-9 h-9 rounded-full bg-green-600 text-white flex items-center justify-center"
                >→</button>
              </div>

              {/* Desktop Buttons */}
              <div className="hidden md:flex gap-2">
                <button
                  onClick={() => swiperRef.current?.slidePrev()}
                  className="w-10 h-10 rounded-full border border-gray-400 flex items-center justify-center hover:bg-gray-100 text-black"
                >←</button>
                <button
                  onClick={() => swiperRef.current?.slideNext()}
                  className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center"
                >→</button>
              </div>
            </div>
          </AnimateOnce>

          <Swiper
            onBeforeInit={(swiper) => (swiperRef.current = swiper)}
            spaceBetween={24}
            slidesPerView={1.2}
            autoplay={{ delay: 2000, disableOnInteraction: false }}
            pagination={{
                clickable: true,
                bulletClass: "swiper-pagination-bullet !bg-green-600",
              }}
            modules={[Autoplay, Pagination]}
            breakpoints={{
              640: { slidesPerView: 2, spaceBetween: 20 },
              768: { slidesPerView: 2.5 },
              1024: { slidesPerView: 3 },
              1280: { slidesPerView: 4 },
            }}
            className="pb-12"
          >
            {tours.map((tour, i) => (
              <SwiperSlide key={i}>
                <AnimateOnce delay={i * 0.05}>
                  <div className="group cursor-pointer py-10">
                    <div className="relative rounded-2xl overflow-hidden shadow-lg">
                      <Image
                        src={tour.img}
                        alt={tour.title}
                        width={400}
                        height={300}
                        className="w-full h-64 object-cover group-hover:scale-105 transition duration-300"
                      />
                      <span className="absolute top-4 right-4 bg-white text-sm font-bold px-4 py-1.5 rounded-full shadow text-black">
                        {tour.price}
                      </span>
                    </div>
                    <p className="mt-4 font-semibold text-sm text-[#0d1b44] line-clamp-2">
                      {tour.title}
                    </p>
                  </div>
                </AnimateOnce>
              </SwiperSlide>
            ))}
          </Swiper>
        </section>

        {/* EXPERIENCE SECTION WITH COUNTER */}
        <section className="pt-20">
          <div className="flex lg:flex-row flex-col lg:gap-40 gap-10 items-center justify-center">
            <div className="relative flex justify-center">
              <AnimateOnce>
                <Image
                  src="/aboutpage/Lady-rating.jpg"
                  alt="Happy customer"
                  width={400}
                  height={400}
                  className="relative z-10 rounded-3xl shadow-2xl w-3xl"
                />
              </AnimateOnce>
            </div>

            <div className="space-y-6 items-start">
              <AnimateOnce>
                <span className="text-sm font-semibold text-green-600">Our Experience</span>
                <h2 className="text-3xl md:text-4xl font-bold text-[#0d1b44]">
                  With Our Experience We Will Serve You
                </h2>
                <p className="text-gray-500 text-sm">
                  Since we first opened we have always prioritized the convenience of our users by providing the best service and quality tours.
                </p>
              </AnimateOnce>

              {/* Counters Grid */}
              <motion.div
                ref={statsRef}
                className="grid grid-cols-3 gap-4 mt-8"
                initial={{ opacity: 0, y: 30 }}
                animate={statsAnimated ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                {stats.map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ y: 20, opacity: 0 }}
                    animate={statsAnimated ? { y: 0, opacity: 1 } : {}}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className="bg-white p-6 rounded-2xl shadow-md text-center"
                  >
                    <p className="text-2xl font-bold text-[#0d1b44]">
                      <Counter target={stat.num} start={statsInView} />
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>
        </div>
        <div className="pt-15">
        <TestimonialSection />
        </div>

      
<section className="max-w-4xl mx-auto px-6 py-20 text-center">
  <AnimateOnce>
    <div className="bg-linear-to-r from-lime-400 to-green-400 text-white rounded-3xl shadow-xl p-10 md:p-16">
      <h2 className="text-3xl md:text-4xl font-bold text-[#0d1b44] mb-3">
        Prepare Yourself & Let's Explore The Beauty Of The World
      </h2>
      <p className="text-gray-700 text-sm mb-8">
        We have many special offers especially for you.
      </p>

      <Link href="/services">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-4 bg-green-50 text-black font-semibold rounded-xl shadow-lg hover:shadow-xl transition cursor-pointer hover:bg-green-100"
        >
          Get Started
        </motion.button>
      </Link>
    </div>
  </AnimateOnce>
</section>
    </div>
  );
}