import { TRPCError } from "@trpc/server";
import type { TwitterFollowersResponse } from "@prophesy/api";
import { getTwitterFollowersSchema } from "@prophesy/api/";
import { protectedProcedure } from "../../middleware.js";

export const twitterProcedures = {
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
