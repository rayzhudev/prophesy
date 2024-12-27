import { initTRPC } from "@trpc/server";
import { createUserSchema, createTweetSchema } from "@prophesy/api";
import type { AppRouter } from "@prophesy/api";
import { prisma } from "./lib/prisma";

export interface Context {
  prisma: typeof prisma;
}

export const createContext = async (): Promise<Context> => {
  return { prisma };
};

const t = initTRPC.context<Context>().create();

export const appRouter = t.router({
  createUser: t.procedure.input(createUserSchema).mutation(({ ctx, input }) =>
    ctx.prisma.user.create({
      data: input,
      include: { tweets: true },
    })
  ),

  getUsers: t.procedure.query(({ ctx }) =>
    ctx.prisma.user.findMany({
      include: { tweets: true },
    })
  ),

  createTweet: t.procedure.input(createTweetSchema).mutation(({ ctx, input }) =>
    ctx.prisma.tweet.create({
      data: input,
    })
  ),
});

export type { AppRouter };
