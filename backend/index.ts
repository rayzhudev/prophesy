import { PORT, PRODUCTION_DOMAIN, ALLOWED_ORIGINS } from "./constants";

Bun.serve({
  port: PORT,
  hostname: "0.0.0.0",
  async fetch(req) {
    const origin = req.headers.get("Origin");
    const corsHeaders = {
      "Access-Control-Allow-Origin":
        origin && ALLOWED_ORIGINS.includes(origin) ? origin : PRODUCTION_DOMAIN,
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // Handle CORS preflight
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      const url = new URL(req.url);

      // Root endpoint
      if (url.pathname === "/" && req.method === "GET") {
        return Response.json(
          { message: "Hello from Bun!" },
          { headers: corsHeaders }
        );
      }

      // Submit text endpoint
      if (url.pathname === "/submit-text" && req.method === "POST") {
        const data = await req.json();
        const spacedText = data.text.split("").join(" ");
        console.log("Received text:", data.text);
        console.log("Spaced text:", spacedText);
        return Response.json(
          { success: true, text: spacedText },
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
