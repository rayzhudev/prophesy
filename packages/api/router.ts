import { initTRPC } from "@trpc/server";
import { z } from "zod";
import type { User, Tweet } from "./types";
import type { PaginatedResponse, TwitterFollowersResponse } from "./responses";
import {
  createUserSchema,
  createTweetSchema,
  paginationSchema,
  getTwitterFollowersSchema,
} from "./schemas";

// Initialize tRPC
const t = initTRPC.create();

// Create router type
export const router = t.router({
  createUser: t.procedure.input(createUserSchema).mutation(() => {
    return {} as User;
  }),
  getUsers: t.procedure.query(() => {
    return [] as User[];
  }),
  createTweet: t.procedure.input(createTweetSchema).mutation(() => {
    return {} as Tweet;
  }),
  getTweets: t.procedure.input(paginationSchema).query(() => {
    return {
      items: [] as Tweet[],
      nextCursor: undefined,
    } as PaginatedResponse<Tweet>;
  }),
  getTwitterFollowers: t.procedure
    .input(getTwitterFollowersSchema)
    .mutation(() => {
      return {} as TwitterFollowersResponse;
    }),
});

// Export type router type signature
export type AppRouter = typeof router;
