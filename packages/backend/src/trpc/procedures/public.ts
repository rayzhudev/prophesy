import { z } from "zod";
import { publicProcedure } from "../middleware.js";

const paginationSchema = z.object({
  limit: z.number().min(1).max(100).default(20),
  cursor: z.string().optional(),
});

export const publicProcedures = {
  getTweets: publicProcedure
    .input(paginationSchema)
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input;

      const items = await ctx.prisma.tweet.findMany({
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

  getUserTweets: publicProcedure
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
};
