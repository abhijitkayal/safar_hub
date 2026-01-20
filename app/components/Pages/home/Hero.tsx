"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Typed from "typed.js";
import { useRouter } from "next/navigation";
import {

  FaCar,
  FaPlus,
  FaMinus,
  FaCompass,
  FaMountain,
  FaBed
} from "react-icons/fa";

import { BsCompass } from "react-icons/bs";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Menu, Dialog } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";

/* -------- TABS -------- */
type Tab = {
  label: string;
  icon?: React.ReactNode;
};

const tabs: Tab[] = [
  { label: "Stays", icon: <FaBed className="text-sm" /> },
  { label: "Tours", icon: <FaCompass className="text-sm" /> },
  { label: "Adventures", icon: <FaMountain className="text-sm" /> },
  { label: "Vehicle Rental", icon: <FaCar className="text-sm" /> },
];

/* ---------- LOCATION AUTOCOMPLETE DATA ---------- */
const wbLocations = [
  "Kolkata",
  "Darjeeling",
  "Kalimpong",
  "Siliguri",
  "Digha",
  "Sundarbans",
  "Mandarmani",
  "Shantiniketan",
  "Bakkhali",
  "Bankura",
];

const indiaLocations = [
  "Delhi",
  "Mumbai",
  "Bengaluru",
  "Chennai",
  "Hyderabad",
  "Goa",
  "Jaipur",
  "Udaipur",
  "Agra",
  "Pune",
  "Manali",
  "Shimla",
  "Rishikesh",
  "Varanasi",
  "Kochi",
  "Munnar",
  "Ooty",
  "Alleppey",
  "Mysuru",
  "Ahmedabad",
];

