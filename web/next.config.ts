import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // In production, rewrite /api to the actual backend URL
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3000";
    const formattedUrl = backendUrl.startsWith("http")
      ? backendUrl
      : `https://${backendUrl}`;

    return [
      {
        source: "/api/:path*",
        destination: `${formattedUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
