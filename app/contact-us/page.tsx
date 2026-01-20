/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import { motion, Variants } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Link from "next/link";
import { FaFacebookF, FaInstagram } from "react-icons/fa";

const ContactUsPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    countryCode: "+91",
    contact: "",
    service: "SafarHub Inquiry",
    requirement: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [emailError, setEmailError] = useState("");
  const [contactError, setContactError] = useState("");

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, email: value }));
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailError(regex.test(value) ? "" : "Please enter a valid email");
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    setFormData((prev) => ({ ...prev, contact: value }));
    if (value.length !== 10) {
      setContactError("Contact number must be exactly 10 digits");
    } else {
      setContactError("");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (emailError || contactError || formData.contact.length !== 10) {
      setMessage("Please fix the errors above before submitting.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Thanks! Our team will reach out shortly.");
        setFormData({
          name: "",
          email: "",
          countryCode: "+91",
          contact: "",
          service: "SafarHub Inquiry",
          requirement: "",
        });
      } else {
        setMessage(`Failed: ${data.error || "Something went wrong."}`);
      }
    } catch (error) {
      console.error(error);
      setMessage("An error occurred. Please try again.");
    } finally {
      setLoading(false);
      setEmailError("");
      setContactError("");
    }
  };

  const { ref: formRef, inView: formInView } = useInView({
    threshold: 0.2,
    triggerOnce: true,
    rootMargin: "0px 0px -80px 0px",
  });

  const formVariants: Variants = {
    hidden: { opacity: 0, x: 120 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 120, damping: 18 },
    },
  };

  return (
    <main className="relative bg-sky-50 text-black pt-28 pb-24 overflow-hidden">
     
      

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-2 space-y-12 mt-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="grid gap-10 lg:grid-cols-2"
        >
          <div className="space-y-5 text-center lg:text-left">
            {/* <p className="text-green-600 uppercase tracking-[0.35em] text-sm font-semibold">
              Contact
            </p> */}
            <h1 className="text-4xl md:text-5xl font-bold leading-tight text-black">
              An End-to-End Hub <span className="text-green-600">for your Travels</span>
            </h1>
            <p className="text-gray-900 text-lg leading-relaxed">
            We understand what your trip means to you. To make it a reality, we’ll be happy to help you.
            </p>
            <p className="text-gray-900">
            Fill in the form and we’ll assist you.
            </p>
          </div>

          <motion.div
            ref={formRef}
            variants={formVariants}
            initial="hidden"
            animate={formInView ? "visible" : "hidden"}
          >
            <div className="rounded-[32px] bg-linear-to-b from-green-400 to-green-500 p-1 shadow-2xl shadow-green-900/50">
              <div className="rounded-[28px] bg-green-100 px-6 py-7 sm:px-8 text-black">
                <h3 className="text-2xl font-semibold mb-6 text-center lg:text-left">
                  Tell us what you&apos;re planning
                </h3>
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="name"
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="p-3 rounded-lg bg-slate-900 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-400 outline-none"
                    />
                    <div className="flex flex-col">
                      <input
                        type="email"
                        name="email"
                        placeholder="Your Mail"
                        value={formData.email}
                        onChange={handleEmailChange}
                        required
                        className={`p-3 rounded-lg bg-slate-900 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-400 outline-none ${
                          emailError ? "border border-red-500" : ""
                        }`}
                      />
                      {emailError && <span className="text-red-400 text-sm mt-1">{emailError}</span>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4">
                    <div className="flex items-center justify-center rounded-lg bg-slate-900 text-white px-6 text-lg font-semibold">
                      +91
                    </div>
                    <div className="flex flex-col">
                      <input
                        type="tel"
                        name="contact"
                        placeholder="Contact number"
                        value={formData.contact}
                        onChange={handleContactChange}
                        required
                        className={`w-full p-3 rounded-lg bg-slate-900 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-400 outline-none ${
                          contactError ? "border border-red-500" : ""
                        }`}
                      />
                      {contactError && (
                        <span className="text-red-400 text-sm mt-1">{contactError}</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <textarea
                      name="requirement"
                      rows={4}
                      value={formData.requirement}
                      onChange={handleChange}
                      placeholder="Briefly discuss your requirement"
                      className="w-full p-3 rounded-xl bg-slate-900 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-400 outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-center">
                    <button
                      type="submit"
                      disabled={loading || !!emailError || !!contactError}
                      className="py-3 px-12 rounded-full bg-green-600 text-[#021d34] font-semibold shadow-lg hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {loading ? "Submitting..." : "Submit"}
                    </button>
                  </div>

                  {message && (
                    <p className="text-center text-sm font-medium text-black">{message}</p>
                  )}
                </form>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl bg-green-100 border border-white/10 p-8 shadow-2xl shadow-black/40"
          >
            <h2 className="text-2xl font-semibold mb-2">Contact Information</h2>
            <p className="text-sm uppercase tracking-[0.35em] text-green-600 mb-10">SafarHub</p>
            <div className="space-y-5 text-gray-200">
              <div>
                <p className="text-black uppercase text-xs tracking-widest font-semibold mb-2">Phone</p>
                <a
                  href="tel:+917980715765"
                  className="text-gray-800  hover:text-green-500"
                >
                  +91 79807 15765
                </a>
              </div>
              <div>
                <p className="text-black uppercase text-xs tracking-widest font-semibold mb-2">Email</p>
                <a
                  href="mailto:cyberspaceworksofficial@gmail.com"
                  className="text-gray-800 font-medium hover:text-green-500 break-all"
                >
                 cyberspaceworksofficial@gmail.com
                </a>
              </div>
              <div>
                <p className="text-black uppercase text-xs tracking-widest font-semibold mb-2">Address</p>
              <a
                href="https://maps.app.goo.gl/Zhr74TSE7FecFKFm7"
                target="_blank"
                className="text-gray-800 font-medium hover:text-green-500 break-all"
              >
                Kolkata 19, Krishna Chatterjee Ln, Bally, Howrah, West Bengal 711201
              </a>
              </div>
            </div>
            <div className="flex gap-1 pt-6">
              <Link
                href="https://www.facebook.com/profile.php?id=61583838720082"
                target="_blank"
                rel="noreferrer"
                className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center hover:bg-green-500 hover:text-black transition text-green-600"
              >
                <FaInstagram />
              </Link>
              <Link
                href="https://www.instagram.com/safarhub1"
                target="_blank"
                rel="noreferrer"
                className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center hover:bg-green-500 hover:text-black transition text-green-600"
              >
                <FaFacebookF />
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50 h-full"
          >
            <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3116.5100779555523!2d88.33852777576645!3d22.64347642643196!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f89dd56c959339%3A0x59f91e11a807e487!2sCyberspace%20Works%20-%20Website%2C%20Software%20and%20App%20Developer%20in%20Howrah%2C%20Kolkata!5e1!3m2!1sen!2sin!4v1760195925843!5m2!1sen!2sin"
            width="100%"
            height="100%"
            style={{ border: 0, minHeight: "450px" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          </motion.div>
        </div>
      </div>
    </main>
  );
};

export default ContactUsPage;

