import { initTRPC } from "@trpc/server";
import {
  createUserSchema,
  createTweetSchema,
} from "@prophesy/api";
import type { AppRouter } from "@prophesy/api";
import { prisma } from "./lib/prisma";

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
      console.log("Backend received create user request:", input);
      try {
        const user = await ctx.prisma.user.create({
          data: input,
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
      return ctx.prisma.tweet.create({
        data: input,
      });
    }),
});

export type { AppRouter };
