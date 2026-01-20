"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Fixed Admin Login (from .env)
    const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

    if (
      formData.email === ADMIN_EMAIL &&
      formData.password === ADMIN_PASSWORD
    ) {
      const adminUser = {
        fullName: "Admin",
        email: ADMIN_EMAIL,
        accountType: "admin",
      };
      localStorage.setItem("user", JSON.stringify(adminUser));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:changed", { detail: adminUser }));
      }
      router.push("/admin");
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      // ✅ Save user info in localStorage
      localStorage.setItem("user", JSON.stringify(data.user));
      // ✅ Notify navbar immediately
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:changed", { detail: data.user }));
      }

      // ✅ Admin login
      if (data.user.accountType === "admin") {
        router.push("/admin");
        return;
      }

      // ✅ Vendor login
      if (data.user.accountType === "vendor") {
        router.push("/vendor");
        return;
      }

      // ✅ Normal User login
      router.push("/profile");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-sky-50">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md p-8 border-t-4 border-lime-400">
        <h2 className="text-3xl font-bold text-center mb-6 text-black">Login</h2>
        {error && (
          <p className="text-red-500 text-sm text-center mb-4">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-lime-500 outline-none text-gray-800 border-gray-400"
          />
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
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
          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-sm text-red-500 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-linear-to-r from-lime-400 to-green-400 text-white font-bold rounded-xl hover:from-lime-500 hover:to-green-500"
          >
            Login
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-black">
          No account?{" "}
          <Link href="/signup" className="text-green-600 font-bold">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
