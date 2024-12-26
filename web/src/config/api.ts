export const API_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  (process.env.NODE_ENV === "production"
    ? "/api" // In production, use relative path
    : "http://localhost:3000"); // In development, use local backend
