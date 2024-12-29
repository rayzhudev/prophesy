import { initTRPC } from "@trpc/server";
import { createUserSchema, createTweetSchema } from "@prophesy/api";
import type { AppRouter } from "@prophesy/api";
import { prisma } from "../lib/prisma.js";
import { TRPCError } from "@trpc/server";

// Context type definition
export interface Context {
  prisma: typeof prisma;
}

export const createContext = async (): Promise<Context> => {
  return {
    prisma,
  };
};

const t = initTRPC.context<Context>().create();

export const router = t.router({
  createUser: t.procedure
    .input(createUserSchema)
    .mutation(async ({ ctx, input }) => {
      console.log("=== tRPC Router Debug ===");
      console.log("Raw input received:", input);
      console.log("Input type:", typeof input);
      console.log("Input keys:", Object.keys(input || {}));
      console.log("=== End Router Debug ===");

      try {
        const user = await ctx.prisma.user.create({
          data: {
            username: input.username,
            email: input.email,
            password: input.password,
          },
          include: { tweets: true },
        });
        console.log("Created user:", user);
        return user;
      } catch (error) {
        console.error("Error creating user:", error);
        throw error;
      }
    }),

  getUsers: t.procedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findMany({
      include: {
        tweets: true,
      },
    });
  }),

  createTweet: t.procedure
    .input(createTweetSchema)
    .mutation(async ({ ctx, input }) => {
      console.log("=== Create Tweet Debug ===");
      console.log("Raw input received:", input);
      console.log("Input type:", typeof input);
      console.log("Input keys:", Object.keys(input || {}));
      console.log("Content:", input?.content);
      console.log("UserId:", input?.userId);
      console.log("=== End Tweet Debug ===");

      if (!input?.content || !input?.userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Content and userId are required",
        });
      }

      try {
        const tweet = await ctx.prisma.tweet.create({
          data: {
            content: input.content,
            userId: input.userId,
          },
          include: {
            user: true,
          },
        });
        console.log("Created tweet:", tweet);
        return tweet;
      } catch (error) {
        console.error("Error creating tweet:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create tweet",
          cause: error,
        });
      }
    }),
});

export type { AppRouter };
