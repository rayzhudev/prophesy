import { initTRPC } from "@trpc/server";
import { createUserSchema, createTweetSchema } from "@prophesy/api";
import type { AppRouter } from "@prophesy/api";
import { prisma } from "../lib/prisma.js";
import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";

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

const paginationSchema = z.object({
  limit: z.number().min(1).max(100).default(20),
  cursor: z.string().optional(),
});

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
        // First check if user exists
        const existingUser = await ctx.prisma.user.findUnique({
          where: { id: input.id },
          include: {
            twitter: true,
            wallet: true,
          },
        });

        if (existingUser) {
          console.log("User already exists:", existingUser);
          return existingUser;
        }

        // Create all in a transaction to ensure consistency
        const result = await ctx.prisma.$transaction(async (tx) => {
          // Create user
          const userData: Prisma.UserUncheckedCreateInput = {
            id: input.id,
            authType: input.authType,
          };
          const user = await tx.user.create({ data: userData });

          // Create TwitterAccount
          const twitterData: Prisma.TwitterAccountUncheckedCreateInput = {
            userId: user.id,
            twitterId: input.twitter.subject,
            username: input.twitter.username,
            name: input.twitter.name,
            profilePictureUrl: input.twitter.profilePictureUrl,
            firstVerifiedAt: new Date(input.twitter.firstVerifiedAt),
            latestVerifiedAt: new Date(input.twitter.latestVerifiedAt),
          };
          await tx.twitterAccount.create({ data: twitterData });

          // Create Wallet
          const walletData: Prisma.WalletUncheckedCreateInput = {
            userId: user.id,
            address: input.wallet.address,
            walletType: input.wallet.walletClient,
          };
          await tx.wallet.create({ data: walletData });

          // Return complete user
          return tx.user.findUniqueOrThrow({
            where: { id: user.id },
            include: {
              twitter: true,
              wallet: true,
            },
          });
        });

        console.log("Created user:", result);
        return result;
      } catch (error) {
        console.error("Error creating user:", error);

        // Handle specific Prisma errors
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          // P2002 is the error code for unique constraint violations
          if (error.code === "P2002") {
            throw new TRPCError({
              code: "CONFLICT",
              message: "User already exists with this ID or credentials",
            });
          }
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create user",
          cause: error,
        });
      }
    }),

  getUsers: t.procedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findMany({
      include: {
        twitter: true,
        wallet: true,
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
      console.log("=== End Tweet Debug ===");

      if (!input?.content || !input?.userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Content and userId are required",
        });
      }

      try {
        const tweetData: Prisma.TweetUncheckedCreateInput = {
          content: input.content,
          userId: input.userId,
        };

        const tweet = await ctx.prisma.tweet.create({
          data: tweetData,
          include: {
            user: {
              include: {
                twitter: true,
              },
            },
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

  getTweets: t.procedure
    .input(paginationSchema)
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input;

      const items = await ctx.prisma.tweet.findMany({
        take: limit + 1, // take an extra item to determine if there are more items
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: {
            include: {
              twitter: true,
            },
          },
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem!.id;
      }

      return {
        items,
        nextCursor,
      };
    }),

  getUserTweets: t.procedure
    .input(
      z.object({
        userId: z.string(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { userId, limit, cursor } = input;

      const items = await ctx.prisma.tweet.findMany({
        where: {
          userId,
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: {
            include: {
              twitter: true,
            },
          },
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem!.id;
      }

      return {
        items,
        nextCursor,
      };
    }),
});

export type { AppRouter };
