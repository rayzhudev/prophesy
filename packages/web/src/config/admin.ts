// Get admin handles from environment variable
// Format should be comma-separated Twitter handles without @ symbol
// e.g. NEXT_PUBLIC_ADMIN_HANDLES="handle1,handle2,handle3"
export const ADMIN_HANDLES = (process.env.NEXT_PUBLIC_ADMIN_HANDLES || "")
  .split(",")
  .map((handle) => handle.trim())
  .filter(Boolean); // Remove empty strings

if (ADMIN_HANDLES.length === 0) {
  console.warn(
    "No admin handles configured. Set NEXT_PUBLIC_ADMIN_HANDLES in .env"
  );
}
