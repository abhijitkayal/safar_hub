"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FaCheck } from "react-icons/fa";

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    age: "",
    password: "",
    confirmPassword: "",
    otp: "",
  });
  const [isVendor, setIsVendor] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const router = useRouter();

  const vendorOptions = [
    { id: "stays", label: "Stays" },
    { id: "tours", label: "Tours" },
    { id: "adventures", label: "Adventures" },
    { id: "vehicle", label: "Vehicle Rental" },
  ];

  const toggleService = (id: string) => {
    setSelectedServices((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((s) => s !== id) : [...prev, id];
      if (isVendor && error === "Select at least one service" && (next.length > 0 || isSeller)) {
        setError("");
      }
      return next;
    });
  };

  const validatePassword = (pwd: string) => {
    const checks = [/[a-z]/, /[A-Z]/, /[0-9]/, /[!@#$%^&*(),.?":{}|<>]/, /.{8,}/]; // Fixed regex: removed invalid '$' from length check
    return checks.every((r) => r.test(pwd));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "password") {
      const isValid = validatePassword(value);
      setPasswordValid(isValid);
      setPasswordMessage(isValid ? "Password valid" : "Password must contain at least 1 uppercase, 1 lowercase, 1 number, 1 special character, and be at least 8 characters long.");
    }
  };

  const handleSendOTP = async () => {
    if (!formData.email) return setError("Enter email");
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setOtpSent(true);
      setError("");
      setStatusMessage("Otp is sended");
    } catch (e: any) {
      setError(e.message);
      setStatusMessage("");
    }
  };

  const handleVerifyOTP = async () => {
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp: formData.otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setOtpVerified(true);
      setError("");
      setStatusMessage("Otp is Verified");
    } catch (e: any) {
      setError(e.message);
      setStatusMessage("");
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    if (!passwordValid) {
      setError("Password too weak");
      return;
    }
    if (isVendor && selectedServices.length === 0 && !isSeller) {
      setError("Select at least one service");
      return;
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.name,
          email: formData.email,
          age: formData.age,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          contactNumber: formData.mobile,
          accountType: isVendor || isSeller ? "vendor" : "user",
          otp: formData.otp,

          // ✅ FIX — SEND SERVICES TO BACKEND
          vendorServices: isVendor ? selectedServices : [],
          isSeller,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert("Account created!");
      router.push("/login");
    } catch (err: any) {
      setError(err.message);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center p-4 ">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md p-8 border-t-4 border-lime-400 mt-20">
        <h2 className="text-3xl font-bold text-center mb-6 text-black">Create Account</h2>
        {error && <p className="text-red-500 text-sm text-center mb-2">{error}</p>}
        {statusMessage && <p className="text-green-600 text-sm text-center mb-4">{statusMessage}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-lime-500 outline-none text-gray-800 border-gray-400"
          />
          <div className="flex gap-2 lg:flex-row flex-col">
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="flex-1 px-4 py-3 rounded-xl border focus:ring-2 focus:ring-lime-500 outline-none text-gray-800 border-gray-400"
            />
            <button
              type="button"
              onClick={handleSendOTP}
              className="px-4 py-3 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-xl"
            >
              Send OTP
            </button>
          </div>
          {otpSent && (
            <div className="flex gap-2 lg:flex-row flex-col">
              <input
                name="otp"
                placeholder="OTP"
                value={formData.otp}
                onChange={handleChange}
                className="flex-1 px-4 py-3 rounded-xl border focus:ring-2 focus:ring-lime-500 outline-none text-gray-800 border-gray-400"
              />
              <button
                type="button"
                onClick={handleVerifyOTP}
                className="px-4 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl"
              >
                Verify
              </button>
            </div>
          )}
          <input
            name="mobile"
            placeholder="Mobile"
            value={formData.mobile}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-lime-500 outline-none text-gray-800 border-gray-400"
          />
          <input
            name="age"
            type="number"
            placeholder="Age"
            min="18"
            value={formData.age}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-lime-500 outline-none text-gray-800 border-gray-400"
          />
          <div className="flex items-center justify-between p-3 bg-linear-to-r from-lime-100 to-green-100 rounded-xl">
            <span className="text-black">Would you like to be a SafarHub Partner?</span>
            <button
              type="button"
              onClick={() => {
                if (isVendor) {
                  setError((prev) => (prev === "Select at least one service" ? "" : prev));
                }
                setIsVendor(!isVendor);
              }}
              className={`w-14 h-7 rounded-full p-1 transition-all ${isVendor ? "bg-green-500" : "bg-gray-300"}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${isVendor ? "translate-x-7" : ""}`} />
            </button>
          </div>
          {isVendor && (
            <div className="grid grid-cols-2 gap-3">
              {vendorOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggleService(opt.id)}
                  className={`p-3 rounded-xl border-2 transition-all text-gray-800 ${selectedServices.includes(opt.id)
                      ? "bg-green-500 text-white border-green-500"
                      : "bg-white border-gray-200"
                    }`}
                >
                  {opt.label}
                  {selectedServices.includes(opt.id) && (
                    <FaCheck className="inline ml-1" />
                  )}
                </button>
              ))}
              <button
                type="button"
                onClick={() =>
                  setIsSeller((prev) => {
                    const next = !prev;
                    if (next && error === "Select at least one service") {
                      setError("");
                    }
                    return next;
                  })
                }
                className={`p-3 rounded-xl border-2 transition-all text-gray-800 col-span-2 text-left ${isSeller
                    ? "bg-green-500 text-white border-green-500"
                    : "bg-white border-gray-200"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span>Product Seller</span>
                  {isSeller && <FaCheck className="ml-2" />}
                </div>
                <p
                  className={`text-xs mt-1 ${isSeller ? "text-white/80" : "text-gray-500"
                    }`}
                >
                  Sell physical products on SafarHub.
                </p>
              </button>
            </div>
          )}
          {otpVerified && (
            <>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-lime-500 outline-none pr-12 text-gray-800 border-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-800"
                >
                  {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                </button>
              </div>
              <p className={`text-sm ${passwordValid ? "text-green-500" : "text-red-500"}`}>{passwordMessage}</p>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-lime-500 outline-none pr-12 text-gray-800 border-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-3.5 text-gray-800"
                >
                  {showConfirm ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                </button>
              </div>
            </>
          )}
          <button
            type="submit"
            disabled={!otpVerified || !passwordValid || formData.password !== formData.confirmPassword}
            className="w-full py-3 bg-linear-to-r from-lime-400 to-green-400 text-white font-bold rounded-xl hover:from-lime-500 hover:to-green-500 disabled:opacity-50"
          >
            Create Account
          </button>
        </form>
        <p className="text-center mt-6 text-sm text-black">
          Already have account? <Link href="/login" className="text-green-600 font-bold">Login</Link>
        </p>
      </div>
    </div>
  );
}