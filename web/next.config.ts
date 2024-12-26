import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // Get the backend URL from environment variable
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3000";
    console.log("Next.js rewrite using backend URL:", backendUrl);

    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/:path*`, // Rewrite to the actual backend URL
      },
    ];
  },
};

export default nextConfig;
