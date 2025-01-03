export const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// Production domains
const PRODUCTION_DOMAINS = ["https://prophesy.fun", "prophesy.fun"] as const;

// Local development domains with common ports
export const LOCAL_DOMAINS = [
  "http://localhost:3001",
  "http://localhost:5173",
  "http://127.0.0.1:3001",
  "http://127.0.0.1:5173",
] as const;

// All allowed origins for CORS
export const ALLOWED_ORIGINS = [
  ...PRODUCTION_DOMAINS,
  ...LOCAL_DOMAINS,
] as const;

// Helper to check if origin is allowed
export const isOriginAllowed = (origin: string | null): boolean => {
  if (!origin) return true; // Allow same-origin requests (no origin header)
  return ALLOWED_ORIGINS.includes(origin as any);
};
