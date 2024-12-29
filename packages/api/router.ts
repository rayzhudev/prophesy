import { initTRPC } from "@trpc/server";
import { z } from "zod";
import type { User, Tweet } from "./types";

// Input schemas
export const textInputSchema = z.object({
  text: z.string().min(1),
});

export const createUserSchema = z.object({
  username: z.string(),
  email: z.string().email(),
  password: z.string(),
});

export const createTweetSchema = z.object({
  content: z.string().min(1),
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
  getTweets: t.procedure.query(() => {
    return [] as Tweet[];
  }),
});

// Export type router type signature
export type AppRouter = typeof router;