export default function HeroSection() {
  const [activeTab, setActiveTab] = useState<string>("Stays");

  /* ✅ Typed.js effect */
  useEffect(() => {
    const typed = new Typed(".role", {
      strings: [
        "Rooms",
        "Homestays",
        "BnBs",
        "Hotels",
        "Tours",
        "Group Tours",
        "Tour Packages",
        "Adventures",
        "Trekking",
        "Hiking",
        "Camping",
        "Water Rafting",
        "Vehicle Rentals",
        "Cars",
        "Bikes",

      ],
      typeSpeed: 80,
      backSpeed: 50,
      backDelay: 1000,
      loop: true,
    });

    return () => typed.destroy();
  }, []);

  /* ---------- BG SLIDESHOW STATE ---------- */
  const bgImages = ["/hero/hero1.jpg", "/hero/hero2.jpg", "/hero/hero3.jpg"];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % bgImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  /* ---------- STAYS STATE ---------- */
  const [location, setLocation] = useState<string>("");
  const [checkIn, setCheckIn] = useState<Date | null>(new Date());
  const [checkOut, setCheckOut] = useState<Date | null>(new Date());
  const [rooms, setRooms] = useState<number>(1);
  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(0);
  const [showLocationMenu, setShowLocationMenu] = useState(false);

  const totalGuests = adults + children;

  /* Render Forms */
  const renderTabContent = () => {
    switch (activeTab) {
      case "Stays":
        return (
          <StaysForm
            location={location}
            setLocation={setLocation}
            checkIn={checkIn}
            setCheckIn={setCheckIn}
            checkOut={checkOut}
            setCheckOut={setCheckOut}
            rooms={rooms}
            setRooms={setRooms}
            adults={adults}
            setAdults={setAdults}
            children={children}
            setChildren={setChildren}
            totalGuests={totalGuests}
            wbLocations={wbLocations}
            indiaLocations={indiaLocations}
            showLocationMenu={showLocationMenu}
            setShowLocationMenu={setShowLocationMenu}
          />
        );

      case "Tours":
        return (
          <ToursForm
            defaultLocation={location}
            wbLocations={wbLocations}
            indiaLocations={indiaLocations}
          />
        );

      case "Adventures":
        return (
          <AdventuresForm
            defaultLocation={location}
            wbLocations={wbLocations}
            indiaLocations={indiaLocations}
          />
        );

      case "Vehicle Rental":
        return (
          <VehicleRentalForm
            wbLocations={wbLocations}
            indiaLocations={indiaLocations}
          />
        );

      default:
        return null;
    }
  };

  return (

    <section className="relative z-60 w-full flex items-center justify-center  py-20">

      {/* ✅ AUTO-SWIPING BACKGROUND */}
      <div className="absolute inset-0">
        {bgImages.map((img, index) => (
          <Image
            key={index}
            src={img}
            alt="Hero Background"
            fill
            priority
            className={`object-cover object-center transition-opacity duration-1200 ease-in-out ${index === currentIndex ? "opacity-100" : "opacity-0"
              }`}
            sizes="100vw"
          />
        ))}
      </div>

      {/* Glass Frame */}
      <div className="elative z-20 w-[90%] h-[85vh] border-3 border-white rounded-3xl shadow-[0_8px_32px_rgba(31,38,135,0.37)] flex flex-col justify-between p-4 sm:p-6 md:p-10 max-w-7xl mx-auto">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col md:flex-row justify-between items-center gap-6 mt-6 mb-8"
        >
          <div className="flex items-center justify-center w-full">
            <h1 className="text-center lg:text-5xl text-4xl font-bold text-black leading-snug">
              SafarHub,The North Knows the Way. {" "} <br /> Find {" "}
              <span className="role text-lime-300 bg-green-950 p-2"></span>{" "}Deals
            </h1>
          </div>
        </motion.div>

        {/* Card With Tabs */}
        <div className="relative rounded-3xl overflow-visible border border-white shadow-lg text-black">

          {/* Tabs */}
          <div className="flex items-center justify-center px-2 sm:px-4 md:px-8 py-3 backdrop-blur-md border-b border-white/20 w-full relative z-0 rounded-t-3xl">
            <div className="grid grid-cols-2 md:flex gap-2 md:gap-4 justify-center w-full overflow-x-auto scrollbar-none">
              {tabs.map((tab) => (
                <button
                  key={tab.label}
                  onClick={() => setActiveTab(tab.label)}
                  className={`flex items-center gap-1.5 px-4 py-1.5 text-sm rounded-full transition-all duration-300 ${activeTab === tab.label
                      ? "bg-white text-black font-semibold"
                      : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Form */}
          <div className="bg-white rounded-b-3xl p-4 sm:p-5">{renderTabContent()}</div>
        </div>
      </div>
    </section>

  );
}

/* --------------------------------------------------------------
   STAYS FORM
-------------------------------------------------------------- */
type StaysFormProps = {
  location: string;
  setLocation: (v: string) => void;
  checkIn: Date | null;
  setCheckIn: (v: Date | null) => void;
  checkOut: Date | null;
  setCheckOut: (v: Date | null) => void;
  rooms: number;
  setRooms: (v: number) => void;
  adults: number;
  setAdults: (v: number) => void;
  children: number;
  setChildren: (v: number) => void;
  totalGuests: number;
  wbLocations: string[];
  indiaLocations: string[];
  showLocationMenu: boolean;
  setShowLocationMenu: (v: boolean) => void;
};

const StaysForm: React.FC<StaysFormProps> = ({
  location,
  setLocation,
  checkIn,
  setCheckIn,
  checkOut,
  setCheckOut,
  rooms,
  setRooms,
  adults,
  setAdults,
  children,
  setChildren,
  totalGuests,
  wbLocations,
  indiaLocations,
  showLocationMenu,
  setShowLocationMenu,
}) => {
  const router = useRouter();
  const [showGuests, setShowGuests] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const closeDetails = () => setDetailsOpen(false);
  const [modalSection, setModalSection] = useState<"location" | "guests" | null>(null);
  const filteredWB = wbLocations.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase())
  );
  const filteredIndia = indiaLocations.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase())
  );

  // Allow page scrolling even when dropdowns are open

  const locationLabel = location || "Where are you going?";
  const locationTextClass = location ? "text-gray-900" : "text-gray-400";

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 ">
      {/* LOCATION */}
      <div className="relative ">
        <p className="text-xs text-gray-500 uppercase mb-1">Location</p>
        <Menu as="div" className="relative">
          <Menu.Button
            onClick={() => {
              setShowLocationMenu(false);
              setModalSection("location");
              setDetailsOpen(true);
            }}
            className={`w-full text-left text-md font-bold ${locationTextClass} flex items-center justify-between`}
          >
            {locationLabel}
            <ChevronDownIcon className="w-5 h-5 ml-2 text-gray-600" />
          </Menu.Button>

          {showLocationMenu && (
            <Menu.Items
              static
              className="absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-[50vh] overflow-y-auto"
            >
              {/* Search input */}
              <div className="p-2 border-b sticky top-0 bg-white">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search location..."
                  className="w-full px-3 py-2 text-sm border rounded-md outline-none focus:ring-2 focus:ring-lime-500"
                />
              </div>
              {/* West Bengal group */}
              <div className="px-2 pt-2">
                <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">
                  West Bengal
                </div>
                {filteredWB.length === 0 && (
                  <div className="px-4 py-2 text-sm text-gray-500">No results</div>
                )}
                {filteredWB.map((city) => (
                  <Menu.Item key={`wb-${city}`}>
                    {({ active }) => (
                      <button
                        onClick={() => {
                          setLocation(city);
                          setShowLocationMenu(false);
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm ${active ? "bg-gray-100" : ""
                          }`}
                      >
                        {city}
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </div>
              {/* India group */}
              <div className="px-2 pt-2 pb-2">
                <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">
                  India
                </div>
                {filteredIndia.length === 0 && (
                  <div className="px-4 py-2 text-sm text-gray-500">No results</div>
                )}
                {filteredIndia.map((city) => (
                  <Menu.Item key={`in-${city}`}>
                    {({ active }) => (
                      <button
                        onClick={() => {
                          setLocation(city);
                          setShowLocationMenu(false);
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm ${active ? "bg-gray-100" : ""
                          }`}
                      >
                        {city}
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </div>
            </Menu.Items>
          )}
        </Menu>
      </div>

      {/* CHECK-IN */}
      <div>
        <p className="text-xs text-gray-500 uppercase mb-1">Check-in</p>
        <DatePicker
          selected={checkIn}
          onChange={(date) => setCheckIn(date)}
          dateFormat="dd MMM yy"
          popperClassName="z-50"
          className="w-full text-xl font-bold text-gray-900 border-b-2 border-transparent focus:border-lime-500 outline-none"
        />
      </div>

      {/* CHECK-OUT */}
      <div>
        <p className="text-xs text-gray-500 uppercase mb-1">Check-out</p>
        <DatePicker
          selected={checkOut}
          onChange={(date) => setCheckOut(date)}
          dateFormat="dd MMM yy"
          minDate={checkIn ?? undefined}
          popperClassName="z-50"
          className="w-full text-xl font-bold text-gray-900 border-b-2 border-transparent focus:border-lime-500 outline-none"
        />
      </div>

      {/* GUESTS */}
      <div>
        <p className="text-xs text-gray-500 uppercase mb-1">Guests</p>
        <Menu as="div" className="relative">
          <Menu.Button
            onClick={() => {
              setShowGuests(false);
              setModalSection("guests");
              setDetailsOpen(true);
            }}
            className="w-full text-left text-xl font-bold text-gray-900 flex items-center justify-between"
          >
            {rooms} {rooms === 1 ? "Room" : "Rooms"},{" "}
            {totalGuests} {totalGuests === 1 ? "Guest" : "Guests"}
            <ChevronDownIcon className="w-5 h-5 ml-2 text-gray-600" />
          </Menu.Button>

          {showGuests && (
            <Menu.Items
              static
              className="absolute z-50 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-h-[50vh] overflow-y-auto"
            >
              {/* Rooms */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Rooms</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setRooms(Math.max(1, rooms - 1))}
                    className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                  >
                    <FaMinus className="w-3 h-3" />
                  </button>
                  <span className="w-8 text-center">{rooms}</span>
                  <button
                    onClick={() => setRooms(rooms + 1)}
                    className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                  >
                    <FaPlus className="w-3 h-3" />
                  </button>
                </div>
              </div>
              {/* Adults */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Adults</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAdults(Math.max(1, adults - 1))}
                    className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                  >
                    <FaMinus className="w-3 h-3" />
                  </button>
                  <span className="w-8 text-center">{adults}</span>
                  <button
                    onClick={() => setAdults(adults + 1)}
                    className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                  >
                    <FaPlus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Children */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Children</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setChildren(Math.max(0, children - 1))}
                    className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                  >
                    <FaMinus className="w-3 h-3" />
                  </button>
                  <span className="w-8 text-center">{children}</span>
                  <button
                    onClick={() => setChildren(children + 1)}
                    className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                  >
                    <FaPlus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </Menu.Items>
          )}
        </Menu>
      </div>

      {/* SEARCH */}
      <div className="flex items-end">
        <button
          onClick={() => {
            const url = new URL("/stays", window.location.origin);
            if (location) url.searchParams.set("city", location);
            if (totalGuests) url.searchParams.set("guests", String(totalGuests));
            if (checkIn) url.searchParams.set("checkIn", checkIn.toISOString().slice(0, 10));
            if (checkOut) url.searchParams.set("checkOut", checkOut.toISOString().slice(0, 10));
            router.push(`${url.pathname}?${url.searchParams.toString()}`);
          }}
          className="w-full bg-linear-to-r from-lime-600 via-green-500 to-lime-300 text-black font-semibold py-2 rounded-full hover:scale-105 transition"
        >
          Search Stays
        </button>
      </div>
      <Dialog open={detailsOpen} onClose={closeDetails} className="relative z-1000">
        <div className="fixed inset-0 z-1000 bg-black/60" aria-hidden="true" />
        <div className="fixed inset-0 z-1001 flex items-center justify-center p-4">
          <Dialog.Panel className={`relative z-1002 w-full ${modalSection === "location" ? "max-w-sm" : "max-w-lg"} rounded-2xl bg-white p-6 shadow-2xl border border-gray-200`}>
            <button onClick={closeDetails} aria-label="Close" className="absolute top-3 right-3 inline-flex items-center justify-center rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 w-8 h-8">×</button>
            <Dialog.Title className="text-lg font-semibold text-black">
              {modalSection === "location" ? "Choose location" : "Choose guests"}
            </Dialog.Title>
            {modalSection === "location" && (
              <div className="mt-4 max-h-[60vh] overflow-y-auto">
                <div className="p-2 border-b sticky top-0 bg-white">
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search location..."
                    className="w-full px-3 py-2 text-sm border rounded-md outline-none focus:ring-2 focus:ring-lime-500 text-black"
                  />
                </div>
                <div className="px-2 pt-2">
                  <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">West Bengal</div>
                  {filteredWB.map((city) => (
                    <button
                      key={`wb-${city}`}
                      onClick={() => {
                        setLocation(city);
                        closeDetails();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-lime-50 text-black"
                    >
                      {city}
                    </button>
                  ))}
                </div>
                <div className="px-2 pt-2 pb-2">
                  <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">India</div>
                  {filteredIndia.map((city) => (
                    <button
                      key={`in-${city}`}
                      onClick={() => {
                        setLocation(city);
                        closeDetails();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-lime-50 text-black"
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {modalSection === "guests" && (
              <div className="mt-4 space-y-4 text-black">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Rooms</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setRooms(Math.max(1, rooms - 1))} className="p-1 rounded-full bg-gray-200 hover:bg-gray-300">
                      <FaMinus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center">{rooms}</span>
                    <button onClick={() => setRooms(rooms + 1)} className="p-1 rounded-full bg-gray-200 hover:bg-gray-300">
                      <FaPlus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Adults</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setAdults(Math.max(1, adults - 1))} className="p-1 rounded-full bg-gray-200 hover:bg-gray-300">
                      <FaMinus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center">{adults}</span>
                    <button onClick={() => setAdults(adults + 1)} className="p-1 rounded-full bg-gray-200 hover:bg-gray-300">
                      <FaPlus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Children</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setChildren(Math.max(0, children - 1))} className="p-1 rounded-full bg-gray-200 hover:bg-gray-300">
                      <FaMinus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center">{children}</span>
                    <button onClick={() => setChildren(children + 1)} className="p-1 rounded-full bg-gray-200 hover:bg-gray-300">
                      <FaPlus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="text-right text-xs text-gray-600">Total guests: {totalGuests}</div>
                <div className="mt-4 flex justify-end gap-3">
                  {/* <button onClick={closeDetails} className="rounded-full border px-4 py-2 text-sm">Close</button> */}
                </div>
              </div>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

/* --------------------------------------------------------------
   OTHER FORMS
-------------------------------------------------------------- */

const ToursForm: React.FC<{
  defaultLocation: string;
  wbLocations: string[];
  indiaLocations: string[];
}> = ({ defaultLocation, wbLocations, indiaLocations }) => {
  const router = useRouter();
  const [destination, setDestination] = useState<string>(defaultLocation || "");
  const [show, setShow] = useState(false);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [detailsOpen, setDetailsOpen] = useState(false);
  const closeDetails = () => setDetailsOpen(false);

  const filteredWB = wbLocations.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase())
  );
  const filteredIndia = indiaLocations.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase())
  );

  // Allow page scrolling even when dropdown is open

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="relative">
        <p className="text-xs text-gray-500 uppercase mb-1">Destination</p>
        <Menu as="div" className="relative">
          <Menu.Button
            onClick={() => {
              setShow(false);
              setDetailsOpen(true);
            }}
            className={`w-full text-left text-md font-bold ${destination ? "text-gray-900" : "text-gray-400"
              } flex items-center justify-between`}
          >
            {destination || "Where are you going?"}
            <ChevronDownIcon className="w-5 h-5 ml-2 text-gray-600" />
          </Menu.Button>
          {show && (
            <Menu.Items
              static
              className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-[50vh] overflow-y-auto"
            >
              <div className="p-2 border-b sticky top-0 bg-white">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search destination..."
                  className="w-full px-3 py-2 text-sm border rounded-md outline-none focus:ring-2 focus:ring-lime-500"
                />
              </div>
              <div className="px-2 pt-2">
                <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">West Bengal</div>
                {filteredWB.map((c) => (
                  <Menu.Item key={`tour-wb-${c}`}>
                    {({ active }) => (
                      <button
                        onClick={() => {
                          setDestination(c);
                          setShow(false);
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm ${active ? "bg-gray-100" : ""}`}
                      >
                        {c}
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </div>
              <div className="px-2 pt-2 pb-2">
                <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">India</div>
                {filteredIndia.map((c) => (
                  <Menu.Item key={`tour-in-${c}`}>
                    {({ active }) => (
                      <button
                        onClick={() => {
                          setDestination(c);
                          setShow(false);
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm ${active ? "bg-gray-100" : ""}`}
                      >
                        {c}
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </div>
            </Menu.Items>
          )}
        </Menu>
      </div>

      <div>
        <p className="text-xs text-gray-500 uppercase mb-1">Start Date</p>
        <DatePicker
          selected={startDate}
          onChange={(d) => {
            setStartDate(d);
            if (d && endDate && endDate < d) {
              setEndDate(d);
            }
          }}
          dateFormat="dd MMM yy"
          className="w-full text-xl font-bold text-gray-900 border-b-2 border-transparent focus:border-lime-500 outline-none"
        />
      </div>

      <div>
        <p className="text-xs text-gray-500 uppercase mb-1">End Date</p>
        <DatePicker
          selected={endDate}
          onChange={(d) => setEndDate(d)}
          minDate={startDate ?? undefined}
          dateFormat="dd MMM yy"
          className="w-full text-xl font-bold text-gray-900 border-b-2 border-transparent focus:border-lime-500 outline-none"
        />
      </div>

      <div className="flex items-end">
        <button
          onClick={() => {
            const url = new URL("/tours", window.location.origin);
            if (destination) url.searchParams.set("city", destination);
            if (startDate) url.searchParams.set("startDate", startDate.toISOString().slice(0, 10));
            if (endDate) url.searchParams.set("endDate", endDate.toISOString().slice(0, 10));
            router.push(`${url.pathname}?${url.searchParams.toString()}`);
          }}
          className="w-full bg-linear-to-r from-lime-600 via-green-500 to-lime-300 text-black font-semibold py-2 rounded-full hover:scale-105 transition"
        >
          Find Tours
        </button>
      </div>
      <Dialog open={detailsOpen} onClose={closeDetails} className="relative z-1000">
        <div className="fixed inset-0 z-1000 bg-black/60" aria-hidden="true" />
        <div className="fixed inset-0 z-1001 flex items-center justify-center p-4">
          <Dialog.Panel className="relative z-1002 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-gray-200">
            <button onClick={closeDetails} aria-label="Close" className="absolute top-3 right-3 inline-flex items-center justify-center rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 w-8 h-8">×</button>
            <Dialog.Title className="text-lg font-semibold text-black">Choose destination</Dialog.Title>
            <div className="mt-4 max-h-[60vh] overflow-y-auto">
              <div className="p-2 border-b sticky top-0 bg-white">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search destination..."
                  className="w-full px-3 py-2 text-sm border rounded-md outline-none focus:ring-2 focus:ring-lime-500 text-black"
                />
              </div>
              <div className="px-2 pt-2">
                <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">West Bengal</div>
                {filteredWB.map((c) => (
                  <button
                    key={`tour-wb-${c}`}
                    onClick={() => {
                      setDestination(c);
                      closeDetails();
                    }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-lime-50 text-black"
                  >
                    {c}
                  </button>
                ))}
              </div>
              <div className="px-2 pt-2 pb-2">
                <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">India</div>
                {filteredIndia.map((c) => (
                  <button
                    key={`tour-in-${c}`}
                    onClick={() => {
                      setDestination(c);
                      closeDetails();
                    }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-lime-50 text-black"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

const AdventuresForm: React.FC<{
  defaultLocation: string;
  wbLocations: string[];
  indiaLocations: string[];
}> = ({ defaultLocation, wbLocations, indiaLocations }) => {
  const router = useRouter();
  const [activity, setActivity] = useState<string>("");
  const [showActivity, setShowActivity] = useState<boolean>(false);
  const [destination, setDestination] = useState<string>(defaultLocation || "");
  const [show, setShow] = useState(false);
  const [search, setSearch] = useState("");
  const [groupSize, setGroupSize] = useState<number>(4);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const openDetails = () => setDetailsOpen(true);
  const closeDetails = () => setDetailsOpen(false);
  const [modalSection, setModalSection] = useState<"activity" | "location" | null>(null);

  const filteredWB = wbLocations.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase())
  );
  const filteredIndia = indiaLocations.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase())
  );

  // Allow page scrolling even when dropdowns are open

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div>
        <p className="text-xs text-gray-500 uppercase mb-1">Activity</p>
        <Menu as="div" className="relative">
          <Menu.Button
            onClick={() => {
              setShowActivity(false);
              setModalSection("activity");
              setDetailsOpen(true);
            }}
            className={`w-full text-left text-md font-bold ${activity ? "text-gray-900" : "text-gray-400"
              } flex items-center justify-between`}
          >
            {activity || "Choose activity"}
            <ChevronDownIcon className="w-5 h-5 ml-2 text-gray-600" />
          </Menu.Button>
          {showActivity && (
            <Menu.Items
              className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-[50vh] overflow-y-auto"
            >
              {["Trekking", "Rafting", "Camping", "Hiking"].map((a) => (
                <Menu.Item key={a}>
                  {({ active }) => (
                    <button
                      onClick={() => {
                        setActivity(a);
                        setShowActivity(false);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm ${active ? "bg-gray-100" : ""}`}
                    >
                      {a}
                    </button>
                  )}
                </Menu.Item>
              ))}
            </Menu.Items>
          )}
        </Menu>
      </div>

      <div className="relative">
        <p className="text-xs text-gray-500 uppercase mb-1">Location</p>
        <Menu as="div" className="relative">
          <Menu.Button
            onClick={() => {
              setShow(false);
              setModalSection("location");
              setDetailsOpen(true);
            }}
            className={`w-full text-left text-md font-bold ${destination ? "text-gray-900" : "text-gray-400"
              } flex items-center justify-between`}
          >
            {destination || "Where are you going?"}
            <ChevronDownIcon className="w-5 h-5 ml-2 text-gray-600" />
          </Menu.Button>
          {show && (
            <Menu.Items
              static
              className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-[50vh] overflow-y-auto"
            >
              <div className="p-2 border-b sticky top-0 bg-white">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search location..."
                  className="w-full px-3 py-2 text-sm border rounded-md outline-none focus:ring-2 focus:ring-lime-500"
                />
              </div>
              <div className="px-2 pt-2">
                <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">West Bengal</div>
                {filteredWB.map((c) => (
                  <Menu.Item key={`adv-wb-${c}`}>
                    {({ active }) => (
                      <button
                        onClick={() => {
                          setDestination(c);
                          setShow(false);
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm ${active ? "bg-gray-100" : ""}`}
                      >
                        {c}
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </div>
              <div className="px-2 pt-2 pb-2">
                <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">India</div>
                {filteredIndia.map((c) => (
                  <Menu.Item key={`adv-in-${c}`}>
                    {({ active }) => (
                      <button
                        onClick={() => {
                          setDestination(c);
                          setShow(false);
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm ${active ? "bg-gray-100" : ""}`}
                      >
                        {c}
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </div>
            </Menu.Items>
          )}
        </Menu>
      </div>

      <div>
        <p className="text-xs text-gray-500 uppercase mb-1">Group Size</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setGroupSize(Math.max(1, groupSize - 1))}
            className="p-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            <FaMinus className="w-3 h-3" />
          </button>
          <span className="text-xl font-bold w-16 text-center">{groupSize}</span>
          <button
            onClick={() => setGroupSize(groupSize + 1)}
            className="p-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            <FaPlus className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="flex items-end">
        <button
          onClick={() => {
            const url = new URL("/adventures", window.location.origin);
            if (destination) url.searchParams.set("city", destination);
            const map: Record<string, string> = {
              Trekking: "trekking",
              Hiking: "hiking",
              Camping: "camping",
              Rafting: "water-rafting",
            };
            const cat = map[activity];
            if (cat) url.searchParams.set("category", cat);
            router.push(`${url.pathname}?${url.searchParams.toString()}`);
          }}
          className="w-full bg-linear-to-r from-lime-600 via-green-500 to-lime-300 text-black font-semibold py-2 rounded-full hover:scale-105 transition"
        >
          Book Adventure
        </button>
      </div>
      <Dialog open={detailsOpen} onClose={closeDetails} className="relative z-1000">
        <div className="fixed inset-0 z-1000 bg-black/60" aria-hidden="true" />
        <div className="fixed inset-0 z-1001 flex items-center justify-center p-4">
          <Dialog.Panel className={`relative z-1002 w-full ${modalSection === "location" ? "max-w-sm" : "max-w-md"} rounded-2xl bg-white p-6 shadow-2xl border border-gray-200`}>
            <button onClick={closeDetails} aria-label="Close" className="absolute top-3 right-3 inline-flex items-center justify-center rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 w-8 h-8">×</button>
            <Dialog.Title className="text-lg font-semibold text-black">
              {modalSection === "activity" ? "Choose activity" : "Choose location"}
            </Dialog.Title>
            {modalSection === "activity" && (
              <div className="mt-4">
                {["Trekking", "Rafting", "Camping", "Hiking"].map((a) => (
                  <button
                    key={a}
                    onClick={() => {
                      setActivity(a);
                      closeDetails();
                    }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-lime-50 text-black"
                  >
                    {a}
                  </button>
                ))}
              </div>
            )}
            {modalSection === "location" && (
              <div className="mt-4 max-h-[60vh] overflow-y-auto">
                <div className="p-2 border-b sticky top-0 bg-white">
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search location..."
                    className="w-full px-3 py-2 text-sm border rounded-md outline-none focus:ring-2 focus:ring-lime-500 text-black"
                  />
                </div>
                <div className="px-2 pt-2">
                  <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">West Bengal</div>
                  {filteredWB.map((c) => (
                    <button
                      key={`adv-wb-${c}`}
                      onClick={() => {
                        setDestination(c);
                        closeDetails();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-lime-50 text-black"
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <div className="px-2 pt-2 pb-2">
                  <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">India</div>
                  {filteredIndia.map((c) => (
                    <button
                      key={`adv-in-${c}`}
                      onClick={() => {
                        setDestination(c);
                        closeDetails();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-lime-50 text-black"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

const VehicleRentalForm: React.FC<{
  wbLocations: string[];
  indiaLocations: string[];
}> = ({ wbLocations, indiaLocations }) => {
  const router = useRouter();
  const [pickup, setPickup] = useState<string>("");
  const [dropoff, setDropoff] = useState<string>("");
  const [showPickup, setShowPickup] = useState(false);
  const [showDropoff, setShowDropoff] = useState(false);
  const [searchPickup, setSearchPickup] = useState("");
  const [searchDropoff, setSearchDropoff] = useState("");
  const [pickupDate, setPickupDate] = useState<Date | null>(new Date());
  const [returnDate, setReturnDate] = useState<Date | null>(new Date());
  const [detailsOpen, setDetailsOpen] = useState(false);
  const openDetails = () => setDetailsOpen(true);
  const closeDetails = () => setDetailsOpen(false);
  const [modalSection, setModalSection] = useState<"pickup" | "dropoff" | null>(null);

  const filter = (list: string[], q: string) =>
    list.filter((c) => c.toLowerCase().includes(q.toLowerCase()));

  // Allow page scrolling even when dropdowns are open

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
      {/* Pick-up */}
      <div className="relative">
        <p className="text-xs text-gray-500 uppercase mb-1">Pick-up</p>
        <Menu as="div" className="relative">
          <Menu.Button
            onClick={() => {
              setShowPickup(false);
              setModalSection("pickup");
              setDetailsOpen(true);
            }}
            className={`w-full text-left text-md font-bold ${pickup ? "text-gray-900" : "text-gray-400"
              } flex items-center justify-between`}
          >
            {pickup || "Where to pick up?"}
            <ChevronDownIcon className="w-5 h-5 ml-2 text-gray-600" />
          </Menu.Button>
          {showPickup && (
            <Menu.Items
              static
              className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-[50vh] overflow-y-auto"
            >
              <div className="p-2 border-b sticky top-0 bg-white">
                <input
                  value={searchPickup}
                  onChange={(e) => setSearchPickup(e.target.value)}
                  placeholder="Search pick-up..."
                  className="w-full px-3 py-2 text-sm border rounded-md outline-none focus:ring-2 focus:ring-lime-500"
                />
              </div>
              {/* WB */}
              <div className="px-2 pt-2">
                <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">West Bengal</div>
                {filter(wbLocations, searchPickup).map((c) => (
                  <Menu.Item key={`pu-wb-${c}`}>
                    {({ active }) => (
                      <button
                        onClick={() => {
                          setPickup(c);
                          setShowPickup(false);
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm ${active ? "bg-gray-100" : ""}`}
                      >
                        {c}
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </div>
              {/* India */}
              <div className="px-2 pt-2 pb-2">
                <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">India</div>
                {filter(indiaLocations, searchPickup).map((c) => (
                  <Menu.Item key={`pu-in-${c}`}>
                    {({ active }) => (
                      <button
                        onClick={() => {
                          setPickup(c);
                          setShowPickup(false);
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm ${active ? "bg-gray-100" : ""}`}
                      >
                        {c}
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </div>
            </Menu.Items>
          )}
        </Menu>
      </div>

      {/* Drop-off */}
      <div className="relative">
        <p className="text-xs text-gray-500 uppercase mb-1">Drop-off</p>
        <Menu as="div" className="relative">
          <Menu.Button
            onClick={() => {
              setShowDropoff(false);
              setModalSection("dropoff");
              setDetailsOpen(true);
            }}
            className={`w-full text-left text-md font-bold ${dropoff ? "text-gray-900" : "text-gray-400"
              } flex items-center justify-between`}
          >
            {dropoff || "Where to return?"}
            <ChevronDownIcon className="w-5 h-5 ml-2 text-gray-600" />
          </Menu.Button>
          {showDropoff && (
            <Menu.Items
              static
              className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-[50vh] overflow-y-auto"
            >
              <div className="p-2 border-b sticky top-0 bg-white">
                <input
                  value={searchDropoff}
                  onChange={(e) => setSearchDropoff(e.target.value)}
                  placeholder="Search drop-off..."
                  className="w-full px-3 py-2 text-sm border rounded-md outline-none focus:ring-2 focus:ring-lime-500"
                />
              </div>
              {/* WB */}
              <div className="px-2 pt-2">
                <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">West Bengal</div>
                {filter(wbLocations, searchDropoff).map((c) => (
                  <Menu.Item key={`do-wb-${c}`}>
                    {({ active }) => (
                      <button
                        onClick={() => {
                          setDropoff(c);
                          setShowDropoff(false);
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm ${active ? "bg-gray-100" : ""}`}
                      >
                        {c}
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </div>
              {/* India */}
              <div className="px-2 pt-2 pb-2">
                <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">India</div>
                {filter(indiaLocations, searchDropoff).map((c) => (
                  <Menu.Item key={`do-in-${c}`}>
                    {({ active }) => (
                      <button
                        onClick={() => {
                          setDropoff(c);
                          setShowDropoff(false);
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm ${active ? "bg-gray-100" : ""}`}
                      >
                        {c}
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </div>
            </Menu.Items>
          )}
        </Menu>
      </div>

      {/* Pick-up Date */}
      <div>
        <p className="text-xs text-gray-500 uppercase mb-1">Pick-up Date</p>
        <DatePicker
          selected={pickupDate}
          onChange={(d) => setPickupDate(d)}
          dateFormat="dd MMM yy"
          className="w-full text-xl font-bold text-gray-900 border-b-2 border-transparent focus:border-lime-500 outline-none"
        />
      </div>

      {/* Return Date */}
      <div>
        <p className="text-xs text-gray-500 uppercase mb-1">Return Date</p>
        <DatePicker
          selected={returnDate}
          onChange={(d) => setReturnDate(d)}
          dateFormat="dd MMM yy"
          minDate={pickupDate ?? undefined}
          className="w-full text-xl font-bold text-gray-900 border-b-2 border-transparent focus:border-lime-500 outline-none"
        />
      </div>

      <div className="flex items-end">
        <button
          onClick={() => {
            const url = new URL("/vehicle-rental", window.location.origin);
            if (pickup) url.searchParams.set("city", pickup);
            router.push(`${url.pathname}?${url.searchParams.toString()}`);
          }}
          className="w-full bg-linear-to-r from-lime-600 via-green-500 to-lime-300 text-black font-semibold py-2 rounded-full hover:scale-105 transition"
        >
          Rent Vehicle
        </button>
      </div>
      <Dialog open={detailsOpen} onClose={closeDetails} className="relative z-1000">
        <div className="fixed inset-0 z-1000 bg-black/60" aria-hidden="true" />
        <div className="fixed inset-0 z-1001 flex items-center justify-center p-4">
          <Dialog.Panel className="relative z-1002 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-gray-200">
            <button onClick={closeDetails} aria-label="Close" className="absolute top-3 right-3 inline-flex items-center justify-center rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 w-8 h-8">×</button>
            <Dialog.Title className="text-lg font-semibold text-black">
              {modalSection === "pickup" ? "Choose pick-up" : "Choose drop-off"}
            </Dialog.Title>
            {modalSection === "pickup" && (
              <div className="mt-4 max-h-[60vh] overflow-y-auto">
                <div className="p-2 border-b sticky top-0 bg-white">
                  <input
                    value={searchPickup}
                    onChange={(e) => setSearchPickup(e.target.value)}
                    placeholder="Search pick-up..."
                    className="w-full px-3 py-2 text-sm border rounded-md outline-none focus:ring-2 focus:ring-lime-500 text-black"
                  />
                </div>
                <div className="px-2 pt-2">
                  <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">West Bengal</div>
                  {filter(wbLocations, searchPickup).map((c) => (
                    <button
                      key={`pu-wb-${c}`}
                      onClick={() => {
                        setPickup(c);
                        closeDetails();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-lime-50 text-black"
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <div className="px-2 pt-2 pb-2">
                  <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">India</div>
                  {filter(indiaLocations, searchPickup).map((c) => (
                    <button
                      key={`pu-in-${c}`}
                      onClick={() => {
                        setPickup(c);
                        closeDetails();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-lime-50 text-black"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {modalSection === "dropoff" && (
              <div className="mt-4 max-h-[60vh] overflow-y-auto">
                <div className="p-2 border-b sticky top-0 bg-white">
                  <input
                    value={searchDropoff}
                    onChange={(e) => setSearchDropoff(e.target.value)}
                    placeholder="Search drop-off..."
                    className="w-full px-3 py-2 text-sm border rounded-md outline-none focus:ring-2 focus:ring-lime-500 text-black"
                  />
                </div>
                <div className="px-2 pt-2">
                  <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">West Bengal</div>
                  {filter(wbLocations, searchDropoff).map((c) => (
                    <button
                      key={`do-wb-${c}`}
                      onClick={() => {
                        setDropoff(c);
                        closeDetails();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-lime-50 text-black"
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <div className="px-2 pt-2 pb-2">
                  <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">India</div>
                  {filter(indiaLocations, searchDropoff).map((c) => (
                    <button
                      key={`do-in-${c}`}
                      onClick={() => {
                        setDropoff(c);
                        closeDetails();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-lime-50 text-black"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};
