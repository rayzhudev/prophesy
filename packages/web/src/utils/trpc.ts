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
          console.log("=== tRPC Client Debug ===");
          console.log("Request URL:", url.toString());
          console.log("Request Method:", options.method);
          console.log("Request Headers:", options.headers);

          if (options.body) {
            try {
              const parsedBody = JSON.parse(options.body as string);
              console.log("Request Body (parsed):", {
                ...parsedBody,
                input: parsedBody.input
                  ? {
                      type: typeof parsedBody.input,
                      value: parsedBody.input,
                    }
                  : undefined,
              });
            } catch (e) {
              console.log("Raw Request Body:", options.body);
              console.log("Could not parse request body");
            }
          }
          console.log("=== End Client Debug ===");

          const response = await fetch(url, {
            ...options,
            headers: {
              ...options.headers,
              "Content-Type": "application/json",
            },
          });

          console.log("=== tRPC Response Debug ===");
          console.log("Response Status:", response.status);
          console.log(
            "Response Headers:",
            Object.fromEntries(response.headers.entries())
          );
          const responseText = await response.clone().text();
          try {
            const parsedResponse = JSON.parse(responseText);
            console.log("Response Body (parsed):", parsedResponse);
          } catch {
            console.log("Response Body (raw):", responseText);
          }
          console.log("=== End Response Debug ===");

          return response;
        },
      }),
    ],
  });
}
