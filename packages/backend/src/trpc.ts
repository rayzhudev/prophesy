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
        });
        console.log("Created user:", user);
        return user;
      } catch (error) {
        console.error("Error creating user:", error);
        throw error;
      }
    }),

  getUsers: t.procedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findMany();
  }),

  createTweet: t.procedure
    .input(createTweetSchema)
    .mutation(async ({ ctx, input }) => {
      console.log("=== Create Tweet Debug ===");
      console.log("Raw input received:", input);
      console.log("Input type:", typeof input);
      console.log("Input keys:", Object.keys(input || {}));
      console.log("Content:", input?.content);
      console.log("=== End Tweet Debug ===");

      if (!input?.content) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Content is required",
        });
      }

      try {
        const tweet = await ctx.prisma.tweet.create({
          data: {
            content: input.content,
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

  getTweets: t.procedure.query(async ({ ctx }) => {
    return ctx.prisma.tweet.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  }),
});

export type { AppRouter };
