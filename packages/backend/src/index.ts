import express from "express";
import type { Request, Response, NextFunction } from "express";
import * as trpcExpress from "@trpc/server/adapters/express";
import { router } from "./trpc.js";
import { PORT, isOriginAllowed, FRONTEND_API_KEY } from "./constants.js";
import { createContext } from "./trpc.js";
import cors from "cors";

// Initialize Express app
const app = express();

// CORS configuration
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    console.log("[CORS] Request origin:", origin);
    if (!origin || !isOriginAllowed(origin)) {
      callback(new Error("Not allowed by CORS"));
      return;
    }
    callback(null, true);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-TRPC", "X-API-Key"],
  credentials: true,
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

// Use CORS middleware first
app.use(cors(corsOptions));

// Error handling for CORS
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err.message === "Not allowed by CORS") {
    res.status(403).json({ error: "Origin not allowed" });
  } else {
    next(err);
  }
});

// Body parsing middleware
app.use(express.json());

// API Key validation middleware
app.use(((req: Request, res: Response, next: NextFunction) => {
  // Skip API key check for CORS preflight
  if (req.method === "OPTIONS") {
    return next();
  }

  const apiKey = req.headers["x-api-key"];
  if (!apiKey || apiKey !== FRONTEND_API_KEY) {
    return res.status(403).json({ error: "Invalid API key" });
  }

  next();
}) as express.RequestHandler);

// Request logging middleware
app.use((req: Request, res: Response, next) => {
  const start = Date.now();

  // Log request details
  console.log("\n[tRPC Server] Incoming Request:");
  console.log(`URL: http://localhost:${PORT}${req.originalUrl}`);
  console.log(`Method: ${req.method}`);
  console.log("Headers:", req.headers);
  console.log(`Pathname: ${req.path}`);
  console.log("Search Params:", req.query);
  if (req.method !== "GET") {
    console.log("Raw Body:", req.body);
    try {
      const parsedBody =
        typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      console.log("Parsed Body:", JSON.stringify(parsedBody, null, 2));
    } catch (error) {
      console.log("Could not parse body");
    }
  }

  // Capture response details
  const oldJson = res.json;
  res.json = function (body) {
    console.log("\n[tRPC Server] Response:");
    console.log(`Status: ${res.statusCode}`);
    console.log("Headers:", JSON.stringify(res.getHeaders(), null, 2));
    console.log("Body:", JSON.stringify(body, null, 2));
    console.log(`Duration: ${Date.now() - start}ms\n`);
    return oldJson.call(this, body);
  };

  next();
});

// tRPC handler
app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router,
    createContext,
  })
);

// Root endpoint
app.get("/", (req: Request, res: Response) => {
  res.send("Hello from Express with tRPC!");
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Start the server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
