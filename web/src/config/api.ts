// Use the backend URL directly in both production and development
export const API_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";
