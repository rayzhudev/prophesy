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
        fetch(url: RequestInfo | URL, options: RequestInit = {}) {
          console.log("=== tRPC Client Debug ===");
          console.log("Request URL:", url.toString());
          console.log("Request Method:", options.method || "GET");
          console.log("Request Headers:", options.headers || {});

          if (options.body) {
            try {
              const parsedBody = JSON.parse(options.body as string);
              console.log("Request Body (raw):", options.body);
              console.log("Request Body (parsed):", parsedBody);
            } catch {
              console.log("Could not parse request body:", options.body);
            }
          }
          console.log("=== End Client Debug ===");

          return fetch(url, {
            ...options,
            credentials: "include",
            headers: {
              ...options.headers,
              "content-type": "application/json",
            },
          }).then(async (response) => {
            console.log("=== tRPC Response Debug ===");
            console.log("Response Status:", response.status);
            console.log(
              "Response Headers:",
              Object.fromEntries(response.headers.entries())
            );
            const text = await response.clone().text();
            try {
              console.log("Response Body:", JSON.parse(text));
            } catch {
              console.log("Response Body (raw):", text);
            }
            console.log("=== End Response Debug ===");
            return response;
          });
        },
      }),
    ],
  });
}
