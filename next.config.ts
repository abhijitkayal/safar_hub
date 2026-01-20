import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // reactCompiler: true,

  // ✅ Removed "turbo" (not valid anymore)
  experimental: {
    // You can still include other valid flags here, for example:
    // reactCompiler: true, // already top-level
    // serverActions: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
