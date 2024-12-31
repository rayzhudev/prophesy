import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["pbs.twimg.com"], // Allow Twitter profile images
  },
  webpack: (config, { dev, isServer }) => {
    // Enable React Refresh in development
    if (dev && !isServer) {
      config.optimization.moduleIds = "named";
    }
    return config;
  },
  async headers() {
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
        source: "/:path*",
        headers: [
          // Basic security headers
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              // Default fallback
              "default-src 'self' https://fonts.gstatic.com",

              // Script sources - kept as locked down as possible
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://challenges.cloudflare.com https://static.cloudflareinsights.com",

              // Connect sources - carefully restricted to required endpoints
              `connect-src 'self' https://${cleanBackendUrl} http://localhost:3000 https://auth.privy.io wss://relay.walletconnect.com wss://relay.walletconnect.org wss://www.walletlink.org https://*.rpc.privy.systems`,

              // Frame sources
              "frame-src 'self' https://auth.privy.io https://verify.walletconnect.com https://verify.walletconnect.org https://challenges.cloudflare.com",

              // Child frame sources
              "child-src 'self' https://auth.privy.io https://verify.walletconnect.com https://verify.walletconnect.org",

              // Prevent site from being embedded unless explicitly needed
              "frame-ancestors 'none'",

              // Other necessary defaults
              "img-src 'self' data: https: https://pbs.twimg.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://auth.privy.io",
              "font-src 'self' data: https://fonts.gstatic.com https://fonts.googleapis.com https://auth.privy.io https://*.gstatic.com",

              // Base URI restriction
              "base-uri 'self'",

              // Form actions restriction
              "form-action 'self'",
            ].join("; "),
          },
          {
            // Add Report-Only header for testing as recommended by Privy
            key: "Content-Security-Policy-Report-Only",
            value: [
              "default-src 'self' https://fonts.gstatic.com",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://challenges.cloudflare.com https://static.cloudflareinsights.com",
              `connect-src 'self' https://${cleanBackendUrl} http://localhost:3000 https://auth.privy.io wss://relay.walletconnect.com wss://relay.walletconnect.org wss://www.walletlink.org https://*.rpc.privy.systems`,
              "frame-src 'self' https://auth.privy.io https://verify.walletconnect.com https://verify.walletconnect.org https://challenges.cloudflare.com",
              "child-src 'self' https://auth.privy.io https://verify.walletconnect.com https://verify.walletconnect.org",
              "frame-ancestors 'none'",
              "img-src 'self' data: https: https://pbs.twimg.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://auth.privy.io",
              "font-src 'self' data: https://fonts.gstatic.com https://fonts.googleapis.com https://auth.privy.io https://*.gstatic.com",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
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
