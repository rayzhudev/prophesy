import { TRPCError } from "@trpc/server";
import { t } from "./init.js";
import { PrivyClient } from "@privy-io/server-auth";

if (!process.env.PRIVY_APP_ID || !process.env.PRIVY_APP_SECRET) {
  throw new Error("Missing required Privy environment variables");
}

// Initialize Privy client for token verification
const privyClient = new PrivyClient(
  process.env.PRIVY_APP_ID,
  process.env.PRIVY_APP_SECRET
);

// Middleware to verify authentication
const isAuthed = t.middleware(async ({ ctx, next }) => {
  const authHeader = ctx.req.headers.authorization;

  if (!authHeader) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "No authorization header",
    });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "No token provided",
    });
  }

  try {
    const verifiedToken = await privyClient.verifyAuthToken(token);

    return next({
      ctx: {
        ...ctx,
        auth: {
          userId: verifiedToken.userId,
        },
      },
    });
  } catch (error) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid token",
      cause: error,
    });
  }
});

export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);