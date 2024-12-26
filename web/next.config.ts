import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // Get the backend URL from environment variable
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

    // Add protocol if using Railway's internal networking
    const formattedUrl = backendUrl.includes(".railway.internal")
      ? `http://${backendUrl}`
      : backendUrl;

    console.log("Next.js rewrite using backend URL:", formattedUrl);

    return [
      {
        source: "/api/:path*",
        destination: `${formattedUrl}/:path*`, // Rewrite to the actual backend URL
      },
    ];
  },
};

export default nextConfig;
