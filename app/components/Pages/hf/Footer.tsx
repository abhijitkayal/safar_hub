"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import footerlogo from "@/public/logo.png";
import { MdEmail, MdLocationOn, MdPhone } from "react-icons/md";

const CurrentYear = () => {
  const [year, setYear] = useState<number | null>(null);
  useEffect(() => setYear(new Date().getFullYear()), []);
  if (!year) return null;
  return <span>{year}</span>;
};

const Footer: React.FC = () => {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "idle" | "success" | "error"; message: string }>({
    type: "idle",
    message: "",
  });

  const handleNewsletterSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newsletterEmail.trim()) {
      setStatus({ type: "error", message: "Please enter your email." });
      return;
    }
    if (!consent) {
      setStatus({ type: "error", message: "Please agree to receive emails." });
      return;
    }

    try {
      setSubmitting(true);
      setStatus({ type: "idle", message: "" });

      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newsletterEmail.trim(), consent: true }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to subscribe");
      }

      setStatus({ type: "success", message: "Thank you for subscribing!" });
      setNewsletterEmail("");
      setConsent(false);
    } catch (error: any) {
      setStatus({ type: "error", message: error?.message || "Failed to subscribe. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
  <footer className="bg-[#061a23] text-gray-300 pt-12 pb-6 z-999">
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true }}
    >
      {/* GRID TOP SECTION */}
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-10 border-b border-gray-700 pb-10 sm:place-items-center md:place-items-center z-50">
        {/* Column 1 */}
       <div className="flex flex-col items-center flex-1 text-center">
          <Image
              src="/logo.png"
              alt="Logo"
              width={180}
              height={70}
              className="h-15 w-30 mb-3 flex justify-center "
              priority
            />
          <p className="text-sm leading-relaxed mb-4">
          <strong className="">SafarHub</strong> offers cozy stays, curated tours, thrilling adventures, and flexible vehicle rentals — everything you need for a seamless and memorable journey.
          </p>
          <div className="flex space-x-4 text-xl justify-center lg:justify-start">
            <a href="https://www.facebook.com/profile.php?id=61583838720082" className="hover:text-green-400"><FaFacebookF /></a>
            <a href="https://www.instagram.com/safarhub1" className="hover:text-green-400"><FaInstagram /></a>
          </div>
        </div>

        {/* Column 2 */}
        <div className="lg:text-left text-center">
          <h2 className="text-white text-xl font-semibold mb-4">Quick Links</h2>
          <ul className="space-y-2 text-sm">
            <li><Link href="/privacy-policy" className="hover:text-green-400 transition">Privacy Policy</Link></li>
            <li><Link href="/terms-conditions" className="hover:text-green-400 transition">Terms & Conditions</Link></li>
            <li><Link href="/refund-policy" className="hover:text-green-400 transition">Refund Policy</Link></li>
            <li><Link href="/safar-partner" className="hover:text-green-400 transition">Join as a Safar Partner</Link></li>
          </ul>
        </div>

        {/* Column 3 */}
        <div className="lg:text-left text-center">
          <h2 className="text-white text-xl font-semibold mb-4">Contact Info</h2>
          <ul className="space-y-3">
            <li className="flex items-center gap-2 justify-center lg:justify-start">
              <MdLocationOn className="text-green-600" />
              <a
                href="https://www.google.com/maps/search/?api=1&query=19%20Krishna%20Chatterjee%20Ln%2C%20Bally%2C%20Howrah%2C%20West%20Bengal%20711201"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-green-400 transition text-sm"
              >
                Kolkata 19, Krishna Chatterjee Ln, Bally, Howrah, West Bengal 711201
              </a>
            </li>
            <li className="flex items-center gap-2 justify-center lg:justify-start">
              <MdPhone className="text-green-600" />
              <a href="tel:+917980715765" className="hover:text-green-400 transition">
                +91 7980715765
              </a>
            </li>
            <li className="flex items-center gap-2 justify-center lg:justify-start">
              <MdEmail className="text-green-600" />
              <a
                href="mailto:cyberspaceworksofficial@gmail.com"
                className="hover:text-green-400 transition"
              >
                cyberspaceworksofficial@gmail.com
              </a>
            </li>
          </ul>
        </div>

        {/* Column 4 */}
        <div className="lg:text-left text-center w-full">
          <h2 className="text-white text-xl font-semibold mb-4">Newsletter</h2>
          <p className="text-sm mb-3">Subscribe to our latest updates and offers.</p>
          <form
            onSubmit={handleNewsletterSubmit}
            className="flex bg-white rounded-lg overflow-hidden w-full max-w-md mx-auto lg:mx-0 focus-within:ring-2 focus-within:ring-green-600"
          >
            <input
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-2/3 py-2 px-3 text-gray-700 focus:outline-none"
              aria-label="Email address"
              required
            />
            <button
              type="submit"
              disabled={submitting}
              className="w-1/3 bg-green-600 py-2 text-white font-semibold hover:bg-green-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Sending..." : "Subscribe"}
            </button>
          </form>
          <div className="mt-3">
            <label className="flex items-center text-xs text-gray-400 space-x-2 justify-center lg:justify-start">
              <input
                type="checkbox"
                className="accent-green-500"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />
              <span>I agree to receive emails</span>
            </label>
            {status.message && (
              <p
                className={`text-xs mt-2 ${
                  status.type === "success" ? "text-green-400" : "text-red-400"
                }`}
              >
                {status.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div className="max-w-7xl mx-auto px-6 flex flex-col  justify-center items-center mt-6 text-sm text-gray-400 text-center md:text-left">
        <p>© <CurrentYear /> SafarHub. All Rights Reserved.</p>
      </div>
    </motion.div>
  </footer>
);
};

export default Footer;
