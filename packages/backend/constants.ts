export const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
export const PRODUCTION_DOMAIN = "https://prophesy.fun";

// Local development domains with common ports
export const LOCAL_DOMAINS = [
  "http://localhost:3001",
  "http://localhost:5173",
  "http://127.0.0.1:3001",
  "http://127.0.0.1:5173",
];

// All allowed origins for CORS
export const ALLOWED_ORIGINS = [PRODUCTION_DOMAIN, ...LOCAL_DOMAINS];