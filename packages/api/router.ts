import { initTRPC } from "@trpc/server";
import { z } from "zod";
import type { User, Tweet, PaginatedResponse } from "./types";

// Input schemas
export const createUserSchema = z.object({
  id: z.string(), // Privy DID
  authType: z.string(),
  twitter: z.object({
    subject: z.string(),
    username: z.string(),
    name: z.string(),
    profilePictureUrl: z.string(),
    firstVerifiedAt: z.string().transform((str) => new Date(str)),
    latestVerifiedAt: z.string().transform((str) => new Date(str)),
  }),
  wallet: z.object({
    address: z.string(),
    walletClient: z.string(),
  }),
});

export const createTweetSchema = z.object({
  content: z.string().min(1).max(280),
  userId: z.string(), // Privy DID of the user
});

export const paginationSchema = z.object({
  limit: z.number().min(1).max(100).default(20),
  cursor: z.string().optional(),
});

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
});

// Export type router type signature
export type AppRouter = typeof router;
