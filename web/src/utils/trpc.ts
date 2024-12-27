import { createTRPCReact, httpBatchLink } from "@trpc/react-query";
import type { AppRouter } from "../../../backend/trpc";
import { getApiUrl } from "@/config/api";

// Initialize tRPC with proper type
const trpc = createTRPCReact<AppRouter>();

// Export the initialized instance
export { trpc };

// Export the client configuration function
export function getClient() {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: getApiUrl("/trpc"),
        headers() {
          return {
            "Content-Type": "application/json",
          };
        },
      }),
    ],
  });
}
