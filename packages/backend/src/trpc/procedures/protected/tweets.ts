import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";
import { createTweetSchema } from "@prophesy/api/";
import { protectedProcedure } from "../../middleware.js";

export const tweetProcedures = {
  createTweet: protectedProcedure
    .input(createTweetSchema)
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
