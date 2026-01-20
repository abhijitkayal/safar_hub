import Image from "next/image";
import HeroSection from "./components/Pages/home/Hero";
import TourCategories from "./components/Pages/home/Categories";
import PopularTour from "./components/Pages/home/PropularTour";
import Opertunity from "./components/Pages/home/Oppertunity";
import Stats from "./components/Pages/home/Stats"
import OffersSection from "./components/Pages/home/OffersSection";
import TestimonialSection from "./components/Pages/home/Testimonial";
import dbConnect from "@/lib/config/database";
import RecentGallerySection from "./components/Pages/home/RecentGallery";
import TravelHeroSection from "./components/Pages/home/TravelHero";

export default async function Home() {
  // Initialize database connection on page load
  await dbConnect();
  
  return (
    <div className="w-full bg-sky-50 overflow-x-hidden ">
     <HeroSection/>
     <TourCategories/>
     <PopularTour/>
     <Opertunity/>
     <Stats/>
     <OffersSection/>
     <TestimonialSection/>

     <RecentGallerySection/>
     <TravelHeroSection/>
    </div>
  );
}
