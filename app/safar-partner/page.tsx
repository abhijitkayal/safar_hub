"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Typed from "typed.js";

const SafarPartnerPage = () => {
  // Typed text for "stay or homestay or Rooms or BnBs or Hotels"
  useEffect(() => {
    const typed = new Typed(".safar-role", {
      strings: ["Stays", "Homestays", "Rooms", "BnBs", "hotels","Tours","Group Tours","Tour Packages","Adventures","Trekking","Hiking","Camping","Water Rafting","Vehicle Rentals","Cars","Bikes","Car with Driver","Products"],
      typeSpeed: 80,
      backSpeed: 50,
      backDelay: 1000,
      loop: true,
    });

    return () => typed.destroy();
  }, []);
  return (
    <main className="min-h-screen bg-slate-50 pb-20 pt-28">
      {/* Hero section */}
      <section className="bg-green-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-14 flex flex-col md:flex-row  gap-10">
        <div className="flex-1 space-y-4">
  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
    List your{" "}
    <span className="safar-role text-green-950 text-5xl font-bold"></span>
    <br />
    with Safar.
  </h1>

  {/* New Description */}
  {/* <p className="text-md text-blue-100 max-w-lg mt-10">
    Easily list and manage your stays, tours, adventures, vehicles or products 
    on Safar — reach more travellers, grow visibility and get bookings effortlessly.
  </p> */}
</div>


          {/* Right registration card – simplified copy (no red-marked text) */}
          <div className="w-full max-w-sm bg-white text-slate-900 rounded-2xl shadow-xl p-6 md:p-7">
            <h2 className="text-xl font-semibold mb-2 text-slate-900">
              Register for free
            </h2>
            {/* <p className="text-sm text-slate-600 mb-5">
              Tell us a few details about your property so we can help you get
              started.
            </p> */}

            {/* <div className="space-y-4 text-sm text-slate-700 mb-6">
              <p className="flex items-start gap-2">
                <span className="mt-1 h-5 w-5 flex items-center justify-center rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                  ✓
                </span>
                <span>List as a homestay, hotel, guest house or room.</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="mt-1 h-5 w-5 flex items-center justify-center rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                  ✓
                </span>
                <span>Get more visibility to travellers searching in your area.</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="mt-1 h-5 w-5 flex items-center justify-center rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                  ✓
                </span>
                <span>Simple tools to manage prices, availability and bookings.</span>
              </p>
            </div> */}

            <Link
              href="/signup"
              className="block w-full rounded-full bg-green-600 text-center text-white font-semibold py-3 text-sm md:text-base shadow-md hover:bg-green-700 transition cursor-pointer mt-5"
            >
              Be Our Safar Partner
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits section */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-4 py-14">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            List worry‑free. We&apos;ve got your back.
          </h2>

          <div className="mt-8 grid gap-8 md:grid-cols-2 text-sm md:text-base">
            {/* Column 1 */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-3 text-lg">
                Your rental, your rules
              </h3>
              <ul className="space-y-6 text-slate-700">
                <li>• Accept or decline booking requests that work for you.</li>
                <li>• Manage guests' expectations by setting up clear house rules.</li>
               
              </ul>
            </div>

            {/* Column 2 */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-3 text-lg">
                Know your guests
              </h3>
              <ul className="space-y-2 text-slate-700">
                <li>• Communicate with your guests before accepting their stay with pre-booking messaging.</li>
                <li>• Get details what the guest wants.</li>
               
              </ul>
            </div>

          
          </div>

          <div className="mt-10">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-full bg-green-600 text-white px-7 py-3 font-semibold shadow-md hover:bg-green-700 transition cursor-pointer"
            >
              Be Our Safar Partner
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default SafarPartnerPage;
