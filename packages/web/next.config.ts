import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const isProduction = process.env.NODE_ENV === "production";
    const backendUrl = isProduction
      ? process.env.NEXT_PUBLIC_BACKEND_URL
      : "http://localhost:3000";

    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/:path*`,
      },
      {
        source: "/trpc/:path*",
        destination: `${backendUrl}/trpc/:path*`,
      },
    ];
  },
};

export default nextConfig;
