// In production, use /api which will be rewritten by Next.js to the actual backend URL
// In development, use the direct backend URL
export const API_URL =
  process.env.NODE_ENV === "production"
    ? "/api" // This will be rewritten by Next.js config
    : process.env.BACKEND_URL || "http://localhost:3000";
