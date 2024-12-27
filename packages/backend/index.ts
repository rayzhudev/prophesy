import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { router } from "@prophesy/api";
import type { AnyRouter } from "@trpc/server";
import { PORT, isOriginAllowed } from "./constants";

Bun.serve({
  port: PORT,
  hostname: "0.0.0.0",
  async fetch(req) {
    const origin = req.headers.get("Origin");

    // Only allow requests from approved origins
    if (!isOriginAllowed(origin)) {
      return new Response("Forbidden", { status: 403 });
    }

    // We know origin is valid at this point
    const corsHeaders = {
      "Access-Control-Allow-Origin": origin!,
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PATCH, DELETE",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-TRPC",
      "Access-Control-Max-Age": "86400",
    } as const;

    // Handle CORS preflight
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      const url = new URL(req.url);

      // Handle tRPC requests
      if (url.pathname.startsWith("/trpc")) {
        return fetchRequestHandler({
          endpoint: "/trpc",
          req,
          router: router as AnyRouter,
          createContext: () => ({}),
          onError({ error }) {
            console.error("tRPC error:", error);
          },
          responseMeta() {
            return { headers: corsHeaders };
          },
        });
      }

      // Root endpoint
      if (url.pathname === "/" && req.method === "GET") {
        return Response.json(
          { message: "Hello from Bun!" },
          { headers: corsHeaders }
        );
      }

      // Handle 404
      return new Response("Not Found", { status: 404, headers: corsHeaders });
    } catch (error) {
      console.error("Error:", error);
      return new Response("Internal Server Error", {
        status: 500,
        headers: corsHeaders,
      });
    }
  },
});

console.log(`Server running at http://0.0.0.0:${PORT}`);
