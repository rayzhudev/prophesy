export const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// API key that only the frontend should know
if (!process.env.FRONTEND_API_KEY) {
  throw new Error("FRONTEND_API_KEY environment variable is required");
}
export const FRONTEND_API_KEY = process.env.FRONTEND_API_KEY;

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
  if (!origin) return false; // Reject requests with no origin
  return ALLOWED_ORIGINS.includes(origin as any);
};
