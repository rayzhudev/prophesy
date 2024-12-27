import { PORT, PRODUCTION_DOMAIN, ALLOWED_ORIGINS } from "./constants";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { router } from "@prophesy/api";

Bun.serve({
  port: PORT,
  hostname: "0.0.0.0",
  async fetch(req) {
    const origin = req.headers.get("Origin");
    const corsHeaders = {
      "Access-Control-Allow-Origin":
        origin && ALLOWED_ORIGINS.includes(origin) ? origin : PRODUCTION_DOMAIN,
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PATCH, DELETE",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-TRPC",
      "Access-Control-Max-Age": "86400",
    };

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
          router,
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
