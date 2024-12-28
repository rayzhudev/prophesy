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
        console.log("\n[tRPC Server] Incoming Request:");
        console.log("URL:", req.url);
        console.log("Method:", req.method);
        console.log("Headers:", Object.fromEntries(req.headers.entries()));
        console.log("Pathname:", url.pathname);
        console.log(
          "Search Params:",
          Object.fromEntries(url.searchParams.entries())
        );
        const body = await req.clone().text();
        console.log("Body:", body || null);

        try {
          const requestHeaders = new Headers(req.headers);
          requestHeaders.set("Content-Type", "application/json");

          const response = await fetchRequestHandler({
            endpoint: "/trpc",
            req: new Request(req.url, {
              method: req.method,
              headers: requestHeaders,
              body: req.method === "POST" ? req.body : undefined,
            }),
            router,
            createContext,
            onError({ error }) {
              console.error("[tRPC Server] Error in handler:", error);
              console.error("[tRPC Server] Error stack:", error.stack);
            },
            batching: {
              enabled: true,
            },
            responseMeta: () => {
              return { headers: corsHeaders };
            },
          });

          console.log("\n[tRPC Server] Response:");
          console.log("Status:", response.status);
          console.log(
            "Headers:",
            Object.fromEntries(response.headers.entries())
          );
          const responseBody = await response.clone().text();
          console.log("Body:", responseBody);

          const newResponse = new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: corsHeaders,
          });

          return newResponse;
        } catch (error) {
          console.error("[tRPC Server] Handler error:", error);
          if (error instanceof Error) {
            console.error("[tRPC Server] Error stack:", error.stack);
          }

          return new Response(
            JSON.stringify({
              error: "Internal Server Error",
              details: error instanceof Error ? error.message : String(error),
            }),
            {
              status: 500,
              headers: corsHeaders,
            }
          );
        }
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
