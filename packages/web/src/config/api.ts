type Environment = "development" | "test" | "production";
const ENV = (process.env.NODE_ENV || "development") as Environment;

const API_CONFIGS = {
  development: {
    baseUrl: "http://localhost:3000",
    useProxy: false,
  },
  test: {
    baseUrl: "http://localhost:3000",
    useProxy: false,
  },
  production: {
    baseUrl: process.env.NEXT_PUBLIC_BACKEND_URL || "",
    useProxy: true,
  },
} as const;

const config = API_CONFIGS[ENV];

export const API_URL = config.baseUrl;

export const getApiUrl = (path: string): string => {
  // Add leading slash if missing
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (config.useProxy) {
    // In production, use the Next.js rewrite
    return `/api${normalizedPath}`;
  }

  // In development, call the backend directly
  return `${config.baseUrl}${normalizedPath}`;
};
