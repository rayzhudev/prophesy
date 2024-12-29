import express from "express";
import type { Request, Response } from "express";
import * as trpcExpress from "@trpc/server/adapters/express";
import { router } from "./trpc.js";
import { PORT, isOriginAllowed } from "./constants.js";
import { createContext } from "./trpc.js";
import { TRPCError } from "@trpc/server";
import cors from "cors";

// Initialize Express app
const app = express();

// CORS configuration
const corsOptions: cors.CorsOptions = {
  origin: (origin: string | undefined, callback) => {
    if (!origin) {
      callback(null, false); // Reject the request without throwing an error
      return;
    }

    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(null, false); // Reject the request without throwing an error
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-TRPC"],
  credentials: true,
  maxAge: 86400,
};

// Use CORS middleware
app.use(cors(corsOptions));

// Error handler for CORS preflight
app.use((err: any, req: Request, res: Response, next: Function) => {
  if (err.name === "CORSError") {
    res.status(403).json({
      error: "Access Denied",
      message:
        "This API endpoint is not publicly accessible",
    });
  } else {
    next(err);
  }
});

// Body parsing middleware
app.use(express.json());

// Request logging middleware
app.use((req: Request, res: Response, next) => {
  const start = Date.now();

  // Log request details
  console.log("\n[tRPC Server] Incoming Request:");
  console.log(`URL: http://localhost:${PORT}${req.originalUrl}`);
  console.log(`Method: ${req.method}`);
  console.log("Headers:", JSON.stringify(req.headers, null, 2));
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
    createContext: async ({
      req,
      res,
    }: trpcExpress.CreateExpressContextOptions) => {
      return createContext();
    },
  })
);

// Root endpoint
app.get("/", (req: Request, res: Response) => {
  res.send("Hello from Express with tRPC!");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
