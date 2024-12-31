import { TRPCError } from "@trpc/server";
import { t } from "../init.js";
import { rateLimiter } from "./rate-limiter.js";

export const withRateLimit = t.middleware(async ({ ctx, next }) => {
  const userId = ctx.auth?.userId || "anonymous";

  if (rateLimiter.isLimited(userId)) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: "Rate limit exceeded. Please try again later.",
    });
  }

  return next();
});

export const isAuthed = t.middleware(({ next, ctx }) => {
  if (!ctx.auth?.userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to perform this action",
    });
  }

  return next({
    ctx: {
      ...ctx,
      auth: ctx.auth,
    },
  });
});

// Create a protected procedure with rate limiting
export const protectedProcedure = t.procedure.use(isAuthed).use(withRateLimit);
