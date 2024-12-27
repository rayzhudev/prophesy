import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  async rewrites() {
    const isProduction = process.env.NODE_ENV === "production";
    const backendUrl = isProduction
      ? process.env.NEXT_PUBLIC_BACKEND_URL
      : "http://localhost:3000";

    return [
      {
        source: "/api/:path*",
        destination: `https://${backendUrl}/:path*`,
      },
      {
        source: "/trpc/:path*",
        destination: `https://${backendUrl}/trpc/:path*`,
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
