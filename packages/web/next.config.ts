import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const isProduction = process.env.NODE_ENV === "production";
    const backendUrl = isProduction
      ? process.env.NEXT_PUBLIC_BACKEND_URL
      : "http://localhost:3000";
      
    // Remove any protocol prefix and trailing slashes
    const cleanBackendUrl = backendUrl
      ?.replace(/^https?:\/\//, "")
      .replace(/\/$/, "");

    return [
      {
        source: "/api/trpc/:path*",
        destination: `https://${cleanBackendUrl}/trpc/:path*`,
      },
    ];
  },
};

export default nextConfig;
