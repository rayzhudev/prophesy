"use server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { router } from "./trpc";
import type { AnyRouter } from "@trpc/server";
import { PORT, isOriginAllowed } from "./constants";
import { createContext } from "./trpc";

Bun.serve({
  port: PORT,
  hostname: "0.0.0.0",
  async fetch(req) {
    const origin = req.headers.get("Origin");

    if (!isOriginAllowed(origin)) {
      return new Response("Forbidden", { status: 403 });
    }

    const corsHeaders = {
      "Access-Control-Allow-Origin": origin!,
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PATCH, DELETE",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-TRPC",
      "Access-Control-Max-Age": "86400",
    } as const;

    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      const url = new URL(req.url);

      if (url.pathname.startsWith("/trpc")) {
        const response = await fetchRequestHandler({
          endpoint: "/trpc",
          req,
          router,
          createContext,
          onError({ error }) {
            console.error("tRPC error:", error);
          },
          responseMeta: () => ({
            headers: corsHeaders,
          }),
        });

        const newResponse = new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: corsHeaders,
        });

        return newResponse;
      }

      if (url.pathname === "/" && req.method === "GET") {
        return Response.json(
          { message: "Hello from Bun!" },
          { headers: corsHeaders }
        );
      }

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
