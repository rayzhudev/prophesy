import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";
import { createUserSchema } from "@prophesy/api";
import { protectedProcedure } from "../middleware.js";
import { tweetContentSchema } from "../schemas.js";

export const protectedProcedures = {
  createUser: protectedProcedure
    .input(createUserSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify that the user is creating their own account
      if (input.id !== ctx.auth?.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only create an account for yourself",
        });
      }

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
          // Update Twitter account details
          await ctx.prisma.twitterAccount.update({
            where: { userId: existingUser.id },
            data: {
              username: input.twitter.username,
              name: input.twitter.name,
              profilePictureUrl: input.twitter.profilePictureUrl,
              latestVerifiedAt: new Date(input.twitter.latestVerifiedAt),
            },
          });

          return {
            ...existingUser,
            twitter: {
              ...existingUser.twitter,
              username: input.twitter.username,
              name: input.twitter.name,
              profilePictureUrl: input.twitter.profilePictureUrl,
              latestVerifiedAt: new Date(input.twitter.latestVerifiedAt),
            },
          };
        }

        // Create all in a transaction to ensure consistency
        return await ctx.prisma.$transaction(async (tx) => {
          // Create user
          const user = await tx.user.create({
            data: {
              id: input.id,
              authType: input.authType,
            },
          });

          // Create TwitterAccount
          await tx.twitterAccount.create({
            data: {
              userId: user.id,
              twitterId: input.twitter.subject,
              username: input.twitter.username,
              name: input.twitter.name,
              profilePictureUrl: input.twitter.profilePictureUrl,
              firstVerifiedAt: new Date(input.twitter.firstVerifiedAt),
              latestVerifiedAt: new Date(input.twitter.latestVerifiedAt),
            },
          });

          // Create Wallet
          await tx.wallet.create({
            data: {
              userId: user.id,
              address: input.wallet.address,
              walletType: input.wallet.walletClient,
            },
          });

          // Return complete user
          return tx.user.findUniqueOrThrow({
            where: { id: user.id },
            include: {
              twitter: true,
              wallet: true,
            },
          });
        });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
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

  getUsers: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findMany({
      include: {
        twitter: true,
        wallet: true,
      },
    });
  }),

  createTweet: protectedProcedure
    .input(
      z.object({
        content: tweetContentSchema,
        userId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify that the user is creating a tweet for themselves
      if (input.userId !== ctx.auth?.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only create tweets for yourself",
        });
      }

      try {
        // Check if user exists and is active
        const user = await ctx.prisma.user.findUnique({
          where: { id: input.userId },
          include: { twitter: true },
        });

        if (!user || !user.twitter) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "User must have a verified Twitter account to tweet",
          });
        }

        return await ctx.prisma.tweet.create({
          data: {
            content: input.content,
            userId: input.userId,
          },
          include: {
            user: {
              include: {
                twitter: true,
              },
            },
          },
        });
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === "P2002") {
            throw new TRPCError({
              code: "CONFLICT",
              message: "This tweet already exists",
            });
          }
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create tweet",
          cause: error,
        });
      }
    }),
};
