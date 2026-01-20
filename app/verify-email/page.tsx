// app/verify-email/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BiArrowBack } from "react-icons/bi";

export default function VerifyEmailPage() {
  const [otp, setOtp] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otp }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Invalid OTP");

    alert("Email verified successfully!");
    router.push("/login");
  } catch (err: any) {
    alert(err.message);
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-r from-green-50 to-lime-50 px-4">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Verify Email</h1>
        <p className="text-sm text-gray-600 mb-8">
          A 6-digit code has been sent to your email.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-2">
            {[...Array(6)].map((_, i) => (
              <input
                key={i}
                type="text"
                maxLength={1}
                value={otp[i] || ""}
                onChange={(e) => {
                  const newOtp = otp.split("");
                  newOtp[i] = e.target.value;
                  setOtp(newOtp.join("").slice(0, 6));
                }}
                className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-xl focus:border-lime-500 outline-none"
              />
            ))}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-linear-to-r from-lime-400 to-green-400 text-white font-bold rounded-xl hover:from-lime-500 hover:to-green-500 transition"
          >
            Verify Email
          </button>
        </form>

        <div className="flex justify-between mt-6 text-sm">
          <Link href="/signup" className="flex items-center gap-1 text-gray-600 hover:text-green-600">
            <BiArrowBack /> Back
          </Link>
          <button className="text-green-600 hover:underline">Resend OTP</button>
        </div>
      </div>
    </div>
  );
}