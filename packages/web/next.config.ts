import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination:
          "https://${{prophesy-backend.RAILWAY_PUBLIC_DOMAIN}}/:path*",
      },
      {
        source: "/trpc/:path*",
        destination:
          "https://${{prophesy-backend.RAILWAY_PUBLIC_DOMAIN}}/trpc/:path*",
      },
    ];
  },
};

export default nextConfig;
