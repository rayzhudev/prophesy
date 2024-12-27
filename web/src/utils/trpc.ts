import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@prophesy/api";
import { getApiUrl } from "@/config/api";

// Create tRPC client
export const trpc = createTRPCReact<AppRouter>();

// Create client configuration
export function getClient() {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: getApiUrl("/trpc"),
      }),
    ],
  });
}
