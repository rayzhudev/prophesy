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
    baseUrl: "", // Empty because we use relative URLs in production
    useProxy: true, // Use Next.js rewrites in production
  },
} as const;

const config = API_CONFIGS[ENV];

export const API_URL = config.baseUrl;

export const getApiUrl = (path: string): string => {
  // Add leading slash if missing
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  // In environments where we use the proxy (production), prefix with /api
  // In other environments (dev/test), use the full URL
  return config.useProxy
    ? `/api${normalizedPath}`
    : `${config.baseUrl}${normalizedPath}`;
};
