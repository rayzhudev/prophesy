import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@prophesy/api";
import { getApiUrl } from "@/config/api";

// Create tRPC client
export const trpc = createTRPCReact<AppRouter>();

// Create client configuration
export function getClient() {
  return trpc.createClient({
    links: [
      httpLink({
        url: getApiUrl("/trpc"),
        headers() {
          return {
            "Content-Type": "application/json",
          };
        },
        async fetch(url, options = {}) {
          console.log("[tRPC Client] Request URL:", url.toString());
          console.log("[tRPC Client] Request Method:", options.method || "GET");
          console.log("[tRPC Client] Request Headers:", options.headers);
          console.log("[tRPC Client] Request Body:", options.body || null);

          const response = await fetch(url, {
            ...options,
            headers: {
              ...options.headers,
              "Content-Type": "application/json",
            },
          });

          console.log("[tRPC Client] Response Status:", response.status);
          console.log(
            "[tRPC Client] Response Headers:",
            Object.fromEntries(response.headers.entries())
          );
          const responseBody = await response.clone().text();
          console.log("[tRPC Client] Response Body:", responseBody);

          return response;
        },
      }),
    ],
  });
}
