// Get the backend URL with proper protocol
const getBackendUrl = () => {
  // Use localhost in development
  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:3000";
  }

  // In production, use the Railway internal URL with protocol
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) return "http://localhost:3000"; // fallback

  return backendUrl.includes(".railway.internal")
    ? `http://${backendUrl}`
    : backendUrl;
};

export const API_URL = getBackendUrl();
