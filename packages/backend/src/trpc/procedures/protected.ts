import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";
import type { TwitterFollowersResponse } from "@prophesy/api";
import {
  createUserSchema,
  createTweetSchema,
  getTwitterFollowersSchema,
} from "@prophesy/api/";
import { protectedProcedure } from "../middleware.js";

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
        // Create or update user and related data in a transaction
        return await ctx.prisma.$transaction(async (tx) => {
          // Check if user exists
          const existingUser = await tx.user.findUnique({
            where: { id: input.id },
            include: {
              twitter: true,
              wallets: true,
            },
          });

          // Create or update user
          const user = existingUser
            ? await tx.user.update({
                where: { id: input.id },
                data: { authType: input.authType },
              })
            : await tx.user.create({
                data: {
                  id: input.id,
                  authType: input.authType,
                },
              });

          // Handle Twitter account
          if (input.twitter) {
            if (existingUser?.twitter) {
              await tx.twitterAccount.update({
                where: { userId: user.id },
                data: {
                  username: input.twitter.username,
                  name: input.twitter.name,
                  profilePictureUrl: input.twitter.profilePictureUrl,
                  ...(input.twitter.latestVerifiedAt && {
                    latestVerifiedAt: input.twitter.latestVerifiedAt,
                  }),
                },
              });
            } else {
              await tx.twitterAccount.create({
                data: {
                  userId: user.id,
                  twitterId: input.twitter.subject,
                  username: input.twitter.username,
                  name: input.twitter.name,
                  profilePictureUrl: input.twitter.profilePictureUrl,
                  ...(input.twitter.firstVerifiedAt && {
                    firstVerifiedAt: input.twitter.firstVerifiedAt,
                  }),
                  ...(input.twitter.latestVerifiedAt && {
                    latestVerifiedAt: input.twitter.latestVerifiedAt,
                  }),
                },
              });
            }
          }

          // Handle wallets
          if (input.wallets?.length > 0) {
            for (const wallet of input.wallets) {
              // Check if wallet exists in database
              const existingWallet = await tx.wallet.findUnique({
                where: { address: wallet.address },
              });

              if (existingWallet) {
                // Update existing wallet
                await tx.wallet.update({
                  where: { id: existingWallet.id },
                  data: {
                    walletType: wallet.walletType,
                    walletClientType: wallet.walletClientType,
                  },
                });
              } else {
                // Create new wallet
                await tx.wallet.create({
                  data: {
                    userId: user.id,
                    address: wallet.address,
                    walletType: wallet.walletType,
                    walletClientType: wallet.walletClientType,
                  },
                });
              }
            }
          }

          // Return complete user
          return tx.user.findUniqueOrThrow({
            where: { id: user.id },
            include: {
              twitter: true,
              wallets: true,
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
        wallets: true,
      },
    });
  }),

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

  getTwitterFollowers: protectedProcedure
    .input(getTwitterFollowersSchema)
    .mutation(async ({ ctx, input }): Promise<TwitterFollowersResponse> => {
      console.log("Fetching Twitter followers for user:", input.userId);

      try {
        // Get the user's Twitter ID from the database
        const twitterAccount = await ctx.prisma.twitterAccount.findFirst({
          where: { userId: input.userId },
        });

        if (!twitterAccount) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Twitter account not found",
          });
        }

        // Fetch user data from Twitter API
        const response = await fetch(
          `https://api.twitter.com/2/users/${twitterAccount.twitterId}?user.fields=public_metrics`,
          {
            headers: {
              Authorization: `Bearer ${input.accessToken}`,
            },
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Twitter API Error:", {
            status: response.status,
            statusText: response.statusText,
            error: errorText,
          });

          if (response.status === 429) {
            throw new TRPCError({
              code: "TOO_MANY_REQUESTS",
              message: "Twitter API rate limit exceeded",
            });
          }

          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Twitter API error: ${response.statusText}`,
          });
        }

        const data = await response.json();
        console.log("Twitter API Response:", JSON.stringify(data, null, 2));

        if (!data.data?.public_metrics) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Invalid response from Twitter API",
          });
        }

        // Update metrics in the database
        const metrics = data.data.public_metrics;
        await ctx.prisma.twitterAccount.update({
          where: { id: twitterAccount.id },
          data: {
            followersCount: metrics.followers_count ?? 0,
            followingCount: metrics.following_count ?? 0,
            tweetCount: metrics.tweet_count ?? 0,
            listedCount: metrics.listed_count ?? 0,
            likeCount: metrics.like_count ?? 0,
            mediaCount: metrics.media_count ?? 0,
            lastMetricsFetch: new Date(),
          },
        });

        // Fetch updated account to return latest metrics
        const updatedAccount =
          await ctx.prisma.twitterAccount.findUniqueOrThrow({
            where: { id: twitterAccount.id },
          });

        return {
          followersCount: updatedAccount.followersCount ?? 0,
          followingCount: updatedAccount.followingCount ?? 0,
          tweetCount: updatedAccount.tweetCount ?? 0,
          listedCount: updatedAccount.listedCount ?? 0,
          likeCount: updatedAccount.likeCount ?? 0,
          mediaCount: updatedAccount.mediaCount ?? 0,
          lastFetched: updatedAccount.lastMetricsFetch,
        };
      } catch (error) {
        console.error("Error fetching Twitter followers:", error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch Twitter followers",
          cause: error,
        });
      }
    }),
};
