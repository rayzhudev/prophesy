import express from "express";
import cors from "cors";
import * as trpcExpress from "@trpc/server/adapters/express";
import { router } from "./trpc.js";
import { createContext } from "./trpc.js";
import { PORT, ALLOWED_ORIGINS } from "./constants.js";

const app = express();

// CORS configuration
app.use(
  cors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void
    ) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin as any)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Health check endpoint
app.get("/", (_req, res) => {
  res.json({ status: "healthy" });
});

// tRPC middleware
app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router,
    createContext,
  })
);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
